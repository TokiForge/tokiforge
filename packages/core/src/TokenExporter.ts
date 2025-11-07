import type { DesignTokens, TokenExportOptions, TokenValue } from './types';

export class TokenExporter {
  private static flattenTokens(tokens: DesignTokens, prefix: string = '', result: Record<string, TokenValue> = {}): Record<string, TokenValue> {
    for (const key in tokens) {
      const value = tokens[key];
      const path = prefix ? `${prefix}.${key}` : key;

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        if ('value' in value || '$value' in value || '$alias' in value) {
          const token = value as any;
          if ('$value' in token && !('value' in token)) {
            const normalizedToken: TokenValue = {
              ...token,
              value: token.$value,
            };
            delete normalizedToken.$value;
            result[path] = normalizedToken;
          } else {
            result[path] = token as TokenValue;
          }
        } else {
          this.flattenTokens(value as DesignTokens, path, result);
        }
      }
    }

    return result;
  }

  private static toCSSVariable(path: string, prefix: string = ''): string {
    const parts = prefix ? [prefix, ...path.split('.')] : path.split('.');
    return `--${parts
      .map((part) => part.replace(/([A-Z])/g, '-$1').toLowerCase())
      .join('-')}`;
  }

  static exportCSS(tokens: DesignTokens, options: TokenExportOptions = {}): string {
    const { selector = ':root', prefix = 'hf' } = options;
    const flattened = this.flattenTokens(tokens);
    const lines: string[] = [`${selector} {`];

    for (const path in flattened) {
      const token = flattened[path];
      const cssVar = this.toCSSVariable(path, prefix);
      lines.push(`  ${cssVar}: ${token.value};`);
    }

    lines.push('}');
    return lines.join('\n');
  }

  static exportSCSS(tokens: DesignTokens, options: TokenExportOptions = {}): string {
    const { prefix = 'hf' } = options;
    const flattened = this.flattenTokens(tokens);
    const lines: string[] = [];

    for (const path in flattened) {
      const token = flattened[path];
      const scssVar = this.toSCSSVariable(path, prefix);
      lines.push(`${scssVar}: ${token.value};`);
    }

    return lines.join('\n');
  }

  private static toSCSSVariable(path: string, prefix: string = ''): string {
    const parts = prefix ? [prefix, ...path.split('.')] : path.split('.');
    return `$${parts
      .map((part) => part.replace(/([A-Z])/g, '-$1').toLowerCase())
      .join('-')}`;
  }

  static exportJS(tokens: DesignTokens, options: TokenExportOptions = {}): string {
    const { variables = false, prefix = 'hf' } = options;
    const flattened = this.flattenTokens(tokens);
    const result: Record<string, any> = {};

    for (const path in flattened) {
      const token = flattened[path];
      const parts = path.split('.');
      let current = result;

      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) {
          current[parts[i]] = {};
        }
        current = current[parts[i]];
      }

      current[parts[parts.length - 1]] = variables
        ? `var(${this.toCSSVariable(path, prefix)})`
        : token.value;
    }

    return `export default ${JSON.stringify(result, null, 2)};`;
  }

  static exportTS(tokens: DesignTokens, options: TokenExportOptions = {}): string {
    const js = this.exportJS(tokens, options);
    const typeDef = this.generateTypeDef(tokens);
    return `${typeDef}\n\n${js}`;
  }

  private static generateTypeDef(tokens: DesignTokens, indent: number = 0): string {
    const spaces = '  '.repeat(indent);
    const lines: string[] = ['{'];

    for (const key in tokens) {
      const value = tokens[key];
      if (value && typeof value === 'object' && 'value' in value) {
        const type = typeof value.value === 'string' ? 'string' : 'number';
        lines.push(`${spaces}  ${key}: ${type};`);
      } else if (value && typeof value === 'object') {
        lines.push(`${spaces}  ${key}: ${this.generateTypeDef(value as DesignTokens, indent + 1)}`);
      }
    }

    lines.push(`${spaces}}`);
    return lines.join('\n');
  }

  static exportJSON(tokens: DesignTokens): string {
    return JSON.stringify(tokens, null, 2);
  }

  static export(tokens: DesignTokens, options: TokenExportOptions): string {
    const format = options.format || 'css';

    switch (format) {
      case 'css':
        return this.exportCSS(tokens, options);
      case 'scss':
        return this.exportSCSS(tokens, options);
      case 'js':
        return this.exportJS(tokens, options);
      case 'ts':
        return this.exportTS(tokens, options);
      case 'json':
        return this.exportJSON(tokens);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }
}

