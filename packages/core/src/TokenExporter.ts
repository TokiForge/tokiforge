import type { DesignTokens, TokenExportOptions, TokenValue } from './types';

export class TokenExporter {
  static exportCSS(tokens: DesignTokens, options: TokenExportOptions = {}): string {
    const selector = options.selector || ':root';
    const prefix = options.prefix || 'hf';
    const variables: string[] = [];
    
    this.flattenTokens(tokens, prefix, variables);
    
    if (variables.length === 0) {
      return `${selector} {}`;
    }

    return `${selector} {\n  ${variables.join('\n  ')}\n}`;
  }

  static exportSCSS(tokens: DesignTokens, options: TokenExportOptions = {}): string {
    const prefix = options.prefix || 'hf';
    const variables: string[] = [];
    
    this.flattenTokens(tokens, prefix, variables, true);
    
    return variables.join('\n');
  }

  static exportJS(tokens: DesignTokens, options: TokenExportOptions = {}): string {
    const prefix = options.prefix || 'hf';
    const variables: Record<string, string | number> = {};
    
    this.flattenTokensToObject(tokens, prefix, variables);
    
    return `module.exports = ${JSON.stringify(variables, null, 2)};`;
  }

  static exportTS(tokens: DesignTokens, options: TokenExportOptions = {}): string {
    const prefix = options.prefix || 'hf';
    const variables: Record<string, string | number> = {};
    
    this.flattenTokensToObject(tokens, prefix, variables);
    
    return `export const tokens = ${JSON.stringify(variables, null, 2)} as const;`;
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
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  private static flattenTokens(
    tokens: DesignTokens,
    prefix: string,
    result: string[],
    isSCSS: boolean = false,
    currentPath: string = ''
  ): void {
    for (const [key, value] of Object.entries(tokens)) {
      const path = currentPath ? `${currentPath}-${key}` : key;
      
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        if ('value' in value || '$value' in value) {
          const tokenValue = (value as TokenValue).value ?? (value as TokenValue).$value;
          if (tokenValue !== undefined && tokenValue !== null) {
            const cssVar = `--${prefix}-${path}`.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
            if (isSCSS) {
              result.push(`$${prefix}-${path.replace(/-/g, '-')}: ${tokenValue};`);
            } else {
              result.push(`${cssVar}: ${tokenValue};`);
            }
          }
        } else {
          this.flattenTokens(value as DesignTokens, prefix, result, isSCSS, path);
        }
      }
    }
  }

  private static flattenTokensToObject(
    tokens: DesignTokens,
    prefix: string,
    result: Record<string, string | number>,
    currentPath: string = ''
  ): void {
    for (const [key, value] of Object.entries(tokens)) {
      const path = currentPath ? `${currentPath}.${key}` : key;
      
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        if ('value' in value || '$value' in value) {
          const tokenValue = (value as TokenValue).value ?? (value as TokenValue).$value;
          if (tokenValue !== undefined && tokenValue !== null && (typeof tokenValue === 'string' || typeof tokenValue === 'number')) {
            const jsKey = `${prefix}.${path}`.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
            result[jsKey] = tokenValue;
          }
        } else {
          this.flattenTokensToObject(value as DesignTokens, prefix, result, path);
        }
      }
    }
  }
}

