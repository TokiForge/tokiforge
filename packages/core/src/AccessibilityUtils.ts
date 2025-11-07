import type { DesignTokens, AccessibilityMetrics, TokenValue } from './types';
import { ColorUtils } from './ColorUtils';

export class AccessibilityUtils {
  static calculateContrast(color1: string, color2: string): AccessibilityMetrics {
    const ratio = ColorUtils.getContrastRatio(color1, color2);
    return {
      contrastRatio: ratio,
      wcagAA: ratio >= 4.5,
      wcagAAA: ratio >= 7,
      motionSafe: true,
      colorBlindSafe: this.checkColorBlindSafe(color1, color2),
    };
  }

  static checkAccessibility(tokens: DesignTokens): Map<string, AccessibilityMetrics> {
    const results = new Map<string, AccessibilityMetrics>();
    const colorPairs: Array<{ path: string; fg: string; bg: string }> = [];

    this.extractColorPairs(tokens, '', colorPairs);

    for (const pair of colorPairs) {
      const metrics = this.calculateContrast(pair.fg, pair.bg);
      results.set(pair.path, metrics);
    }

    return results;
  }

  static checkMotionPreferences(): boolean {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return true;
    }
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  static checkColorBlindSafe(color1: string, color2: string): boolean {
    const rgb1 = ColorUtils.hexToRgb(color1);
    const rgb2 = ColorUtils.hexToRgb(color2);

    if (!rgb1 || !rgb2) return false;

    const hsl1 = ColorUtils.rgbToHsl(rgb1.r, rgb1.g, rgb1.b);
    const hsl2 = ColorUtils.rgbToHsl(rgb2.r, rgb2.g, rgb2.b);

    const lightnessDiff = Math.abs(hsl1.l - hsl2.l);
    const saturationDiff = Math.abs(hsl1.s - hsl2.s);

    return lightnessDiff >= 30 || saturationDiff >= 30;
  }

  static generateAccessibilityReport(tokens: DesignTokens): {
    total: number;
    passing: number;
    failing: number;
    results: Array<{ path: string; metrics: AccessibilityMetrics }>;
  } {
    const results = this.checkAccessibility(tokens);
    const resultArray = Array.from(results.entries()).map(([path, metrics]) => ({
      path,
      metrics,
    }));

    const passing = resultArray.filter(r => r.metrics.wcagAA).length;
    const failing = resultArray.length - passing;

    return {
      total: resultArray.length,
      passing,
      failing,
      results: resultArray,
    };
  }

  private static extractColorPairs(
    tokens: DesignTokens,
    path: string,
    pairs: Array<{ path: string; fg: string; bg: string }>
  ): void {
    for (const [key, value] of Object.entries(tokens)) {
      const currentPath = path ? `${path}.${key}` : key;

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        if ('value' in value || '$value' in value) {
          const token = value as TokenValue;
          const tokenValue = token.value ?? token.$value;
          
          if (typeof tokenValue === 'string' && tokenValue.startsWith('#')) {
            if (currentPath.includes('text') || currentPath.includes('foreground') || currentPath.includes('fg')) {
              const bgPath = currentPath.replace(/text|foreground|fg/gi, 'background').replace(/background|bg/gi, 'background');
              const bgToken = this.findTokenByPath(tokens, bgPath);
              if (bgToken && typeof bgToken === 'string' && bgToken.startsWith('#')) {
                pairs.push({ path: currentPath, fg: tokenValue, bg: bgToken });
              }
            } else if (currentPath.includes('background') || currentPath.includes('bg')) {
              const fgPath = currentPath.replace(/background|bg/gi, 'text').replace(/text|foreground|fg/gi, 'text');
              const fgToken = this.findTokenByPath(tokens, fgPath);
              if (fgToken && typeof fgToken === 'string' && fgToken.startsWith('#')) {
                pairs.push({ path: currentPath, fg: fgToken, bg: tokenValue });
              }
            }
          }
        } else {
          this.extractColorPairs(value as DesignTokens, currentPath, pairs);
        }
      }
    }
  }

  private static findTokenByPath(tokens: DesignTokens, path: string): string | null {
    const parts = path.split('.');
    let current: unknown = tokens;

    for (const part of parts) {
      if (current && typeof current === 'object' && !Array.isArray(current) && part in current) {
        current = (current as DesignTokens)[part];
      } else {
        return null;
      }
    }

    if (current && typeof current === 'object' && !Array.isArray(current)) {
      const token = current as TokenValue;
      const value = token.value ?? token.$value;
      if (typeof value === 'string') {
        return value;
      }
    }

    return null;
  }
}

