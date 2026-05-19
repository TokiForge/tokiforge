import type { DesignTokens, TokenValue } from '../types';

export interface IOSExportOptions {
  format?: 'swift' | 'swiftui';
  className?: string;
  prefix?: string;
  colorFormat?: 'hex' | 'rgb' | 'uicolor';
}

type TokenNode = Record<string, unknown>;

export class IOSExporter {
  /**
   * Export tokens to iOS Swift format
   */
  static export(tokens: DesignTokens, options: IOSExportOptions = {}): string {
    const format = options.format || 'swift';

    if (format === 'swiftui') {
      return this.exportSwiftUI(tokens, options);
    }

    return this.exportSwift(tokens, options);
  }

  /**
   * Export as Swift UIColor/UIFont constants
   */
  private static exportSwift(
    tokens: DesignTokens,
    options: IOSExportOptions
  ): string {
    const className = options.className || 'DesignTokens';
    const colorFormat = options.colorFormat || 'hex';

    const lines: string[] = [];
    lines.push(
      'import UIKit\n',
      `public enum ${className} {`
    );

    const colorTokens = this.extractTokensByType(tokens, 'color');
    this.writeColorsSwift(lines, colorTokens, colorFormat);

    const typographyTokens = this.extractTokensByType(tokens, 'typography');
    this.writeTypographySwift(lines, typographyTokens);

    const spacingTokens = this.extractTokensByType(tokens, 'spacing');
    this.writeSpacingSwift(lines, spacingTokens);

    const sizingTokens = this.extractTokensByType(tokens, 'sizing');
    this.writeSizingSwift(lines, sizingTokens);

    lines.push('}');
    return lines.join('\n');
  }

  private static writeColorsSwift(lines: string[], colorTokens: Record<string, TokenValue>, colorFormat: string): void {
    if (Object.keys(colorTokens).length > 0) {
      lines.push('  // MARK: - Colors');
      for (const [key, value] of Object.entries(colorTokens)) {
        const swiftKey = this.camelCase(key);
        const swiftValue = this.formatColorValue(value, colorFormat);
        lines.push(`  public static let ${swiftKey} = ${swiftValue}`);
      }
      lines.push('');
    }
  }

  private static writeTypographySwift(lines: string[], typographyTokens: Record<string, TokenValue>): void {
    if (Object.keys(typographyTokens).length > 0) {
      lines.push('  // MARK: - Typography');
      for (const [key, value] of Object.entries(typographyTokens)) {
        const swiftKey = this.camelCase(key);
        const swiftValue = this.formatTypographyValue(value);
        lines.push(`  public static let ${swiftKey}: UIFont = ${swiftValue}`);
      }
      lines.push('');
    }
  }

  private static writeSpacingSwift(lines: string[], spacingTokens: Record<string, TokenValue>): void {
    if (Object.keys(spacingTokens).length > 0) {
      lines.push('  // MARK: - Spacing');
      for (const [key, value] of Object.entries(spacingTokens)) {
        const swiftKey = this.camelCase(key);
        if (typeof value === 'number') {
          lines.push(`  public static let ${swiftKey}: CGFloat = ${value}`);
        } else if (value && typeof value === 'object' && 'value' in value) {
          const valObj = value as unknown as Record<string, unknown>;
          lines.push(`  public static let ${swiftKey}: CGFloat = ${valObj.value}`);
        } else if (typeof value === 'string') {
          const numValue = Number.parseFloat(value);
          lines.push(`  public static let ${swiftKey}: CGFloat = ${numValue}`);
        }
      }
      lines.push('');
    }
  }

  private static writeSizingSwift(lines: string[], sizingTokens: Record<string, TokenValue>): void {
    if (Object.keys(sizingTokens).length > 0) {
      lines.push('  // MARK: - Sizing');
      for (const [key, value] of Object.entries(sizingTokens)) {
        const swiftKey = this.camelCase(key);
        if (typeof value === 'number') {
          lines.push(`  public static let ${swiftKey}: CGFloat = ${value}`);
        } else if (value && typeof value === 'object' && 'value' in value) {
          const valObj = value as unknown as Record<string, unknown>;
          lines.push(`  public static let ${swiftKey}: CGFloat = ${valObj.value}`);
        } else if (typeof value === 'string') {
          const numValue = Number.parseFloat(value);
          lines.push(`  public static let ${swiftKey}: CGFloat = ${numValue}`);
        }
      }
      lines.push('');
    }
  }

  /**
   * Export as SwiftUI DSL format
   */
  private static exportSwiftUI(
    tokens: DesignTokens,
    options: IOSExportOptions
  ): string {
    const className = options.className || 'DesignTokens';
    const colorFormat = options.colorFormat || 'hex';

    const lines: string[] = [];
    lines.push(
      'import SwiftUI\n',
      `struct ${className}: EnvironmentKey {`,
      '  static let defaultValue = Self()',
      ''
    );

    const colorTokens = this.extractTokensByType(tokens, 'color');
    for (const [key, value] of Object.entries(colorTokens)) {
      const swiftKey = this.camelCase(key);
      const swiftValue = this.formatColorValue(value, colorFormat);
      lines.push(`  var ${swiftKey}: Color = ${swiftValue}`);
    }

    lines.push(
      '}',
      '',
      'extension EnvironmentValues {',
      `  var designTokens: ${className} {`,
      `    get { self[${className}.self] }`,
      `    set { self[${className}.self] = newValue }`,
      '  }',
      '}'
    );

    return lines.join('\n');
  }

  private static extractTokensByType(
    tokens: DesignTokens,
    type: string
  ): Record<string, TokenValue> {
    const result: Record<string, TokenValue> = {};

    const traverse = (obj: TokenNode, prefix = '') => {
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;

        if (value === null || value === undefined) {
          continue;
        }

        if (typeof value === 'object' && !('value' in value)) {
          traverse(value as TokenNode, fullKey);
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

    traverse(tokens as unknown as TokenNode);
    return result;
  }

  private static formatColorValue(value: TokenValue, format: string): string {
    let hexValue = '';

    if (typeof value === 'string') {
      hexValue = value;
    } else if (typeof value === 'object' && 'value' in value) {
      hexValue = String(value.value);
    }

    // Normalize to 6-digit hex
    hexValue = hexValue.replace('#', '').toUpperCase();
    if (hexValue.length === 3) {
      hexValue = hexValue
        .split('')
        .map((c) => c + c)
        .join('');
    }

    if (format === 'rgb') {
      const r = Number.parseInt(hexValue.slice(0, 2), 16);
      const g = Number.parseInt(hexValue.slice(2, 4), 16);
      const b = Number.parseInt(hexValue.slice(4, 6), 16);
      return `UIColor(red: ${(r / 255).toFixed(3)}, green: ${(g / 255).toFixed(3)}, blue: ${(b / 255).toFixed(3)}, alpha: 1.0)`;
    }

    if (format === 'uicolor') {
      const r = Number.parseInt(hexValue.slice(0, 2), 16);
      const g = Number.parseInt(hexValue.slice(2, 4), 16);
      const b = Number.parseInt(hexValue.slice(4, 6), 16);
      return `UIColor(red: ${r}/255.0, green: ${g}/255.0, blue: ${b}/255.0, alpha: 1.0)`;
    }

    return `UIColor(hex: "#${hexValue}")`;
  }

  private static formatTypographyValue(value: TokenValue): string {
    if (typeof value === 'object' && 'value' in value && typeof value.value === 'object' && value.value !== null) {
      const typog = value.value as Record<string, unknown>;
      const fontSize = (typog.fontSize as number | undefined) || 12;
      const fontWeight = typog.fontWeight || 'regular';

      let weight = '.regular';
      if (fontWeight === 'bold' || fontWeight === 700) weight = '.bold';
      else if (fontWeight === 'semibold' || fontWeight === 600) weight = '.semibold';
      else if (fontWeight === 'light' || fontWeight === 300) weight = '.light';

      return `UIFont.systemFont(ofSize: ${fontSize}, weight: ${weight})`;
    }

    return 'UIFont.systemFont(ofSize: 12)';
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
