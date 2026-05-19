import type { DesignTokens, TokenExportOptions, TokenValue } from './types';
import { ExportError } from './types';

type TokenNode = Record<string, unknown>;

export class TokenExporter {
  static export(tokens: DesignTokens, options: TokenExportOptions): string {
    switch (options.format) {
      case 'css':
        return this.exportCSS(tokens, options);
      case 'scss':
        return this.exportSCSS(tokens, options);
      case 'js':
        return this.exportJS(tokens, options);
      case 'ts':
        return this.exportTS(tokens);
      case 'json':
        return this.exportJSON(tokens);
      default:
        throw new ExportError(`Unsupported format: ${(options as TokenExportOptions).format}`);
    }
  }

  static exportCSS(
    tokens: DesignTokens,
    options: { selector?: string; prefix?: string } = {}
  ): string {
    const selector = options.selector ?? ':root';
    const prefix = options.prefix ?? 'hf';
    const flatTokens = this.flattenTokens(tokens, prefix);

    const cssVars = Object.entries(flatTokens)
      .map(([key, value]) => `  --${key}: ${value};`)
      .join('\n');

    return `${selector} {\n${cssVars}\n}`;
  }

  static exportSCSS(tokens: DesignTokens, options: { prefix?: string } = {}): string {
    const prefix = options.prefix ?? 'hf';
    const flatTokens = this.flattenTokens(tokens, prefix);

    return Object.entries(flatTokens)
      .map(([key, value]) => `$${key}: ${value};`)
      .join('\n');
  }

  static exportJS(
    tokens: DesignTokens,
    options: { variables?: boolean; prefix?: string } = {}
  ): string {
    const prefix = options.prefix ?? 'hf';
    const useVariables = options.variables ?? false;

    if (useVariables) {
      const flatTokens = this.flattenTokens(tokens, prefix);
      const jsVars = Object.entries(flatTokens)
        .map(([key]) => `  ${key.replace(/-/g, '_')}: 'var(--${key})'`)
        .join(',\n');
      return `export const tokens = {\n${jsVars}\n};`;
    }

    return `export const tokens = ${JSON.stringify(tokens, null, 2)};`;
  }

  static exportTS(tokens: DesignTokens): string {
    return `export const tokens = ${JSON.stringify(tokens, null, 2)} as const;`;
  }

  static exportJSON(tokens: DesignTokens): string {
    return JSON.stringify(tokens, null, 2);
  }

  static flattenTokens(
    tokens: DesignTokens,
    prefix: string = 'hf',
    parentKey: string = ''
  ): Record<string, string> {
    const flat: Record<string, string> = {};

    const processValue = (key: string, value: unknown): void => {
      const fullKey = parentKey ? `${parentKey}-${key}` : key;
      const tokenKey = `${prefix}-${fullKey}`.toLowerCase().replace(/\./g, '-');

      if (value && typeof value === 'object' && 'value' in (value as TokenNode)) {
        const token = value as TokenValue;
        if (typeof token.value === 'string' || typeof token.value === 'number') {
          flat[tokenKey] = String(token.value);
        } else if (token.value && typeof token.value === 'object' && 'default' in (token.value as TokenNode)) {
          flat[tokenKey] = String((token.value as TokenNode).default);
        }
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        for (const nestedKey of Object.keys(value as TokenNode)) {
          processValue(nestedKey, (value as TokenNode)[nestedKey]);
        }
      } else if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
          processValue(`${key}-${i}`, value[i]);
        }
      }
    };

    for (const key of Object.keys(tokens)) {
      processValue(key, (tokens as TokenNode)[key]);
    }

    return flat;
  }
}
