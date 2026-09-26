import type { DesignTokens, AccessibilityMetrics, TokenValue } from './types';
import { ColorUtils } from './color-utils';

type TokenNode = Record<string, unknown>;

const FOREGROUND_SEGMENT = /(?:^|[.\-_])(?:text|foreground|fg|content|icon)(?:[.\-_]|$)/;
const BACKGROUND_SEGMENT = /(?:^|[.\-_])(?:background|bg|surface|canvas)(?:[.\-_]|$)/;

interface ColorEntry {
  path: string;
  value: string;
  role: 'foreground' | 'background' | 'other';
}

export class AccessibilityUtils {
  /**
   * WCAG 2 contrast of a foreground (`color1`) on a background (`color2`).
   * `wcagAA` / `wcagAAA` are the normal-text thresholds (4.5:1 and 7:1).
   * Large-text thresholds are reported separately.
   */
  static calculateContrast(color1: string, color2: string): AccessibilityMetrics {
    const ratio = ColorUtils.getContrastRatio(color1, color2);
    const wcagAALarge = ratio >= 3;
    const wcagAA = ratio >= 4.5;
    const wcagAAALarge = wcagAA;
    const wcagAAA = ratio >= 7;

    let level: 'pass' | 'fail' | 'large-text';
    if (wcagAA) {
      level = 'pass';
    } else if (wcagAALarge) {
      level = 'large-text';
    } else {
      level = 'fail';
    }

    return { ratio, wcagAA, wcagAAA, wcagAALarge, wcagAAALarge, level };
  }

  /**
   * APCA (Accessible Perceptual Contrast Algorithm) lightness contrast,
   * the candidate algorithm for WCAG 3. Returns Lc in roughly -108..106;
   * |Lc| >= 60 is the common threshold for body text, >= 75 preferred,
   * >= 45 for large/bold text.
   *
   * @param textColor  Foreground (text) color
   * @param bgColor    Background color
   */
  static calculateAPCA(textColor: string, bgColor: string): number {
    const screenLuminance = (color: string): number => {
      const rgb = ColorUtils.parseColor(color) ?? ColorUtils.hexToRGB(color);
      const linearize = (v: number): number => Math.pow(v / 255, 2.4);
      return (
        0.2126729 * linearize(rgb.r) +
        0.7151522 * linearize(rgb.g) +
        0.072175 * linearize(rgb.b)
      );
    };

    // Soft-clamp very dark colors (flare compensation)
    const softClamp = (y: number): number =>
      y >= 0.022 ? y : y + Math.pow(0.022 - y, 1.414);

    const yTxt = softClamp(screenLuminance(textColor));
    const yBg = softClamp(screenLuminance(bgColor));

    // Below this delta, contrast is treated as zero
    if (Math.abs(yBg - yTxt) < 0.0005) return 0;

    let sapc: number;
    if (yBg > yTxt) {
      // Dark text on light background
      sapc = (Math.pow(yBg, 0.56) - Math.pow(yTxt, 0.57)) * 1.14;
      return sapc < 0.1 ? 0 : Math.round((sapc - 0.027) * 1000) / 10;
    }
    // Light text on dark background
    sapc = (Math.pow(yBg, 0.65) - Math.pow(yTxt, 0.62)) * 1.14;
    return sapc > -0.1 ? 0 : Math.round((sapc + 0.027) * 1000) / 10;
  }

  /**
   * Contrast-check foreground tokens against background tokens.
   *
   * Pairs are limited to colors whose paths identify a role (`text`, `fg`,
   * `background`, `surface`, …) and that share a top-level group, so a brand
   * palette is not reported as hundreds of unrelated failures.
   */
  static checkAccessibility(tokens: DesignTokens): AccessibilityMetrics[] {
    const colors = this.collectColors(tokens);
    const foregrounds = colors.filter((color) => color.role === 'foreground');
    const backgrounds = colors.filter((color) => color.role === 'background');
    if (foregrounds.length === 0 || backgrounds.length === 0) return [];

    const metrics: AccessibilityMetrics[] = [];
    for (const foreground of foregrounds) {
      const group = foreground.path.split('.')[0];
      const partners = backgrounds.filter((background) => background.path.split('.')[0] === group);
      const pairs = partners.length > 0 ? partners : backgrounds;
      for (const background of pairs) {
        metrics.push({
          ...this.calculateContrast(foreground.value, background.value),
          foreground: foreground.path,
          background: background.path,
        });
      }
    }

    return metrics;
  }

  private static collectColors(tokens: DesignTokens): ColorEntry[] {
    const colors: ColorEntry[] = [];

    const visit = (obj: unknown, path: string): void => {
      if (typeof obj !== 'object' || obj === null) return;

      if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
          visit(obj[i], `${path}[${i}]`);
        }
        return;
      }

      const node = obj as TokenNode;
      if ('value' in node) {
        const token = node as unknown as TokenValue;
        if (token.type === 'color' && typeof token.value === 'string') {
          colors.push({ path, value: token.value, role: this.colorRole(path) });
        }
        return;
      }

      for (const key of Object.keys(node)) {
        visit(node[key], path ? `${path}.${key}` : key);
      }
    };

    visit(tokens, '');
    return colors;
  }

  private static colorRole(path: string): ColorEntry['role'] {
    const normalized = path.toLowerCase();
    if (BACKGROUND_SEGMENT.test(normalized)) return 'background';
    if (FOREGROUND_SEGMENT.test(normalized)) return 'foreground';
    return 'other';
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
