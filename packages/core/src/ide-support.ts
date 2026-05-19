import type { DesignTokens, HoverInfo, Completion, Definition, TokenValue } from './types';

type TokenNode = Record<string, unknown>;

export class IDESupport {
  private tokens: DesignTokens = {};

  loadTokens(tokens: DesignTokens): void {
    this.tokens = tokens;
  }

  getHoverInfo(tokenPath: string): HoverInfo | null {
    const token = this.getToken(tokenPath);
    if (!token) {
      return null;
    }

    const value = this.getTokenValue(token);
    return {
      path: tokenPath,
      value: typeof value === 'object' ? JSON.stringify(value) : String(value),
      type: token.type,
      description: token.description,
    };
  }

  getCompletions(prefix = ''): Completion[] {
    const paths = this.getAllTokenPaths();
    const matching = paths.filter((path) => path.startsWith(prefix));

    return matching.map((path) => {
      const token = this.getToken(path);
      const value = token ? this.getTokenValue(token) : undefined;
      
      return {
        label: path,
        detail: value !== undefined ? String(value) : undefined,
        documentation: token?.description,
      };
    });
  }

  getDefinition(tokenPath: string): Definition | null {
    const token = this.getToken(tokenPath);
    if (!token) {
      return null;
    }

    const value = this.getTokenValue(token);
    return {
      path: tokenPath,
      value: typeof value === 'object' ? JSON.stringify(value) : String(value),
      type: token.type,
    };
  }

  private getTokenValue(token: TokenValue): string | number {
    if (typeof token.value === 'string' || typeof token.value === 'number') {
      return token.value;
    }
    if (token.value && typeof token.value === 'object' && 'default' in token.value) {
      return token.value.default as string | number;
    }
    return '';
  }

  private getToken(path: string): TokenValue | null {
    const parts = path.split('.');
    let current: unknown = this.tokens;

    for (const part of parts) {
      if (current && typeof current === 'object' && part in (current as TokenNode)) {
        current = (current as TokenNode)[part];
      } else {
        return null;
      }
    }

    if (current && typeof current === 'object' && 'value' in (current as TokenNode)) {
      return current as unknown as TokenValue;
    }

    return null;
  }

  private getAllTokenPaths(): string[] {
    const paths: string[] = [];

    const traverse = (obj: unknown, path = ''): void => {
      if (typeof obj !== 'object' || obj === null) {
        return;
      }

      if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
          traverse(obj[i], `${path}[${i}]`);
        }
        return;
      }

      const node = obj as TokenNode;
      if ('value' in node) {
        paths.push(path || 'root');
      } else {
        for (const key of Object.keys(node)) {
          const newPath = path ? `${path}.${key}` : key;
          traverse(node[key], newPath);
        }
      }
    };

    traverse(this.tokens);
    return paths;
  }
}
