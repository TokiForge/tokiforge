import type { DesignTokens, TokenValue } from '../types';

export interface ReactNativeExportOptions {
  format?: 'typescript' | 'javascript';
  includeTheme?: boolean;
  colorFormat?: 'hex' | 'rgb';
}

export class ReactNativeExporter {
  /**
   * Export tokens to React Native format
   */
  static export(tokens: DesignTokens, options: ReactNativeExportOptions = {}): string {
    const format = options.format || 'typescript';
    const includeTheme = options.includeTheme !== false;

    if (format === 'javascript') {
      return this.exportJavaScript(tokens, includeTheme);
    }

    return this.exportTypeScript(tokens, includeTheme);
  }

  /**
   * Export as TypeScript React Native theme object
   */
  private static exportTypeScript(tokens: DesignTokens, includeTheme: boolean): string {
    const lines: string[] = [];

    lines.push("import { StyleSheet } from 'react-native';\n");

    if (includeTheme) {
      lines.push('export interface Theme {');

      const colorTokens = this.extractTokensByType(tokens, 'color');
      if (Object.keys(colorTokens).length > 0) {
        lines.push('  colors: {');
        for (const key of Object.keys(colorTokens)) {
          const tsKey = this.camelCase(key);
          lines.push(`    ${tsKey}: string;`);
        }
        lines.push('  };');
      }

      const typographyTokens = this.extractTokensByType(tokens, 'typography');
      if (Object.keys(typographyTokens).length > 0) {
        lines.push('  typography: {');
        for (const key of Object.keys(typographyTokens)) {
          const tsKey = this.camelCase(key);
          lines.push(`    ${tsKey}: TextStyle;`);
        }
        lines.push('  };');
      }

      const spacingTokens = this.extractTokensByType(tokens, 'spacing');
      if (Object.keys(spacingTokens).length > 0) {
        lines.push('  spacing: {');
        for (const key of Object.keys(spacingTokens)) {
          const tsKey = this.camelCase(key);
          lines.push(`    ${tsKey}: number;`);
        }
        lines.push('  };');
      }

      lines.push('}\n');
    }

    lines.push('export const tokens = {');

    // Export colors
    const colorTokens = this.extractTokensByType(tokens, 'color');
    if (Object.keys(colorTokens).length > 0) {
      lines.push('  colors: {');
      for (const [key, value] of Object.entries(colorTokens)) {
        const tsKey = this.camelCase(key);
        const colorValue = this.formatColorValue(value);
        lines.push(`    ${tsKey}: '${colorValue}',`);
      }
      lines.push('  },');
    }

    // Export typography
    const typographyTokens = this.extractTokensByType(tokens, 'typography');
    if (Object.keys(typographyTokens).length > 0) {
      lines.push('  typography: {');
      for (const [key, value] of Object.entries(typographyTokens)) {
        const tsKey = this.camelCase(key);
        const typogValue = this.formatTypographyValue(value);
        lines.push(`    ${tsKey}: ${typogValue},`);
      }
      lines.push('  },');
    }

    // Export spacing
    const spacingTokens = this.extractTokensByType(tokens, 'spacing');
    if (Object.keys(spacingTokens).length > 0) {
      lines.push('  spacing: {');
      for (const [key, value] of Object.entries(spacingTokens)) {
        const tsKey = this.camelCase(key);
        const numValue = this.getNumericValue(value);
        lines.push(`    ${tsKey}: ${numValue},`);
      }
      lines.push('  },');
    }

    // Export sizing
    const sizingTokens = this.extractTokensByType(tokens, 'sizing');
    if (Object.keys(sizingTokens).length > 0) {
      lines.push('  sizing: {');
      for (const [key, value] of Object.entries(sizingTokens)) {
        const tsKey = this.camelCase(key);
        const numValue = this.getNumericValue(value);
        lines.push(`    ${tsKey}: ${numValue},`);
      }
      lines.push('  },');
    }

    lines.push('} as const;');
    lines.push('');
    lines.push("export type Tokens = typeof tokens;\n");

    // Add convenience hook
    lines.push("export function useTokens() {");
    lines.push('  return tokens;');
    lines.push('}');

    return lines.join('\n');
  }

  /**
   * Export as JavaScript React Native theme object
   */
  private static exportJavaScript(tokens: DesignTokens, _includeTheme: boolean): string {
    const lines: string[] = [];

    lines.push("import { StyleSheet } from 'react-native';\n");

    lines.push('export const tokens = {');

    // Export colors
    const colorTokens = this.extractTokensByType(tokens, 'color');
    if (Object.keys(colorTokens).length > 0) {
      lines.push('  colors: {');
      for (const [key, value] of Object.entries(colorTokens)) {
        const jsKey = this.camelCase(key);
        const colorValue = this.formatColorValue(value);
        lines.push(`    ${jsKey}: '${colorValue}',`);
      }
      lines.push('  },');
    }

    // Export typography
    const typographyTokens = this.extractTokensByType(tokens, 'typography');
    if (Object.keys(typographyTokens).length > 0) {
      lines.push('  typography: {');
      for (const [key, value] of Object.entries(typographyTokens)) {
        const jsKey = this.camelCase(key);
        const typogValue = this.formatTypographyValue(value);
        lines.push(`    ${jsKey}: ${typogValue},`);
      }
      lines.push('  },');
    }

    // Export spacing
    const spacingTokens = this.extractTokensByType(tokens, 'spacing');
    if (Object.keys(spacingTokens).length > 0) {
      lines.push('  spacing: {');
      for (const [key, value] of Object.entries(spacingTokens)) {
        const jsKey = this.camelCase(key);
        const numValue = this.getNumericValue(value);
        lines.push(`    ${jsKey}: ${numValue},`);
      }
      lines.push('  },');
    }

    // Export sizing
    const sizingTokens = this.extractTokensByType(tokens, 'sizing');
    if (Object.keys(sizingTokens).length > 0) {
      lines.push('  sizing: {');
      for (const [key, value] of Object.entries(sizingTokens)) {
        const jsKey = this.camelCase(key);
        const numValue = this.getNumericValue(value);
        lines.push(`    ${jsKey}: ${numValue},`);
      }
      lines.push('  },');
    }

    lines.push('};\n');

    // Add convenience hook
    lines.push('export function useTokens() {');
    lines.push('  return tokens;');
    lines.push('}');

    return lines.join('\n');
  }

  private static extractTokensByType(
    tokens: DesignTokens,
    type: string
  ): Record<string, TokenValue> {
    const result: Record<string, TokenValue> = {};

    const traverse = (obj: any, prefix: string = '') => {
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;

        if (value === null || value === undefined) {
          continue;
        }

        if (typeof value === 'object' && !('value' in value)) {
          traverse(value, fullKey);
        } else if (typeof value === 'object' && 'type' in value && value.type === type) {
          result[fullKey] = value as TokenValue;
        } else if (
          fullKey.includes(type) &&
          typeof value === 'object' &&
          'value' in value
        ) {
          result[fullKey] = value as TokenValue;
        }
      }
    };

    traverse(tokens);
    return result;
  }

  private static formatColorValue(value: TokenValue): string {
    if (typeof value === 'string') {
      return value;
    }
    if (typeof value === 'object' && 'value' in value) {
      return String(value.value);
    }
    return '#000000';
  }

  private static formatTypographyValue(value: TokenValue): string {
    if (typeof value === 'object' && 'value' in value && typeof value.value === 'object') {
      const typog = value.value as any;
      const props: string[] = [];

      if (typog.fontSize) props.push(`fontSize: ${typog.fontSize}`);
      if (typog.fontFamily) props.push(`fontFamily: '${typog.fontFamily}'`);
      if (typog.fontWeight)
        props.push(`fontWeight: '${typog.fontWeight}' as const`);
      if (typog.lineHeight) props.push(`lineHeight: ${typog.lineHeight}`);
      if (typog.letterSpacing) props.push(`letterSpacing: ${typog.letterSpacing}`);

      if (props.length === 0) {
        return '{ fontSize: 12 }';
      }

      return `{ ${props.join(', ')} }`;
    }

    return '{ fontSize: 12 }';
  }

  private static getNumericValue(value: TokenValue): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return parseFloat(value);
    if (typeof value === 'object' && 'value' in value) {
      if (typeof value.value === 'number') return value.value;
      if (typeof value.value === 'string') return parseFloat(value.value);
    }
    return 0;
  }

  private static camelCase(str: string): string {
    return str
      .split(/[.-]/)
      .map((word, index) => {
        if (index === 0) return word.toLowerCase();
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join('');
  }
}
