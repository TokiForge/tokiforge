import type { ColorRGB, ColorHSL, ColorOKLCH } from './types';

export class ColorUtils {
  /**
   * Parse any of: #rgb, #rrggbb, rgb(), rgba(), hsl(), hsla().
   * Returns null when the string is not a recognized color.
   */
  static parseColor(color: string): ColorRGB | null {
    const input = color.trim();

    if (input.startsWith('#')) {
      const hex = input.slice(1);
      if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$|^[0-9a-fA-F]{8}$/.test(hex)) return null;
      return this.hexToRGB(input);
    }

    const rgbMatch = /^rgba?\(\s*([\d.]+)\s*[, ]\s*([\d.]+)\s*[, ]\s*([\d.]+)/i.exec(input);
    if (rgbMatch) {
      return {
        r: Math.min(255, Number.parseFloat(rgbMatch[1])),
        g: Math.min(255, Number.parseFloat(rgbMatch[2])),
        b: Math.min(255, Number.parseFloat(rgbMatch[3])),
      };
    }

    const hslMatch = /^hsla?\(\s*([\d.]+)(?:deg)?\s*[, ]\s*([\d.]+)%\s*[, ]\s*([\d.]+)%/i.exec(input);
    if (hslMatch) {
      return this.hslToRGB({
        h: Number.parseFloat(hslMatch[1]),
        s: Number.parseFloat(hslMatch[2]),
        l: Number.parseFloat(hslMatch[3]),
      });
    }

    return null;
  }
  static hexToRGB(hex: string): ColorRGB {
    let cleanHex = hex.replace('#', '');
    if (cleanHex.length === 3 || cleanHex.length === 4) {
      cleanHex = cleanHex
        .split('')
        .map((c) => c + c)
        .join('');
    }
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
    const rgb = this.parseColor(hex) ?? this.hexToRGB(hex);
    const hsl = this.rgbToHSL(rgb);
    hsl.l = Math.max(0, hsl.l - amount);
    const newRgb = this.hslToRGB(hsl);
    return this.rgbToHex(newRgb);
  }

  static lighten(hex: string, amount: number): string {
    const rgb = this.parseColor(hex) ?? this.hexToRGB(hex);
    const hsl = this.rgbToHSL(rgb);
    hsl.l = Math.min(100, hsl.l + amount);
    const newRgb = this.hslToRGB(hsl);
    return this.rgbToHex(newRgb);
  }

  /** sRGB → OKLCH (perceptually uniform; ideal for palette generation) */
  static rgbToOKLCH(rgb: ColorRGB): ColorOKLCH {
    const toLinear = (v: number): number => {
      const c = v / 255;
      return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };

    const r = toLinear(rgb.r);
    const g = toLinear(rgb.g);
    const b = toLinear(rgb.b);

    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

    const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
    const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
    const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

    const c = Math.sqrt(a * a + bb * bb);
    let h = (Math.atan2(bb, a) * 180) / Math.PI;
    if (h < 0) h += 360;

    return { l: L, c, h };
  }

  /** OKLCH → sRGB (clamped to gamut) */
  static oklchToRGB(oklch: ColorOKLCH): ColorRGB {
    const hRad = (oklch.h * Math.PI) / 180;
    const a = oklch.c * Math.cos(hRad);
    const bb = oklch.c * Math.sin(hRad);
    const L = oklch.l;

    const l = Math.pow(L + 0.3963377774 * a + 0.2158037573 * bb, 3);
    const m = Math.pow(L - 0.1055613458 * a - 0.0638541728 * bb, 3);
    const s = Math.pow(L - 0.0894841775 * a - 1.291485548 * bb, 3);

    const rLin = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
    const gLin = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
    const bLin = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

    const toSRGB = (v: number): number => {
      const c = v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
      return Math.round(Math.min(255, Math.max(0, c * 255)));
    };

    return { r: toSRGB(rLin), g: toSRGB(gLin), b: toSRGB(bLin) };
  }

  /**
   * Generate a tint/shade scale (50–900) from a base color, using OKLCH so
   * perceived hue and saturation stay stable across the scale.
   *
   * @example
   * ColorUtils.generateScale('#7C3AED')
   * // { 50: '#f6f2fe', 100: ..., ..., 500: '#7c3aed', ..., 900: '#2b1360' }
   */
  static generateScale(baseColor: string): Record<string, string> {
    const rgb = this.parseColor(baseColor);
    if (!rgb) {
      throw new Error(`Cannot parse color: ${baseColor}`);
    }
    const base = this.rgbToOKLCH(rgb);

    // Lightness targets tuned to match popular scales (Tailwind-like)
    const lightness: Record<string, number> = {
      '50': 0.97,
      '100': 0.93,
      '200': 0.87,
      '300': 0.78,
      '400': 0.68,
      '500': base.l,
      '600': Math.max(0.15, base.l - 0.08),
      '700': Math.max(0.12, base.l - 0.16),
      '800': Math.max(0.1, base.l - 0.24),
      '900': Math.max(0.08, base.l - 0.32),
    };

    const scale: Record<string, string> = {};
    for (const [step, l] of Object.entries(lightness)) {
      // Reduce chroma near the extremes so tints don't look neon
      const distance = Math.abs(l - base.l);
      const c = base.c * Math.max(0.12, 1 - distance * 1.6);
      scale[step] = this.rgbToHex(this.oklchToRGB({ l, c, h: base.h }));
    }
    return scale;
  }

  /** Mix two colors in OKLCH space. weight 0 → all color1, 1 → all color2. */
  static mix(color1: string, color2: string, weight = 0.5): string {
    const rgb1 = this.parseColor(color1);
    const rgb2 = this.parseColor(color2);
    if (!rgb1 || !rgb2) {
      throw new Error(`Cannot parse colors: ${color1}, ${color2}`);
    }
    const a = this.rgbToOKLCH(rgb1);
    const b = this.rgbToOKLCH(rgb2);
    const w = Math.min(1, Math.max(0, weight));

    // Interpolate hue along the shorter arc
    let dh = b.h - a.h;
    if (dh > 180) dh -= 360;
    if (dh < -180) dh += 360;

    return this.rgbToHex(
      this.oklchToRGB({
        l: a.l + (b.l - a.l) * w,
        c: a.c + (b.c - a.c) * w,
        h: (a.h + dh * w + 360) % 360,
      })
    );
  }

  static getContrastRatio(color1: string, color2: string): number {
    const getLuminance = (hex: string): number => {
      const rgb = this.parseColor(hex) ?? this.hexToRGB(hex);
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
