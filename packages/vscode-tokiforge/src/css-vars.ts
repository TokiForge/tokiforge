import * as vscode from 'vscode';
import { parse } from 'jsonc-parser';

export interface CssVarEntry {
  /** Variable name including leading dashes, e.g. --hf-color-primary */
  name: string;
  value: string;
  type?: string;
  /** Token file the variable came from */
  source: vscode.Uri;
}

/**
 * Flatten a token tree to CSS variable names using the same convention as
 * @tokiforge/core's TokenExporter.flattenTokens: full path, lowercased,
 * dots become dashes, `--<prefix>-` prefix.
 */
function flattenToCssVars(
  obj: unknown,
  prefix: string,
  source: vscode.Uri,
  parent = ''
): CssVarEntry[] {
  const out: CssVarEntry[] = [];
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return out;

  const node = obj as Record<string, unknown>;

  for (const key of Object.keys(node)) {
    const value = node[key];
    if (!value || typeof value !== 'object' || Array.isArray(value)) continue;

    const child = value as Record<string, unknown>;
    const fullKey = parent ? `${parent}-${key}` : key;

    if ('value' in child) {
      const tokenValue = child.value;
      const type = typeof child.type === 'string' ? child.type : undefined;
      const name = `--${prefix}-${fullKey}`.toLowerCase().replace(/\./g, '-');

      if (typeof tokenValue === 'string' || typeof tokenValue === 'number') {
        out.push({ name, value: String(tokenValue), type, source });
      } else if (tokenValue && typeof tokenValue === 'object' && !Array.isArray(tokenValue)) {
        const composite = tokenValue as Record<string, unknown>;
        if ('default' in composite) {
          out.push({ name, value: String(composite.default), type, source });
        } else {
          for (const part of Object.keys(composite)) {
            const partValue = composite[part];
            if (typeof partValue === 'string' || typeof partValue === 'number') {
              out.push({
                name: `${name}-${part.toLowerCase()}`,
                value: String(partValue),
                type,
                source,
              });
            }
          }
        }
      }
    } else {
      out.push(...flattenToCssVars(child, prefix, source, fullKey));
    }
  }

  return out;
}

/**
 * Indexes the workspace's token files into CSS variable entries, refreshed
 * when token files change.
 */
export class CssVarIndex {
  private entries: CssVarEntry[] = [];
  private dirty = true;
  private watcher: vscode.FileSystemWatcher | null = null;

  constructor(private readonly context: vscode.ExtensionContext) {
    const pattern = this.tokenFilePattern();
    this.watcher = vscode.workspace.createFileSystemWatcher(pattern);
    this.watcher.onDidChange(() => (this.dirty = true));
    this.watcher.onDidCreate(() => (this.dirty = true));
    this.watcher.onDidDelete(() => (this.dirty = true));
    context.subscriptions.push(this.watcher);

    context.subscriptions.push(
      vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration('tokiforge')) this.dirty = true;
      })
    );
  }

  private tokenFilePattern(): string {
    return (
      vscode.workspace
        .getConfiguration('tokiforge')
        .get<string>('tokenFilePattern') ?? '**/{tokens,tokens.*,theme,toki,tokiforge}.json'
    );
  }

  private cssVarPrefix(): string {
    return vscode.workspace.getConfiguration('tokiforge').get<string>('cssVarPrefix') ?? 'hf';
  }

  async getEntries(): Promise<CssVarEntry[]> {
    if (!this.dirty) return this.entries;

    const prefix = this.cssVarPrefix();
    const files = await vscode.workspace.findFiles(this.tokenFilePattern(), '**/node_modules/**', 25);
    const all: CssVarEntry[] = [];

    for (const file of files) {
      try {
        const bytes = await vscode.workspace.fs.readFile(file);
        const raw = parse(new TextDecoder().decode(bytes), [], { allowTrailingComma: true });
        if (raw && typeof raw === 'object') {
          all.push(...flattenToCssVars(raw, prefix, file));
        }
      } catch {
        // Skip unreadable/invalid files; diagnostics already flag them
      }
    }

    // Dedupe by name, first file wins
    const seen = new Set<string>();
    this.entries = all.filter((e) => {
      if (seen.has(e.name)) return false;
      seen.add(e.name);
      return true;
    });
    this.dirty = false;
    return this.entries;
  }
}

const STYLE_LANGUAGES = [
  'css',
  'scss',
  'less',
  'postcss',
  'html',
  'vue',
  'svelte',
  'astro',
  'javascript',
  'javascriptreact',
  'typescript',
  'typescriptreact',
];

const COLOR_TYPES = new Set(['color']);

function isColorEntry(entry: CssVarEntry): boolean {
  return (
    (entry.type !== undefined && COLOR_TYPES.has(entry.type)) ||
    /^#([0-9a-fA-F]{3,8})$/.test(entry.value) ||
    /^(rgb|hsl)a?\(/i.test(entry.value)
  );
}

export function registerCssVarProviders(context: vscode.ExtensionContext): void {
  const index = new CssVarIndex(context);
  const selector: vscode.DocumentSelector = STYLE_LANGUAGES.map((language) => ({
    scheme: 'file',
    language,
  }));

  const completion = vscode.languages.registerCompletionItemProvider(
    selector,
    {
      async provideCompletionItems(doc, pos) {
        if (!vscode.workspace.getConfiguration('tokiforge').get<boolean>('enable')) return [];

        const before = doc.lineAt(pos.line).text.slice(0, pos.character);
        // Only fire while typing a custom property, ideally inside var()
        if (!/(?:var\(\s*|[^-])--[\w-]*$/.test(before) && !/--$/.test(before)) return [];

        const entries = await index.getEntries();
        const replaceStart = before.lastIndexOf('--');
        const range = new vscode.Range(pos.line, replaceStart, pos.line, pos.character);

        return entries.map((entry) => {
          const item = new vscode.CompletionItem(
            entry.name,
            isColorEntry(entry) ? vscode.CompletionItemKind.Color : vscode.CompletionItemKind.Variable
          );
          item.detail = entry.type ? `${entry.type}: ${entry.value}` : entry.value;
          // VS Code renders a swatch for Color items whose documentation is a color string
          item.documentation = isColorEntry(entry) ? entry.value : undefined;
          item.range = range;
          item.insertText = entry.name;
          return item;
        });
      },
    },
    '-'
  );

  const hover = vscode.languages.registerHoverProvider(selector, {
    async provideHover(doc, pos) {
      if (!vscode.workspace.getConfiguration('tokiforge').get<boolean>('enable')) return null;

      const wordRange = doc.getWordRangeAtPosition(pos, /--[\w-]+/);
      if (!wordRange) return null;

      const name = doc.getText(wordRange);
      const entries = await index.getEntries();
      const entry = entries.find((e) => e.name === name);
      if (!entry) return null;

      const md = new vscode.MarkdownString();
      md.appendMarkdown(`**${entry.name}**\n\n`);
      if (entry.type) md.appendMarkdown(`Type: \`${entry.type}\`\n\n`);
      md.appendMarkdown(`Value: \`${entry.value}\`\n\n`);
      md.appendMarkdown(`_From ${vscode.workspace.asRelativePath(entry.source)}_`);
      return new vscode.Hover(md, wordRange);
    },
  });

  context.subscriptions.push(completion, hover);
}
