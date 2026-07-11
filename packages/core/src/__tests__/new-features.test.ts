import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TokenExporter } from '../token-exporter';
import { TokenParser } from '../token-parser';
import { ColorUtils } from '../color-utils';
import { AccessibilityUtils } from '../accessibility-utils';
import { ThemeController } from '../theme-controller';
import type { DesignTokens, ThemeConfig } from '../types';

/**
 * Contract: every package (CLI dev server, Tailwind preset, framework
 * adapters, docs) assumes nested token paths flatten to FULL-path CSS
 * variable names. color.primary must become --hf-color-primary, never
 * --hf-primary. Do not change these expectations without migrating every
 * consumer.
 */
describe('CSS variable naming contract', () => {
  const tokens: DesignTokens = {
    color: {
      primary: { value: '#7C3AED', type: 'color' },
      background: {
        default: { value: '#FFFFFF', type: 'color' },
      },
    },
    spacing: {
      sm: { value: '8px', type: 'dimension' },
    },
  };

  it('flattens nested paths into full-path variable names', () => {
    const flat = TokenExporter.flattenTokens(tokens);
    expect(flat).toEqual({
      'hf-color-primary': '#7C3AED',
      'hf-color-background-default': '#FFFFFF',
      'hf-spacing-sm': '8px',
    });
  });

  it('keeps same-named leaves in different groups distinct', () => {
    const collisionTokens: DesignTokens = {
      color: { primary: { value: '#111111', type: 'color' } },
      font: { primary: { value: 'Inter', type: 'fontFamily' } },
    };
    const flat = TokenExporter.flattenTokens(collisionTokens);
    expect(flat['hf-color-primary']).toBe('#111111');
    expect(flat['hf-font-primary']).toBe('Inter');
  });

  it('respects a custom prefix', () => {
    const flat = TokenExporter.flattenTokens(tokens, 'app');
    expect(flat['app-color-primary']).toBe('#7C3AED');
  });

  it('exports full-path names in CSS', () => {
    const css = TokenExporter.exportCSS(tokens);
    expect(css).toContain('--hf-color-primary: #7C3AED;');
    expect(css).toContain('--hf-color-background-default: #FFFFFF;');
  });
});

describe('DTCG format support', () => {
  it('normalizes $value/$type/$description to internal format', () => {
    const dtcg = {
      color: {
        primary: { $value: '#7C3AED', $type: 'color', $description: 'Brand purple' },
      },
    } as unknown as DesignTokens;

    const normalized = TokenParser.normalizeDTCG(dtcg) as Record<string, Record<string, Record<string, unknown>>>;
    expect(normalized.color.primary.value).toBe('#7C3AED');
    expect(normalized.color.primary.type).toBe('color');
    expect(normalized.color.primary.description).toBe('Brand purple');
  });

  it('passes non-DTCG trees through untouched', () => {
    const internal: DesignTokens = {
      color: { primary: { value: '#7C3AED', type: 'color' } },
    };
    expect(TokenParser.normalizeDTCG(internal)).toEqual(internal);
  });

  it('round-trips internal format to DTCG', () => {
    const internal: DesignTokens = {
      color: { primary: { value: '#7C3AED', type: 'color', description: 'Brand' } },
    };
    const dtcg = TokenParser.toDTCG(internal) as Record<string, Record<string, Record<string, unknown>>>;
    expect(dtcg.color.primary.$value).toBe('#7C3AED');
    expect(dtcg.color.primary.$type).toBe('color');
    expect(dtcg.color.primary.$description).toBe('Brand');
    expect(TokenParser.normalizeDTCG(dtcg as DesignTokens)).toEqual(internal);
  });
});

describe('Chained token references', () => {
  it('resolves references that point at other references', () => {
    const tokens: DesignTokens = {
      base: { purple: { value: '#7C3AED', type: 'color' } },
      alias: { brand: { value: '{base.purple}', type: 'color' } },
      semantic: { action: { value: '{alias.brand}', type: 'color' } },
    };

    const expanded = TokenParser.expandReferences(tokens) as Record<string, Record<string, Record<string, unknown>>>;
    expect(expanded.alias.brand.value).toBe('#7C3AED');
    expect(expanded.semantic.action.value).toBe('#7C3AED');
  });

  it('does not loop on circular references', () => {
    const tokens: DesignTokens = {
      a: { value: '{b}', type: 'color' },
      b: { value: '{a}', type: 'color' },
    } as unknown as DesignTokens;

    expect(() => TokenParser.expandReferences(tokens)).not.toThrow();
  });
});

describe('Composite tokens', () => {
  it('flattens typography objects into per-part variables', () => {
    const tokens: DesignTokens = {
      typography: {
        heading: {
          value: { fontFamily: 'Inter', fontSize: '32px', fontWeight: 700 },
          type: 'typography',
        },
      },
    };
    const flat = TokenExporter.flattenTokens(tokens);
    expect(flat['hf-typography-heading-fontfamily']).toBe('Inter');
    expect(flat['hf-typography-heading-fontsize']).toBe('32px');
    expect(flat['hf-typography-heading-fontweight']).toBe('700');
  });

  it('composes shadow tokens into a box-shadow string', () => {
    const tokens: DesignTokens = {
      shadow: {
        md: {
          value: { offsetX: '0px', offsetY: '4px', blur: '8px', spread: '0px', color: 'rgba(0,0,0,0.2)' },
          type: 'shadow',
        },
      },
    };
    const flat = TokenExporter.flattenTokens(tokens);
    expect(flat['hf-shadow-md']).toBe('0px 4px 8px 0px rgba(0,0,0,0.2)');
  });

  it('joins fontFamily stacks', () => {
    const tokens: DesignTokens = {
      font: {
        body: { value: ['Inter', 'system-ui', 'sans-serif'], type: 'fontFamily' },
      },
    };
    const flat = TokenExporter.flattenTokens(tokens);
    expect(flat['hf-font-body']).toBe('Inter, system-ui, sans-serif');
  });
});

describe('light-dark() export', () => {
  it('merges light and dark themes into light-dark() declarations', () => {
    const light: DesignTokens = { color: { bg: { value: '#FFFFFF', type: 'color' } } };
    const dark: DesignTokens = { color: { bg: { value: '#111111', type: 'color' } } };

    const css = TokenExporter.exportLightDarkCSS(light, dark);
    expect(css).toContain('color-scheme: light dark;');
    expect(css).toContain('--hf-color-bg: light-dark(#FFFFFF, #111111);');
  });

  it('emits a plain value when both themes agree', () => {
    const light: DesignTokens = { spacing: { sm: { value: '8px', type: 'dimension' } } };
    const dark: DesignTokens = { spacing: { sm: { value: '8px', type: 'dimension' } } };

    const css = TokenExporter.exportLightDarkCSS(light, dark);
    expect(css).toContain('--hf-spacing-sm: 8px;');
    expect(css).not.toContain('light-dark(8px, 8px)');
  });
});

describe('ColorUtils additions', () => {
  it('parses shorthand hex', () => {
    expect(ColorUtils.hexToRGB('#fff')).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('parses rgb() and hsl() strings', () => {
    expect(ColorUtils.parseColor('rgb(124, 58, 237)')).toEqual({ r: 124, g: 58, b: 237 });
    const fromHsl = ColorUtils.parseColor('hsl(0, 100%, 50%)');
    expect(fromHsl).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('returns null for unrecognized colors', () => {
    expect(ColorUtils.parseColor('not-a-color')).toBeNull();
  });

  it('round-trips through OKLCH within rounding error', () => {
    const rgb = { r: 124, g: 58, b: 237 };
    const back = ColorUtils.oklchToRGB(ColorUtils.rgbToOKLCH(rgb));
    expect(Math.abs(back.r - rgb.r)).toBeLessThanOrEqual(2);
    expect(Math.abs(back.g - rgb.g)).toBeLessThanOrEqual(2);
    expect(Math.abs(back.b - rgb.b)).toBeLessThanOrEqual(2);
  });

  it('generates a 10-step scale with the base at 500', () => {
    const scale = ColorUtils.generateScale('#7C3AED');
    expect(Object.keys(scale)).toHaveLength(10);
    expect(scale['500'].toLowerCase()).toBe('#7c3aed');
    // 50 must be lighter than 900
    const l50 = ColorUtils.rgbToOKLCH(ColorUtils.hexToRGB(scale['50'])).l;
    const l900 = ColorUtils.rgbToOKLCH(ColorUtils.hexToRGB(scale['900'])).l;
    expect(l50).toBeGreaterThan(l900);
  });

  it('mixes colors perceptually', () => {
    const mixed = ColorUtils.mix('#000000', '#FFFFFF', 0.5);
    const { l } = ColorUtils.rgbToOKLCH(ColorUtils.hexToRGB(mixed));
    expect(l).toBeGreaterThan(0.3);
    expect(l).toBeLessThan(0.7);
  });
});

describe('APCA contrast', () => {
  it('returns high positive Lc for dark text on white', () => {
    const lc = AccessibilityUtils.calculateAPCA('#000000', '#FFFFFF');
    expect(lc).toBeGreaterThan(100);
  });

  it('returns negative Lc for light text on dark background', () => {
    const lc = AccessibilityUtils.calculateAPCA('#FFFFFF', '#000000');
    expect(lc).toBeLessThan(-100);
  });

  it('returns ~0 for identical colors', () => {
    expect(AccessibilityUtils.calculateAPCA('#777777', '#777777')).toBe(0);
  });
});

describe('ThemeController', () => {
  const config: ThemeConfig = {
    themes: [
      { name: 'light', tokens: { color: { primary: { value: '#7C3AED', type: 'color' } } } },
      { name: 'dark', tokens: { color: { primary: { value: '#A78BFA', type: 'color' } } } },
    ],
    defaultTheme: 'light',
  };

  beforeEach(() => {
    try {
      window.localStorage.removeItem('tokiforge-theme');
    } catch {
      // localStorage may be unavailable in this environment
    }
  });

  it('starts with the resolved default theme and its tokens', () => {
    const controller = new ThemeController(config, { persist: false });
    expect(controller.getTheme()).toBe('light');
    expect(controller.getTokens()).toEqual(config.themes[0].tokens);
  });

  it('notifies subscribers on theme change', () => {
    const controller = new ThemeController(config, { persist: false });
    controller.init();

    const listener = vi.fn();
    controller.subscribe(listener);
    controller.setTheme('dark');

    expect(listener).toHaveBeenCalledWith({
      theme: 'dark',
      tokens: config.themes[1].tokens,
    });
    controller.destroy();
  });

  it('cycles themes with nextTheme', () => {
    const controller = new ThemeController(config, { persist: false });
    controller.init();
    expect(controller.nextTheme()).toBe('dark');
    expect(controller.getTheme()).toBe('dark');
    controller.destroy();
  });

  it('unsubscribe stops notifications', () => {
    const controller = new ThemeController(config, { persist: false });
    controller.init();

    const listener = vi.fn();
    const unsubscribe = controller.subscribe(listener);
    unsubscribe();
    controller.setTheme('dark');

    expect(listener).not.toHaveBeenCalled();
    controller.destroy();
  });
});
