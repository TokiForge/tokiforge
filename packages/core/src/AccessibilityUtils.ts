import type { DesignTokens, TokenValue, AccessibilityMetrics, ColorRGB } from './types';
import { ColorUtils } from './ColorUtils';

export interface ContrastResult {
  ratio: number;
  wcagAA: boolean;
  wcagAAA: boolean;
  wcagAALarge: boolean;
  wcagAAALarge: boolean;
}

export class AccessibilityUtils {
  static calculateContrast(color1: string, color2: string): ContrastResult {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);

    if (!rgb1 || !rgb2) {
      throw new Error('Invalid color format');
    }

    const lum1 = this.getLuminance(rgb1);
    const lum2 = this.getLuminance(rgb2);

    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    const ratio = (lighter + 0.05) / (darker + 0.05);

    return {
      ratio: Math.round(ratio * 100) / 100,
      wcagAA: ratio >= 4.5,
      wcagAAA: ratio >= 7,
      wcagAALarge: ratio >= 3,
      wcagAAALarge: ratio >= 4.5,
    };
  }

  static checkAccessibility(tokens: DesignTokens): Map<string, AccessibilityMetrics> {
    const results = new Map<string, AccessibilityMetrics>();

    const colorPairs: Array<{ path: string; foreground: string; background: string }> = [];

    const extractColors = (obj: DesignTokens, path: string = ''): void => {
      for (const key in obj) {
        const currentPath = path ? `${path}.${key}` : key;
        const value = obj[key];

        if (value && typeof value === 'object' && !Array.isArray(value)) {
          if (this.isTokenValue(value)) {
            const token = value as TokenValue;
            if (token.type === 'color') {
              const colorValue = this.getTokenValue(token);
              if (typeof colorValue === 'string' && colorValue.startsWith('#')) {
                if (currentPath.includes('text') || currentPath.includes('foreground')) {
                  colorPairs.push({ path: currentPath, foreground: colorValue, background: '' });
                } else if (currentPath.includes('background') || currentPath.includes('bg')) {
                  colorPairs.push({ path: currentPath, foreground: '', background: colorValue });
                }
              }
            }
          } else {
            extractColors(value as DesignTokens, currentPath);
          }
        }
      }
    };

    extractColors(tokens);

    for (const pair of colorPairs) {
      if (pair.foreground && pair.background) {
        try {
          const contrast = this.calculateContrast(pair.foreground, pair.background);
          results.set(pair.path, {
            contrastRatio: contrast.ratio,
            wcagAA: contrast.wcagAA,
            wcagAAA: contrast.wcagAAA,
            motionSafe: true,
            colorBlindSafe: this.checkColorBlindSafe(pair.foreground, pair.background),
          });
        } catch (error) {
          continue;
        }
      }
    }

    return results;
  }

  static checkMotionPreferences(): boolean {
    if (typeof window === 'undefined') return true;

    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  static checkColorBlindSafe(color1: string, color2: string): boolean {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);

    if (!rgb1 || !rgb2) return false;

    const hsl1 = ColorUtils.rgbToHsl(rgb1.r, rgb1.g, rgb1.b);
    const hsl2 = ColorUtils.rgbToHsl(rgb2.r, rgb2.g, rgb2.b);

    const hueDiff = Math.abs(hsl1.h - hsl2.h);
    const saturationDiff = Math.abs(hsl1.s - hsl2.s);
    const lightnessDiff = Math.abs(hsl1.l - hsl2.l);

    return (
      hueDiff > 30 ||
      saturationDiff > 0.2 ||
      lightnessDiff > 0.3
    );
  }

  static generateAccessibilityReport(tokens: DesignTokens): {
    total: number;
    passing: number;
    failing: number;
    metrics: Map<string, AccessibilityMetrics>;
  } {
    const metrics = this.checkAccessibility(tokens);
    let passing = 0;
    let failing = 0;

    for (const metric of metrics.values()) {
      if (metric.wcagAA && metric.colorBlindSafe) {
        passing++;
      } else {
        failing++;
      }
    }

    return {
      total: metrics.size,
      passing,
      failing,
      metrics,
    };
  }

  private static hexToRgb(hex: string): ColorRGB | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  private static getLuminance(rgb: ColorRGB): number {
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((val) => {
      val = val / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  private static isTokenValue(value: any): value is TokenValue {
    return (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      ('value' in value || '$value' in value || '$alias' in value || 'type' in value)
    );
  }

  private static getTokenValue(token: TokenValue): string | number {
    if (typeof token.value === 'string' || typeof token.value === 'number') {
      return token.value;
    }
    if (token.$value && (typeof token.$value === 'string' || typeof token.$value === 'number')) {
      return token.$value;
    }
    return '';
  }
}

