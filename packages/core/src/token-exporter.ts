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

  /**
   * Export a light and a dark theme as a single stylesheet using the CSS
   * light-dark() function — the browser switches values with the user's
   * color scheme, no JavaScript required.
   *
   * Tokens present in only one of the themes fall back to that theme's value.
   */
  static exportLightDarkCSS(
    lightTokens: DesignTokens,
    darkTokens: DesignTokens,
    options: { selector?: string; prefix?: string } = {}
  ): string {
    const selector = options.selector ?? ':root';
    const prefix = options.prefix ?? 'hf';
    const light = this.flattenTokens(lightTokens, prefix);
    const dark = this.flattenTokens(darkTokens, prefix);

    const keys = new Set([...Object.keys(light), ...Object.keys(dark)]);
    const cssVars = Array.from(keys)
      .map((key) => {
        const lightValue = light[key];
        const darkValue = dark[key];
        if (lightValue !== undefined && darkValue !== undefined && lightValue !== darkValue) {
          return `  --${key}: light-dark(${lightValue}, ${darkValue});`;
        }
        return `  --${key}: ${lightValue ?? darkValue};`;
      })
      .join('\n');

    return `${selector} {\n  color-scheme: light dark;\n${cssVars}\n}`;
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

  /**
   * Compose composite token values that map onto a single CSS property:
   * shadow objects/arrays become a box-shadow string, cubicBezier arrays
   * become a cubic-bezier() function. Returns undefined when the value
   * should be flattened part-by-part instead.
   */
  private static composeCompositeValue(token: TokenValue): string | undefined {
    const composeShadow = (shadow: TokenNode): string => {
      const inset = shadow.inset ? 'inset ' : '';
      const parts = [shadow.offsetX ?? 0, shadow.offsetY ?? 0, shadow.blur ?? 0, shadow.spread ?? 0, shadow.color ?? 'currentColor'];
      return `${inset}${parts.join(' ')}`;
    };

    const value = token.value as unknown;

    if (token.type === 'shadow') {
      if (Array.isArray(value)) {
        return value.map((s) => composeShadow(s as TokenNode)).join(', ');
      }
      if (value && typeof value === 'object') {
        return composeShadow(value as TokenNode);
      }
    }

    if (token.type === 'cubicBezier' && Array.isArray(value) && value.length === 4) {
      return `cubic-bezier(${value.join(', ')})`;
    }

    if (Array.isArray(value) && value.every((v) => typeof v === 'string' || typeof v === 'number')) {
      // e.g. fontFamily fallback stacks
      return value.join(', ');
    }

    return undefined;
  }

  static flattenTokens(
    tokens: DesignTokens,
    prefix: string = 'hf',
    parentKey: string = ''
  ): Record<string, string> {
    const flat: Record<string, string> = {};

    const processValue = (key: string, value: unknown, parent: string): void => {
      const fullKey = parent ? `${parent}-${key}` : key;
      const tokenKey = `${prefix}-${fullKey}`.toLowerCase().replace(/\./g, '-');

      if (value && typeof value === 'object' && 'value' in (value as TokenNode)) {
        const token = value as TokenValue;
        if (typeof token.value === 'string' || typeof token.value === 'number') {
          flat[tokenKey] = String(token.value);
        } else if (token.value && typeof token.value === 'object' && 'default' in (token.value as TokenNode)) {
          flat[tokenKey] = String((token.value as TokenNode).default);
        } else if (token.value && typeof token.value === 'object') {
          const composed = this.composeCompositeValue(token);
          if (composed !== undefined) {
            flat[tokenKey] = composed;
          } else if (!Array.isArray(token.value)) {
            // Composite token (typography, border, ...): emit one variable per part
            for (const part of Object.keys(token.value as TokenNode)) {
              const partValue = (token.value as TokenNode)[part];
              if (typeof partValue === 'string' || typeof partValue === 'number') {
                flat[`${tokenKey}-${part.toLowerCase()}`] = String(partValue);
              }
            }
          }
        }
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        for (const nestedKey of Object.keys(value as TokenNode)) {
          processValue(nestedKey, (value as TokenNode)[nestedKey], fullKey);
        }
      } else if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
          processValue(`${key}-${i}`, value[i], parent);
        }
      }
    };

    for (const key of Object.keys(tokens)) {
      processValue(key, (tokens as TokenNode)[key], parentKey);
    }

    return flat;
  }
}
