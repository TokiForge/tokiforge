import type { DesignTokens } from './types';

export interface DiffResult {
  added: Array<{ path: string; value: any }>;
  removed: Array<{ path: string; value: any }>;
  changed: Array<{ path: string; figma: any; code: any }>;
  unchanged: Array<{ path: string; value: any }>;
}

export interface DiffOptions {
  ignorePaths?: string[];
  tolerance?: number;
  strict?: boolean;
}

export class FigmaDiff {
  static compare(figmaTokens: DesignTokens, codeTokens: DesignTokens, options: DiffOptions = {}): DiffResult {
    const figmaFlat = this.flattenTokens(figmaTokens);
    const codeFlat = this.flattenTokens(codeTokens);

    const result: DiffResult = {
      added: [],
      removed: [],
      changed: [],
      unchanged: [],
    };

    const allPaths = new Set([...Object.keys(figmaFlat), ...Object.keys(codeFlat)]);

    for (const path of allPaths) {
      if (options.ignorePaths?.some((ignore) => path.startsWith(ignore))) {
        continue;
      }

      const figmaValue = figmaFlat[path];
      const codeValue = codeFlat[path];

      if (figmaValue === undefined && codeValue !== undefined) {
        result.added.push({ path, value: codeValue });
      } else if (figmaValue !== undefined && codeValue === undefined) {
        result.removed.push({ path, value: figmaValue });
      } else if (figmaValue !== undefined && codeValue !== undefined) {
        if (this.valuesMatch(figmaValue, codeValue, options.tolerance)) {
          result.unchanged.push({ path, value: figmaValue });
        } else {
          result.changed.push({ path, figma: figmaValue, code: codeValue });
        }
      }
    }

    return result;
  }

  static generateReport(diff: DiffResult): string {
    const lines: string[] = [];
    lines.push('Figma ↔ Code Token Diff Report');
    lines.push('='.repeat(50));
    lines.push('');

    if (diff.added.length > 0) {
      lines.push(`Added in Code (${diff.added.length}):`);
      for (const item of diff.added) {
        lines.push(`  + ${item.path}: ${JSON.stringify(item.value)}`);
      }
      lines.push('');
    }

    if (diff.removed.length > 0) {
      lines.push(`Removed from Code (${diff.removed.length}):`);
      for (const item of diff.removed) {
        lines.push(`  - ${item.path}: ${JSON.stringify(item.value)}`);
      }
      lines.push('');
    }

    if (diff.changed.length > 0) {
      lines.push(`Changed (${diff.changed.length}):`);
      for (const item of diff.changed) {
        lines.push(`  ~ ${item.path}:`);
        lines.push(`    Figma: ${JSON.stringify(item.figma)}`);
        lines.push(`    Code:  ${JSON.stringify(item.code)}`);
      }
      lines.push('');
    }

    if (diff.unchanged.length > 0) {
      lines.push(`Unchanged (${diff.unchanged.length}):`);
      if (diff.unchanged.length <= 10) {
        for (const item of diff.unchanged) {
          lines.push(`  = ${item.path}`);
        }
      } else {
        lines.push(`  ... ${diff.unchanged.length} tokens match`);
      }
      lines.push('');
    }

    lines.push('Summary:');
    lines.push(`  Total: ${diff.added.length + diff.removed.length + diff.changed.length + diff.unchanged.length}`);
    lines.push(`  Added: ${diff.added.length}`);
    lines.push(`  Removed: ${diff.removed.length}`);
    lines.push(`  Changed: ${diff.changed.length}`);
    lines.push(`  Unchanged: ${diff.unchanged.length}`);

    return lines.join('\n');
  }

  static hasMismatches(diff: DiffResult): boolean {
    return diff.added.length > 0 || diff.removed.length > 0 || diff.changed.length > 0;
  }

  static exportJSON(diff: DiffResult, filePath: string): void {
    const fs = require('fs');
    fs.writeFileSync(filePath, JSON.stringify(diff, null, 2));
  }

  private static flattenTokens(tokens: DesignTokens, prefix: string = '', result: Record<string, any> = {}): Record<string, any> {
    for (const key in tokens) {
      const value = tokens[key];
      const path = prefix ? `${prefix}.${key}` : key;

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        if ('value' in value || '$value' in value || '$alias' in value) {
          const tokenValue = 'value' in value ? value.value : ('$value' in value ? value.$value : null);
          if (tokenValue !== null && typeof tokenValue !== 'object') {
            result[path] = tokenValue;
          }
        } else {
          this.flattenTokens(value as DesignTokens, path, result);
        }
      }
    }

    return result;
  }

  private static valuesMatch(value1: any, value2: any, tolerance?: number): boolean {
    if (value1 === value2) return true;

    if (typeof value1 === 'string' && typeof value2 === 'string') {
      const v1 = this.normalizeValue(value1);
      const v2 = this.normalizeValue(value2);

      if (v1 === v2) return true;

      if (tolerance !== undefined && this.isNumeric(v1) && this.isNumeric(v2)) {
        const num1 = parseFloat(v1);
        const num2 = parseFloat(v2);
        return Math.abs(num1 - num2) <= tolerance;
      }

      if (this.isColor(v1) && this.isColor(v2)) {
        return this.colorsMatch(v1, v2, tolerance);
      }
    }

    return false;
  }

  private static normalizeValue(value: string): string {
    return value.trim().toLowerCase().replace(/\s+/g, ' ');
  }

  private static isNumeric(value: string): boolean {
    return /^-?\d+(\.\d+)?(px|em|rem|%)?$/.test(value);
  }

  private static isColor(value: string): boolean {
    return /^#([a-f0-9]{3}|[a-f0-9]{6})$/i.test(value) || /^rgb\(/i.test(value);
  }

  private static colorsMatch(color1: string, color2: string, tolerance?: number): boolean {
    if (color1 === color2) return true;

    const hex1 = this.toHex(color1);
    const hex2 = this.toHex(color2);

    if (!hex1 || !hex2) return false;

    if (tolerance !== undefined) {
      const rgb1 = this.hexToRgb(hex1);
      const rgb2 = this.hexToRgb(hex2);
      if (!rgb1 || !rgb2) return false;

      const diff = Math.abs(rgb1.r - rgb2.r) + Math.abs(rgb1.g - rgb2.g) + Math.abs(rgb1.b - rgb2.b);
      return diff <= tolerance * 3;
    }

    return hex1 === hex2;
  }

  private static toHex(color: string): string | null {
    if (color.startsWith('#')) {
      if (color.length === 4) {
        return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
      }
      return color;
    }

    const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/i);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1], 10).toString(16).padStart(2, '0');
      const g = parseInt(rgbMatch[2], 10).toString(16).padStart(2, '0');
      const b = parseInt(rgbMatch[3], 10).toString(16).padStart(2, '0');
      return `#${r}${g}${b}`;
    }

    return null;
  }

  private static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }
}

