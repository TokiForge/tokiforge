import type { ColorRGB, ColorHSL } from './types';

export class ColorUtils {
  static hexToRGB(hex: string): ColorRGB {
    const cleanHex = hex.replace('#', '');
    const r = Number.parseInt(cleanHex.substring(0, 2), 16);
    const g = Number.parseInt(cleanHex.substring(2, 4), 16);
    const b = Number.parseInt(cleanHex.substring(4, 6), 16);
    return { r, g, b };
  }

  static rgbToHex(rgb: ColorRGB): string {
    const toHex = (n: number): string => {
      const hex = Math.round(n).toString(16);
      return hex.length === 1 ? `0${hex}` : hex;
    };
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
  }

  static rgbToHSL(rgb: ColorRGB): ColorHSL {
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

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
        default:
          break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  }

  static hslToRGB(hsl: ColorHSL): ColorRGB {
    const h = hsl.h / 360;
    const s = hsl.s / 100;
    const l = hsl.l / 100;

    let r: number;
    let g: number;
    let b: number;

    if (s === 0) {
      r = l;
      g = l;
      b = l;
    } else {
      // S1226: extract param to local variable to avoid parameter mutation
      const hue2rgb = (p: number, q: number, tIn: number): number => {
        let t = tIn;
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

  static darken(hex: string, amount: number): string {
    const rgb = this.hexToRGB(hex);
    const hsl = this.rgbToHSL(rgb);
    hsl.l = Math.max(0, hsl.l - amount);
    const newRgb = this.hslToRGB(hsl);
    return this.rgbToHex(newRgb);
  }

  static lighten(hex: string, amount: number): string {
    const rgb = this.hexToRGB(hex);
    const hsl = this.rgbToHSL(rgb);
    hsl.l = Math.min(100, hsl.l + amount);
    const newRgb = this.hslToRGB(hsl);
    return this.rgbToHex(newRgb);
  }

  static getContrastRatio(color1: string, color2: string): number {
    const getLuminance = (hex: string): number => {
      const rgb = this.hexToRGB(hex);
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

    return Math.round(ratio * 100) / 100;
  }
}
