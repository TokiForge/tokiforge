import type { DesignTokens, TokenValue } from './types';

interface HoverInfo {
  path: string;
  value: string | number;
  type?: string;
  description?: string;
  deprecated?: boolean;
}

interface Completion {
  label: string;
  kind: string;
  detail?: string;
  documentation?: string;
}

interface Definition {
  path: string;
  value: string | number;
  type?: string;
}

export class IDESupport {
  private tokens: DesignTokens = {};

  loadTokens(tokens: DesignTokens): void {
    this.tokens = tokens;
  }

  loadTokensFromFile(filePath: string): void {
    if (typeof window !== 'undefined') {
      throw new Error('IDESupport.loadTokensFromFile() is not available in browser environments');
    }

    try {
      const { TokenParser } = require('./TokenParser');
      this.tokens = TokenParser.parse(filePath);
    } catch (error) {
      throw new Error(`Failed to load tokens from file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  getHoverInfo(tokenPath: string): HoverInfo | null {
    const token = this.getTokenByPath(tokenPath);
    if (!token) {
      return null;
    }

    const rawValue = token.value ?? token.$value;
    const value = typeof rawValue === 'string' || typeof rawValue === 'number' ? rawValue : '';
    return {
      path: tokenPath,
      value: value || '',
      type: token.type,
      description: token.description,
      deprecated: token.deprecated || token.version?.deprecated !== undefined,
    };
  }

  getCompletions(prefix?: string): Completion[] {
    const completions: Completion[] = [];
    const paths = this.getAllTokenPaths(this.tokens);

    for (const path of paths) {
      if (!prefix || path.startsWith(prefix)) {
        const token = this.getTokenByPath(path);
        if (token) {
          const value = token.value ?? token.$value;
          completions.push({
            label: path,
            kind: 'value',
            detail: typeof value === 'string' ? value : String(value),
            documentation: token.description,
          });
        }
      }
    }

    return completions;
  }

  findDefinitions(query: string): Definition[] {
    const definitions: Definition[] = [];
    const paths = this.getAllTokenPaths(this.tokens);

    for (const path of paths) {
      if (path.includes(query) || path.toLowerCase().includes(query.toLowerCase())) {
        const token = this.getTokenByPath(path);
        if (token) {
          const rawValue = token.value ?? token.$value;
          const value = typeof rawValue === 'string' || typeof rawValue === 'number' ? rawValue : '';
          definitions.push({
            path,
            value: value || '',
            type: token.type,
          });
        }
      }
    }

    return definitions;
  }

  getTokenSuggestions(context: string): Completion[] {
    const suggestions: Completion[] = [];
    const paths = this.getAllTokenPaths(this.tokens);

    const contextLower = context.toLowerCase();
    for (const path of paths) {
      if (path.toLowerCase().includes(contextLower)) {
        const token = this.getTokenByPath(path);
        if (token) {
          const value = token.value ?? token.$value;
          suggestions.push({
            label: path,
            kind: 'value',
            detail: typeof value === 'string' ? value : String(value),
            documentation: token.description,
          });
        }
      }
    }

    return suggestions.slice(0, 10);
  }

  generateTokenDocumentation(tokenPath: string): string {
    const token = this.getTokenByPath(tokenPath);
    if (!token) {
      return `Token "${tokenPath}" not found`;
    }

    const value = token.value ?? token.$value;
    const lines: string[] = [];

    lines.push(`# ${tokenPath}`);
    lines.push('');

    if (token.description) {
      lines.push(token.description);
      lines.push('');
    }

    lines.push(`**Type:** ${token.type || 'custom'}`);
    lines.push(`**Value:** ${value !== undefined ? String(value) : 'N/A'}`);

    if (token.deprecated || token.version?.deprecated) {
      lines.push(`**Status:** Deprecated`);
      if (token.version?.replacedBy) {
        lines.push(`**Replaced by:** ${token.version.replacedBy}`);
      }
    }

    if (token.version) {
      lines.push(`**Version:** ${token.version.version}`);
    }

    return lines.join('\n');
  }

  private getTokenByPath(path: string): TokenValue | null {
    const parts = path.split('.');
    let current: unknown = this.tokens;

    for (const part of parts) {
      if (current && typeof current === 'object' && !Array.isArray(current) && part in current) {
        current = (current as DesignTokens)[part];
      } else {
        return null;
      }
    }

    if (current && typeof current === 'object' && !Array.isArray(current)) {
      const token = current as TokenValue;
      if ('value' in token || '$value' in token || '$alias' in token) {
        return token;
      }
    }

    return null;
  }

  private getAllTokenPaths(tokens: DesignTokens, prefix: string = ''): string[] {
    const paths: string[] = [];

    for (const [key, value] of Object.entries(tokens)) {
      const path = prefix ? `${prefix}.${key}` : key;

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        if ('value' in value || '$value' in value || '$alias' in value) {
          paths.push(path);
        } else {
          paths.push(...this.getAllTokenPaths(value as DesignTokens, path));
        }
      }
    }

    return paths;
  }
}

