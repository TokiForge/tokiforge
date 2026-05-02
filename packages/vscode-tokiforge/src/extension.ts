import * as vscode from 'vscode';
import { parse } from 'jsonc-parser';

const docSelector: vscode.DocumentSelector = [
  { scheme: 'file', language: 'json' },
  { scheme: 'file', language: 'jsonc' },
];

interface LeafToken {
  path: string;
  value: unknown;
  type?: string;
}

function isTokenLeaf(obj: Record<string, unknown>): boolean {
  return 'value' in obj && obj.value !== undefined && ('type' in obj || typeof obj.value === 'string' || typeof obj.value === 'number');
}

function collectLeaves(obj: unknown, prefix = ''): LeafToken[] {
  const out: LeafToken[] = [];
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return out;
  const o = obj as Record<string, unknown>;
  if (isTokenLeaf(o)) {
    out.push({
      path: prefix || 'root',
      value: o.value,
      type: typeof o.type === 'string' ? o.type : undefined,
    });
    return out;
  }
  for (const key of Object.keys(o)) {
    const next = prefix ? `${prefix}.${key}` : key;
    out.push(...collectLeaves(o[key], next));
  }
  return out;
}

function parseTokens(text: string): { leaves: LeafToken[]; error?: string } {
  const raw = parse(text, [], { allowTrailingComma: true });
  if (raw === undefined || raw === null) {
    return { leaves: [], error: 'Invalid JSON or JSONC' };
  }
  return { leaves: collectLeaves(raw) };
}

function isLikelyTokenFile(doc: vscode.TextDocument): boolean {
  return (
    doc.fileName.match(/tokens|theme|toki/i) !== null ||
    doc.uri.fsPath.replace(/\\/g, '/').includes('/token')
  );
}

const HEX_COLOR = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

export function activate(context: vscode.ExtensionContext): void {
  const diagnostics = vscode.languages.createDiagnosticCollection('tokiforge');

  const refreshDiagnostics = (doc: vscode.TextDocument) => {
    const cfg = vscode.workspace.getConfiguration('tokiforge');
    if (!cfg.get<boolean>('enable')) return;
    if (doc.languageId !== 'json' && doc.languageId !== 'jsonc') return;
    if (!doc.fileName.match(/tokens|theme|toki/i) && !doc.uri.fsPath.includes('token')) {
      diagnostics.delete(doc.uri);
      return;
    }

    const text = doc.getText();
    const { leaves, error } = parseTokens(text);
    const diags: vscode.Diagnostic[] = [];

    if (error && leaves.length === 0) {
      const warn = new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, Math.min(120, text.split(/\r?\n/)[0]?.length ?? 1)),
        `TokiForge: could not parse tokens — ${error}`,
        vscode.DiagnosticSeverity.Warning
      );
      warn.source = 'tokiforge';
      diags.push(warn);
    }

    for (const leaf of leaves) {
      if (leaf.type === 'color' && typeof leaf.value === 'string' && !HEX_COLOR.test(leaf.value)) {
        const idx = text.indexOf(JSON.stringify(leaf.value));
        const range =
          idx >= 0
            ? new vscode.Range(doc.positionAt(idx), doc.positionAt(idx + JSON.stringify(leaf.value).length))
            : rangeForPath(doc, text, leaf.path);
        const d = new vscode.Diagnostic(
          range,
          `Invalid color token value "${leaf.value}". Use #RGB, #RRGGBB, or #RRGGBBAA.`,
          vscode.DiagnosticSeverity.Warning
        );
        d.source = 'tokiforge';
        d.code = 'tokiforge-invalid-color';
        diags.push(d);
      }
    }

    diagnostics.set(doc.uri, diags);
  };

  context.subscriptions.push(diagnostics);

  for (const doc of vscode.workspace.textDocuments) {
    refreshDiagnostics(doc);
  }

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((e) => refreshDiagnostics(e.document))
  );
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument((doc) => refreshDiagnostics(doc))
  );

  const hover = vscode.languages.registerHoverProvider(docSelector, {
    provideHover(doc, pos) {
      const cfg = vscode.workspace.getConfiguration('tokiforge');
      if (!cfg.get<boolean>('enable')) return null;
      if (!isLikelyTokenFile(doc)) return null;
      const text = doc.getText();
      const { leaves } = parseTokens(text);
      const leafMap = new Map(leaves.map((l) => [l.path, l]));
      const wordRange = doc.getWordRangeAtPosition(pos, /[\w.-]+/);
      if (!wordRange) return null;
      const tokenPath = doc.getText(wordRange);
      const leaf = leafMap.get(tokenPath);
      if (!leaf) {
        const probe = expandDotPath(doc, text, pos);
        if (probe && leafMap.has(probe)) {
          const l = leafMap.get(probe)!;
          return hoverFromLeaf(probe, l);
        }
        return null;
      }
      return hoverFromLeaf(tokenPath, leaf);
    },
  });

  const completion = vscode.languages.registerCompletionItemProvider(
    docSelector,
    {
      provideCompletionItems(doc, pos) {
        const cfg = vscode.workspace.getConfiguration('tokiforge');
        if (!cfg.get<boolean>('enable')) return [];
        if (!isLikelyTokenFile(doc)) return [];
        const text = doc.getText();
        const { leaves } = parseTokens(text);
        const line = doc.lineAt(pos.line).text;
        const before = line.slice(0, pos.character);
        if (!/"[\w.]*$/.test(before) && !/\$resolve"\s*:\s*"[\w.]*$/.test(before)) {
          return [];
        }
        return leaves.map((l) => {
          const item = new vscode.CompletionItem(l.path, vscode.CompletionItemKind.Value);
          item.detail = l.type ? `${l.type}: ${String(l.value)}` : String(l.value);
          item.insertText = l.path;
          return item;
        });
      },
    },
    '"',
    '.'
  );

  const quickFix = vscode.languages.registerCodeActionsProvider(
    docSelector,
    {
      provideCodeActions(doc, range, ctx) {
        if (!vscode.workspace.getConfiguration('tokiforge').get<boolean>('enable')) return [];
        const actions: vscode.CodeAction[] = [];
        for (const d of ctx.diagnostics) {
          if (String(d.code) !== 'tokiforge-invalid-color') continue;
          const text = doc.getText(d.range);
          const fixed = expandShortHex(text);
          if (fixed && fixed !== text) {
            const fix = new vscode.CodeAction(
              `Normalize color to ${fixed}`,
              vscode.CodeActionKind.QuickFix
            );
            fix.edit = new vscode.WorkspaceEdit();
            fix.edit.replace(doc.uri, d.range, fixed);
            fix.diagnostics = [d];
            fix.isPreferred = true;
            actions.push(fix);
          }
        }
        return actions;
      },
    },
    {
      providedCodeActionKinds: [vscode.CodeActionKind.QuickFix],
    }
  );

  context.subscriptions.push(hover, completion, quickFix);
}

function hoverFromLeaf(path: string, leaf: LeafToken): vscode.Hover {
  const md = new vscode.MarkdownString();
  md.appendMarkdown(`**${path}**\n\n`);
  if (leaf.type) md.appendMarkdown(`Type: \`${leaf.type}\`\n\n`);
  md.appendMarkdown(`Value: \`${JSON.stringify(leaf.value)}\``);
  md.isTrusted = true;
  return new vscode.Hover(md);
}

function expandShortHex(s: string): string | null {
  const m = s.match(/^#([0-9a-fA-F]{3})$/);
  if (!m) return null;
  const x = m[1];
  return `#${x[0]}${x[0]}${x[1]}${x[1]}${x[2]}${x[2]}`.toUpperCase();
}

/** Best-effort: map cursor offset to dotted path inside JSON string values */
function expandDotPath(doc: vscode.TextDocument, text: string, pos: vscode.Position): string | null {
  const offset = doc.offsetAt(pos);
  const i = text.lastIndexOf('"', offset);
  if (i < 0) return null;
  const j = text.indexOf('"', i + 1);
  if (j < 0 || offset > j) return null;
  const inner = text.slice(i + 1, j);
  if (/^[\w.]+$/.test(inner)) return inner;
  return null;
}

function rangeForPath(doc: vscode.TextDocument, fullText: string, path: string): vscode.Range {
  const idx = fullText.indexOf(`"${path}"`);
  if (idx >= 0) {
    const start = doc.positionAt(idx);
    const end = doc.positionAt(idx + path.length + 2);
    return new vscode.Range(start, end);
  }
  return new vscode.Range(0, 0, 0, 1);
}

export function deactivate(): void {}
