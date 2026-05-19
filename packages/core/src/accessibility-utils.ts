import type { DesignTokens, AccessibilityMetrics, TokenValue } from './types';
import { ColorUtils } from './color-utils';

type TokenNode = Record<string, unknown>;

export class AccessibilityUtils {
  static calculateContrast(color1: string, color2: string): AccessibilityMetrics {
    const getLuminance = (hex: string): number => {
      const rgb = ColorUtils.hexToRGB(hex);
      const [r, g, b] = [rgb.r / 255, rgb.g / 255, rgb.b / 255].map((val) =>
        val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
      );
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    const ratio = (lighter + 0.05) / (darker + 0.05);

    const wcagAA = ratio >= 4.5;
    const wcagAAA = ratio >= 7;
    const wcagAALarge = ratio >= 3;
    const wcagAAALarge = ratio >= 4.5;

    let level: 'pass' | 'fail' | 'large-text';
    if (wcagAAA || wcagAA) {
      level = 'pass';
    } else if (wcagAALarge || wcagAAALarge) {
      level = 'large-text';
    } else {
      level = 'fail';
    }

    return {
      ratio: Math.round(ratio * 100) / 100,
      wcagAA: wcagAA || wcagAALarge,
      wcagAAA: wcagAAA || wcagAAALarge,
      level,
    };
  }

  static checkAccessibility(tokens: DesignTokens): AccessibilityMetrics[] {
    const metrics: AccessibilityMetrics[] = [];

    const extractColors = (obj: unknown, path: string = ''): string[] => {
      const colors: string[] = [];

      if (typeof obj !== 'object' || obj === null) return colors;

      if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
          colors.push(...extractColors(obj[i] as TokenNode, `${path}[${i}]`));
        }
        return colors;
      }

      const node = obj as TokenNode;
      if ('value' in node) {
        const token = node as unknown as TokenValue;
        if (token.type === 'color' && typeof token.value === 'string') {
          colors.push(token.value);
        }
      } else {
        for (const key of Object.keys(node)) {
          const newPath = path ? `${path}.${key}` : key;
          colors.push(...extractColors(node[key], newPath));
        }
      }

      return colors;
    };

    const colors = extractColors(tokens);

    for (let i = 0; i < colors.length; i++) {
      for (let j = i + 1; j < colors.length; j++) {
        metrics.push(this.calculateContrast(colors[i], colors[j]));
      }
    }

    return metrics;
  }

  static generateAccessibilityReport(tokens: DesignTokens): {
    passing: number;
    failing: number;
    total: number;
    details: AccessibilityMetrics[];
  } {
    const metrics = this.checkAccessibility(tokens);
    const passing = metrics.filter((m) => m.level === 'pass').length;
    const failing = metrics.filter((m) => m.level === 'fail').length;
    const total = metrics.length;

    return { passing, failing, total, details: metrics };
  }
}
