import type { ColorRGB, ColorHSL } from './types';

export class ColorUtils {
  static hexToRgb(hex: string): ColorRGB | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  static rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
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

    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  static hslToRgb(h: number, s: number, l: number): ColorRGB {
    h /= 360;
    s /= 100;
    l /= 100;

    let r: number, g: number, b: number;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number): number => {
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
    return this.lighten(hex, -percent);
  }

  static saturate(hex: string, percent: number): string {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return hex;

    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
    hsl.s = Math.min(100, Math.max(0, hsl.s + percent));

    const newRgb = this.hslToRgb(hsl.h, hsl.s, hsl.l);
    return this.rgbToHex(newRgb.r, newRgb.g, newRgb.b);
  }

  static desaturate(hex: string, percent: number): string {
    return this.saturate(hex, -percent);
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
    const getLuminance = (hex: string): number => {
      const rgb = this.hexToRgb(hex);
      if (!rgb) return 0;

      const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((val) => {
        val = val / 255;
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
      });

      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  static isAccessible(foreground: string, background: string, level: 'AA' | 'AAA' = 'AA'): boolean {
    const ratio = this.getContrastRatio(foreground, background);
    return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
  }

  static findAccessibleColor(foreground: string, background: string, level: 'AA' | 'AAA' = 'AA'): string {
    const rgb = this.hexToRgb(foreground);
    if (!rgb) return foreground;

    let currentColor = foreground;
    let attempts = 0;
    const maxAttempts = 100;

    while (!this.isAccessible(currentColor, background, level) && attempts < maxAttempts) {
      const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
      hsl.l = hsl.l > 50 ? Math.min(100, hsl.l + 5) : Math.max(0, hsl.l - 5);

      const newRgb = this.hslToRgb(hsl.h, hsl.s, hsl.l);
      currentColor = this.rgbToHex(newRgb.r, newRgb.g, newRgb.b);
      attempts++;
    }

    return currentColor;
  }

  static generateDarkTheme(lightTokens: Record<string, any>): Record<string, any> {
    const transform = (obj: any): any => {
      if (obj && typeof obj === 'object' && 'value' in obj) {
        if (typeof obj.value === 'string' && obj.value.startsWith('#')) {
          const rgb = this.hexToRgb(obj.value);
          if (rgb) {
            const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
            hsl.l = 100 - hsl.l;

            const newRgb = this.hslToRgb(hsl.h, hsl.s, hsl.l);
            return {
              ...obj,
              value: this.rgbToHex(newRgb.r, newRgb.g, newRgb.b),
            };
          }
        }
        return obj;
      }

      if (Array.isArray(obj)) {
        return obj.map(transform);
      }

      if (obj && typeof obj === 'object') {
        const result: Record<string, any> = {};
        for (const key in obj) {
          result[key] = transform(obj[key]);
        }
        return result;
      }

      return obj;
    };

    return transform(lightTokens);
  }
}

