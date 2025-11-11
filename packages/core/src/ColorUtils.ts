import type { ColorRGB, ColorHSL } from './types';

export class ColorUtils {
  static hexToRgb(hex: string): ColorRGB | null {
    if (!hex.startsWith('#')) return null;
    
    const cleanHex = hex.slice(1);
    if (cleanHex.length !== 3 && cleanHex.length !== 6) return null;

    const fullHex = cleanHex.length === 3
      ? cleanHex.split('').map(char => char + char).join('')
      : cleanHex;

    const r = parseInt(fullHex.slice(0, 2), 16);
    const g = parseInt(fullHex.slice(2, 4), 16);
    const b = parseInt(fullHex.slice(4, 6), 16);

    if (isNaN(r) || isNaN(g) || isNaN(b)) return null;

    return { r, g, b };
  }

  static rgbToHex(r: number, g: number, b: number): string {
    const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
    return `#${[r, g, b].map(clamp).map(n => n.toString(16).padStart(2, '0')).join('')}`;
  }

  static rgbToHsl(r: number, g: number, b: number): ColorHSL {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  }

  static hslToRgb(h: number, s: number, l: number): ColorRGB {
    h /= 360;
    s /= 100;
    l /= 100;

    let r: number, g: number, b: number;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;

      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };
  }

  static lighten(hex: string, percent: number): string {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return hex;

    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
    hsl.l = Math.min(100, hsl.l + percent);
    const newRgb = this.hslToRgb(hsl.h, hsl.s, hsl.l);
    return this.rgbToHex(newRgb.r, newRgb.g, newRgb.b);
  }

  static darken(hex: string, percent: number): string {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return hex;

    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
    hsl.l = Math.max(0, hsl.l - percent);
    const newRgb = this.hslToRgb(hsl.h, hsl.s, hsl.l);
    return this.rgbToHex(newRgb.r, newRgb.g, newRgb.b);
  }

  static saturate(hex: string, percent: number): string {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return hex;

    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
    hsl.s = Math.min(100, hsl.s + percent);
    const newRgb = this.hslToRgb(hsl.h, hsl.s, hsl.l);
    return this.rgbToHex(newRgb.r, newRgb.g, newRgb.b);
  }

  static desaturate(hex: string, percent: number): string {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return hex;

    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
    hsl.s = Math.max(0, hsl.s - percent);
    const newRgb = this.hslToRgb(hsl.h, hsl.s, hsl.l);
    return this.rgbToHex(newRgb.r, newRgb.g, newRgb.b);
  }

  static generateShades(baseColor: string, count: number = 10): Record<string, string> {
    const shades: Record<string, string> = {};
    const step = 100 / (count - 1);

    for (let i = 0; i < count; i++) {
      const lightness = i * step;
      const rgb = this.hexToRgb(baseColor);
      if (!rgb) continue;

      const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
      hsl.l = lightness;
      const newRgb = this.hslToRgb(hsl.h, hsl.s, hsl.l);
      shades[`${i * 100}`] = this.rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    }

    return shades;
  }

  static generatePalette(baseColor: string, count: number = 5): string[] {
    const shades = this.generateShades(baseColor, count);
    return Object.values(shades);
  }

  static getContrastRatio(color1: string, color2: string): number {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);

    if (!rgb1 || !rgb2) return 0;

    const luminance1 = this.getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const luminance2 = this.getLuminance(rgb2.r, rgb2.g, rgb2.b);

    const lighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  static isAccessible(foreground: string, background: string, level: 'AA' | 'AAA' = 'AA'): boolean {
    const ratio = this.getContrastRatio(foreground, background);
    return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
  }

  static findAccessibleColor(foreground: string, background: string, level: 'AA' | 'AAA' = 'AA'): string {
    const rgb = this.hexToRgb(foreground);
    if (!rgb) return foreground;

    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
    let currentRatio = this.getContrastRatio(foreground, background);

    const targetRatio = level === 'AA' ? 4.5 : 7;

    if (currentRatio >= targetRatio) {
      return foreground;
    }

    const bgRgb = this.hexToRgb(background);
    if (!bgRgb) return foreground;

    const bgLuminance = this.getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
    const fgLuminance = this.getLuminance(rgb.r, rgb.g, rgb.b);

    const needsToBeLighter = fgLuminance < bgLuminance;

    while (currentRatio < targetRatio && hsl.l > 0 && hsl.l < 100) {
      hsl.l += needsToBeLighter ? 5 : -5;
      const newRgb = this.hslToRgb(hsl.h, hsl.s, hsl.l);
      const newColor = this.rgbToHex(newRgb.r, newRgb.g, newRgb.b);
      currentRatio = this.getContrastRatio(newColor, background);
    }

    const finalRgb = this.hslToRgb(hsl.h, hsl.s, hsl.l);
    return this.rgbToHex(finalRgb.r, finalRgb.g, finalRgb.b);
  }

  static generateDarkTheme(lightTokens: Record<string, unknown>): Record<string, unknown> {
    const darkTokens: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(lightTokens)) {
      if (typeof value === 'string' && value.startsWith('#')) {
        const rgb = this.hexToRgb(value);
        if (rgb) {
          const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
          hsl.l = 100 - hsl.l;
          const newRgb = this.hslToRgb(hsl.h, hsl.s, hsl.l);
          darkTokens[key] = this.rgbToHex(newRgb.r, newRgb.g, newRgb.b);
        } else {
          darkTokens[key] = value;
        }
      } else if (typeof value === 'object' && value !== null) {
        darkTokens[key] = this.generateDarkTheme(value as Record<string, unknown>);
      } else {
        darkTokens[key] = value;
      }
    }

    return darkTokens;
  }

  private static getLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map(val => {
      val = val / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }
}

