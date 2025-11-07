import type { DesignTokens } from './types';

export interface DiffResult {
  added: Array<{
    path: string;
    value: any;
  }>;
  removed: Array<{
    path: string;
    value: any;
  }>;
  changed: Array<{
    path: string;
    figma: any;
    code: any;
  }>;
  unchanged: Array<{
    path: string;
    value: any;
  }>;
}

export interface DiffOptions {
  ignorePaths?: string[];
  tolerance?: number;
  strict?: boolean;
}

export class FigmaDiff {
  static compare(
    figmaTokens: DesignTokens,
    codeTokens: DesignTokens,
    options: DiffOptions = {}
  ): DiffResult {
    const { ignorePaths = [], tolerance = 0, strict = false } = options;
    
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
      if (ignorePaths.some(ignore => path.startsWith(ignore))) {
        continue;
      }
      
      const figmaValue = figmaFlat[path];
      const codeValue = codeFlat[path];
      
      if (figmaValue === undefined) {
        result.added.push({ path, value: codeValue });
      } else if (codeValue === undefined) {
        result.removed.push({ path, value: figmaValue });
      } else if (this.valuesMatch(figmaValue, codeValue, tolerance, strict)) {
        result.unchanged.push({ path, value: figmaValue });
      } else {
        result.changed.push({ path, figma: figmaValue, code: codeValue });
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
      lines.push(`Added (${diff.added.length}):`);
      diff.added.forEach(({ path, value }) => {
        lines.push(`  + ${path}: ${JSON.stringify(value)}`);
      });
      lines.push('');
    }
    
    if (diff.removed.length > 0) {
      lines.push(`Removed (${diff.removed.length}):`);
      diff.removed.forEach(({ path, value }) => {
        lines.push(`  - ${path}: ${JSON.stringify(value)}`);
      });
      lines.push('');
    }
    
    if (diff.changed.length > 0) {
      lines.push(`Changed (${diff.changed.length}):`);
      diff.changed.forEach(({ path, figma, code }) => {
        lines.push(`  ~ ${path}`);
        lines.push(`    Figma: ${JSON.stringify(figma)}`);
        lines.push(`    Code:  ${JSON.stringify(code)}`);
      });
      lines.push('');
    }
    
    if (diff.unchanged.length > 0) {
      lines.push(`Unchanged (${diff.unchanged.length})`);
      lines.push('');
    }
    
    const totalChanges = diff.added.length + diff.removed.length + diff.changed.length;
    if (totalChanges === 0) {
      lines.push('✅ No differences found!');
    } else {
      lines.push(`⚠️  Found ${totalChanges} difference(s)`);
    }
    
    return lines.join('\n');
  }
  
  static hasMismatches(diff: DiffResult): boolean {
    return diff.added.length > 0 || diff.removed.length > 0 || diff.changed.length > 0;
  }
  
  static exportJSON(diff: DiffResult, filePath: string): void {
    if (typeof window !== 'undefined') {
      throw new Error('exportJSON is not available in browser environments. Use the CLI package instead.');
    }
    try {
      const fs = require('fs');
      fs.writeFileSync(filePath, JSON.stringify(diff, null, 2));
    } catch (error) {
      throw new Error(`Failed to export JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  private static flattenTokens(
    tokens: DesignTokens,
    prefix: string = '',
    result: Record<string, any> = {}
  ): Record<string, any> {
    for (const key in tokens) {
      const value = tokens[key];
      const path = prefix ? `${prefix}.${key}` : key;
      
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        if ('value' in value || '$value' in value || '$alias' in value) {
          const tokenValue = 'value' in value ? value.value : ('$value' in value ? value.$value : null);
          result[path] = this.normalizeValue(tokenValue);
        } else {
          this.flattenTokens(value as DesignTokens, path, result);
        }
      }
    }
    
    return result;
  }
  
  private static valuesMatch(
    a: any,
    b: any,
    tolerance: number,
    strict: boolean
  ): boolean {
    if (strict) {
      return a === b;
    }
    
    const normalizedA = this.normalizeValue(a);
    const normalizedB = this.normalizeValue(b);
    
    if (this.isColor(normalizedA) && this.isColor(normalizedB)) {
      return this.colorsMatch(normalizedA, normalizedB, tolerance);
    }
    
    if (this.isNumeric(normalizedA) && this.isNumeric(normalizedB)) {
      const numA = parseFloat(String(normalizedA));
      const numB = parseFloat(String(normalizedB));
      return Math.abs(numA - numB) <= tolerance;
    }
    
    return normalizedA === normalizedB;
  }
  
  private static normalizeValue(value: any): any {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  }
  
  private static isNumeric(value: any): boolean {
    if (typeof value === 'number') return true;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.endsWith('px') || trimmed.endsWith('rem') || trimmed.endsWith('em')) {
        return !isNaN(parseFloat(trimmed));
      }
      return !isNaN(parseFloat(trimmed)) && !isNaN(Number(trimmed));
    }
    return false;
  }
  
  private static isColor(value: any): boolean {
    if (typeof value !== 'string') return false;
    const trimmed = value.trim();
    return (
      trimmed.startsWith('#') ||
      trimmed.startsWith('rgb') ||
      trimmed.startsWith('hsl') ||
      trimmed.startsWith('rgba') ||
      trimmed.startsWith('hsla')
    );
  }
  
  private static colorsMatch(
    colorA: string,
    colorB: string,
    tolerance: number
  ): boolean {
    if (tolerance === 0) {
      return colorA.toLowerCase() === colorB.toLowerCase();
    }
    
    const rgbA = this.hexToRgb(this.toHex(colorA));
    const rgbB = this.hexToRgb(this.toHex(colorB));
    
    if (!rgbA || !rgbB) {
      return colorA.toLowerCase() === colorB.toLowerCase();
    }
    
    const diff = Math.sqrt(
      Math.pow(rgbA.r - rgbB.r, 2) +
      Math.pow(rgbA.g - rgbB.g, 2) +
      Math.pow(rgbA.b - rgbB.b, 2)
    );
    
    return diff <= tolerance;
  }
  
  private static toHex(color: string): string {
    if (color.startsWith('#')) {
      return color;
    }
    
    if (color.startsWith('rgb')) {
      const match = color.match(/\d+/g);
      if (match && match.length >= 3) {
        const r = parseInt(match[0]);
        const g = parseInt(match[1]);
        const b = parseInt(match[2]);
        return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
      }
    }
    
    return color;
  }
  
  private static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    if (!hex.startsWith('#')) return null;
    
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    
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

