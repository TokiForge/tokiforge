import type { DesignTokens, TokenValue } from './types';
import { TokenParser } from './TokenParser';
import { ColorUtils } from './ColorUtils';

export interface HoverInfo {
  value: string | number;
  type?: string;
  description?: string;
  path: string;
  preview?: string;
}

export interface CompletionItem {
  label: string;
  detail?: string;
  documentation?: string;
  insertText?: string;
  kind: 'color' | 'dimension' | 'token';
}

export interface TokenDefinition {
  path: string;
  range: {
    start: { line: number; character: number };
    end: { line: number; character: number };
  };
}

export class IDESupport {
  private tokens: DesignTokens = {};
  private tokenMap: Map<string, { path: string; token: TokenValue }> = new Map();

  loadTokens(tokens: DesignTokens): void {
    this.tokens = tokens;
    this.buildTokenMap();
  }

  loadTokensFromFile(filePath: string): void {
    this.tokens = TokenParser.parse(filePath);
    this.buildTokenMap();
  }

  getHoverInfo(tokenPath: string): HoverInfo | null {
    const entry = this.tokenMap.get(tokenPath);
    if (!entry) {
      return null;
    }

    const token = entry.token;
    const value = this.getTokenValue(token);
    const preview = this.generatePreview(token, value);

    return {
      value,
      type: token.type,
      description: token.description,
      path: entry.path,
      preview,
    };
  }

  getCompletions(prefix: string = ''): CompletionItem[] {
    const completions: CompletionItem[] = [];
    const prefixLower = prefix.toLowerCase();

    for (const [path, entry] of this.tokenMap.entries()) {
      if (prefixLower === '' || path.toLowerCase().includes(prefixLower)) {
        const token = entry.token;
        const value = this.getTokenValue(token);

        completions.push({
          label: path,
          detail: String(value),
          documentation: token.description || `Token: ${path}`,
          insertText: path,
          kind: this.getCompletionKind(token),
        });
      }
    }

    return completions.sort((a, b) => a.label.localeCompare(b.label));
  }

  findDefinitions(query: string): TokenDefinition[] {
    const definitions: TokenDefinition[] = [];

    for (const [path, entry] of this.tokenMap.entries()) {
      if (path.includes(query) || query.includes(path)) {
        definitions.push({
          path: entry.path,
          range: {
            start: { line: 0, character: 0 },
            end: { line: 0, character: 0 },
          },
        });
      }
    }

    return definitions;
  }

  getTokenSuggestions(context: string): CompletionItem[] {
    const suggestions: CompletionItem[] = [];
    const contextLower = context.toLowerCase();

    for (const [path, entry] of this.tokenMap.entries()) {
      const token = entry.token;
      const tokenType = token.type || '';
      const component = token.component || '';
      const scope = token.scope || '';

      if (
        contextLower.includes(tokenType) ||
        contextLower.includes(component) ||
        contextLower.includes(scope) ||
        path.includes(contextLower)
      ) {
        suggestions.push({
          label: path,
          detail: String(this.getTokenValue(token)),
          documentation: token.description,
          insertText: path,
          kind: this.getCompletionKind(token),
        });
      }
    }

    return suggestions.slice(0, 10);
  }

  generateTokenDocumentation(tokenPath: string): string {
    const entry = this.tokenMap.get(tokenPath);
    if (!entry) {
      return '';
    }

    const token = entry.token;
    const value = this.getTokenValue(token);
    const lines: string[] = [];

    lines.push(`**${tokenPath}**`);
    lines.push('');
    lines.push(`Value: \`${value}\``);
    if (token.type) {
      lines.push(`Type: \`${token.type}\``);
    }
    if (token.description) {
      lines.push(`Description: ${token.description}`);
    }
    if (token.deprecated) {
      lines.push(`⚠️ Deprecated`);
    }
    if (token.component) {
      lines.push(`Component: \`${token.component}\``);
    }
    if (token.scope) {
      lines.push(`Scope: \`${token.scope}\``);
    }

    return lines.join('\n');
  }

  private buildTokenMap(): void {
    this.tokenMap.clear();
    this.traverseTokens(this.tokens);
  }

  private traverseTokens(obj: DesignTokens, path: string = ''): void {
    for (const key in obj) {
      const currentPath = path ? `${path}.${key}` : key;
      const value = obj[key];

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        if ('value' in value || '$value' in value || '$alias' in value) {
          const token = value as TokenValue;
          this.tokenMap.set(currentPath, { path: currentPath, token });
        } else {
          this.traverseTokens(value as DesignTokens, currentPath);
        }
      }
    }
  }

  private getTokenValue(token: TokenValue): string | number {
    if (typeof token.value === 'string' || typeof token.value === 'number') {
      return token.value;
    }
    if (token.$value && (typeof token.$value === 'string' || typeof token.$value === 'number')) {
      return token.$value;
    }
    return '';
  }

  private generatePreview(token: TokenValue, value: string | number): string {
    if (token.type === 'color' && typeof value === 'string') {
      const rgb = ColorUtils.hexToRgb(value);
      if (rgb) {
        return `Color: ${value} (rgb(${rgb.r}, ${rgb.g}, ${rgb.b}))`;
      }
    }
    if (token.type === 'dimension' && typeof value === 'string') {
      return `Dimension: ${value}`;
    }
    return String(value);
  }

  private getCompletionKind(token: TokenValue): 'color' | 'dimension' | 'token' {
    if (token.type === 'color') return 'color';
    if (token.type === 'dimension') return 'dimension';
    return 'token';
  }
}

