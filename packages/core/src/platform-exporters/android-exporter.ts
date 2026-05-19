import type { DesignTokens, TokenValue } from '../types';

export interface AndroidExportOptions {
  format?: 'kotlin' | 'xml';
  packageName?: string;
  objectName?: string;
  colorFormat?: 'hex' | 'int' | 'argb';
}

type TokenNode = Record<string, unknown>;

export class AndroidExporter {
  /**
   * Export tokens to Android format
   */
  static export(tokens: DesignTokens, options: AndroidExportOptions = {}): string {
    const format = options.format || 'kotlin';

    if (format === 'xml') {
      return this.exportXML(tokens, options);
    }

    return this.exportKotlin(tokens, options);
  }

  /**
   * Export as Kotlin object
   */
  private static exportKotlin(
    tokens: DesignTokens,
    options: AndroidExportOptions
  ): string {
    const packageName = options.packageName || 'com.example.tokens';
    const objectName = options.objectName || 'DesignTokens';
    const colorFormat = options.colorFormat || 'hex';

    const lines: string[] = [];
    lines.push(`package ${packageName}\n`);
    lines.push('import androidx.compose.ui.graphics.Color');
    lines.push('import androidx.compose.ui.unit.sp');
    lines.push('import androidx.compose.ui.unit.dp\n');
    lines.push(`object ${objectName} {`);

    // Export colors
    const colorTokens = this.extractTokensByType(tokens, 'color');
    if (Object.keys(colorTokens).length > 0) {
      lines.push('  // Colors');
      for (const [key, value] of Object.entries(colorTokens)) {
        const kotlinKey = this.snakeCase(key);
        const kotlinValue = this.formatColorValue(value, colorFormat);
        lines.push(`  val ${kotlinKey} = ${kotlinValue}`);
      }
      lines.push('');
    }

    // Export typography
    const typographyTokens = this.extractTokensByType(tokens, 'typography');
    if (Object.keys(typographyTokens).length > 0) {
      lines.push('  // Typography');
      for (const [key, value] of Object.entries(typographyTokens)) {
        const kotlinKey = this.snakeCase(key);
        const kotlinValue = this.formatTypographyValue(value);
        lines.push(`  val ${kotlinKey} = ${kotlinValue}`);
      }
      lines.push('');
    }

    // Export spacing
    const spacingTokens = this.extractTokensByType(tokens, 'spacing');
    if (Object.keys(spacingTokens).length > 0) {
      lines.push('  // Spacing');
      for (const [key, value] of Object.entries(spacingTokens)) {
        const kotlinKey = this.snakeCase(key);
        const dpValue = this.getDpValue(value);
        lines.push(`  val ${kotlinKey} = ${dpValue}.dp`);
      }
      lines.push('');
    }

    // Export sizing
    const sizingTokens = this.extractTokensByType(tokens, 'sizing');
    if (Object.keys(sizingTokens).length > 0) {
      lines.push('  // Sizing');
      for (const [key, value] of Object.entries(sizingTokens)) {
        const kotlinKey = this.snakeCase(key);
        const dpValue = this.getDpValue(value);
        lines.push(`  val ${kotlinKey} = ${dpValue}.dp`);
      }
      lines.push('');
    }

    lines.push('}');
    return lines.join('\n');
  }

  /**
   * Export as Android XML resources
   */
  private static exportXML(
    tokens: DesignTokens,
    options: AndroidExportOptions
  ): string {
    const colorFormat = options.colorFormat || 'hex';
    const lines: string[] = [];

    lines.push('<?xml version="1.0" encoding="utf-8"?>');
    lines.push('<resources>');

    // Export colors
    const colorTokens = this.extractTokensByType(tokens, 'color');
    if (Object.keys(colorTokens).length > 0) {
      lines.push('  <!-- Colors -->');
      for (const [key, value] of Object.entries(colorTokens)) {
        const xmlKey = this.xmlResourceName(key);
        const xmlValue = this.formatColorValue(value, colorFormat);
        lines.push(`  <color name="${xmlKey}">${xmlValue}</color>`);
      }
      lines.push('');
    }

    // Export dimensions (spacing/sizing)
    const spacingTokens = this.extractTokensByType(tokens, 'spacing');
    const sizingTokens = this.extractTokensByType(tokens, 'sizing');
    const allDimensions = { ...spacingTokens, ...sizingTokens };

    if (Object.keys(allDimensions).length > 0) {
      lines.push('  <!-- Dimensions -->');
      for (const [key, value] of Object.entries(allDimensions)) {
        const xmlKey = this.xmlResourceName(key);
        const dpValue = this.getDpValue(value);
        lines.push(`  <dimen name="${xmlKey}">${dpValue}dp</dimen>`);
      }
      lines.push('');
    }

    // Export strings (typography labels)
    const typographyTokens = this.extractTokensByType(tokens, 'typography');
    if (Object.keys(typographyTokens).length > 0) {
      lines.push('  <!-- Typography Styles -->');
      for (const [key] of Object.entries(typographyTokens)) {
        const xmlKey = this.xmlResourceName(key);
        lines.push(`  <!-- Style: ${xmlKey} defined in styles.xml -->`);
      }
    }

    lines.push('</resources>');
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

    if (format === 'int') {
      const r = Number.parseInt(hexValue.slice(0, 2), 16);
      const g = Number.parseInt(hexValue.slice(2, 4), 16);
      const b = Number.parseInt(hexValue.slice(4, 6), 16);
      return ((r << 16) | (g << 8) | b).toString();
    }

    if (format === 'argb') {
      return `#FF${hexValue}`;
    }

    return `#${hexValue}`;
  }

  private static formatTypographyValue(value: TokenValue): string {
    if (typeof value === 'object' && 'value' in value && typeof value.value === 'object' && value.value !== null) {
      const typog = value.value as Record<string, unknown>;
      const fontSize = typog.fontSize || 12;

      return `TextStyle(fontSize = ${fontSize}.sp)`;
    }

    return 'TextStyle(fontSize = 12.sp)';
  }

  private static getDpValue(value: TokenValue): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return parseFloat(value);
    if (typeof value === 'object' && 'value' in value) {
      if (typeof value.value === 'number') return value.value;
      if (typeof value.value === 'string') return parseFloat(value.value);
    }
    return 0;
  }

  private static snakeCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[.-]/g, '_')
      .toLowerCase();
  }

  private static xmlResourceName(str: string): string {
    return str.replace(/[.-]/g, '_').toLowerCase();
  }
}
