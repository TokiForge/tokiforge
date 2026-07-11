import { describe, it, expect } from 'vitest';
import { BrandManager } from '../brand-manager';
import type { DesignTokens } from '../types';

const sharedTokens: DesignTokens = {
  color: {
    primary: { value: '#7C3AED', type: 'color' },
    background: { value: '#FFFFFF', type: 'color' },
  },
  spacing: {
    sm: { value: '8px', type: 'dimension' },
  },
};

const darkOverrides: DesignTokens = {
  color: {
    background: { value: '#111111', type: 'color' },
  },
};

describe('BrandManager', () => {
  it('resolves a brand without modes', () => {
    const brands = new BrandManager();
    brands.register({ name: 'acme', tokens: sharedTokens });

    expect(brands.resolve('acme')).toEqual(sharedTokens);
  });

  it('deep-merges mode overrides over brand tokens', () => {
    const brands = new BrandManager();
    brands.register({ name: 'acme', tokens: sharedTokens, modes: { dark: darkOverrides } });

    const dark = brands.resolve('acme', 'dark') as Record<string, Record<string, Record<string, unknown>>>;
    expect(dark.color.background.value).toBe('#111111');
    // untouched siblings survive the merge
    expect(dark.color.primary.value).toBe('#7C3AED');
    expect(dark.spacing.sm.value).toBe('8px');
  });

  it('supports brand inheritance via extends', () => {
    const brands = new BrandManager();
    brands.register({ name: 'acme', tokens: sharedTokens });
    brands.register({
      name: 'globex',
      extends: 'acme',
      tokens: { color: { primary: { value: '#0EA5E9', type: 'color' } } },
    });

    const globex = brands.resolve('globex') as Record<string, Record<string, Record<string, unknown>>>;
    expect(globex.color.primary.value).toBe('#0EA5E9');
    expect(globex.color.background.value).toBe('#FFFFFF'); // inherited
  });

  it('throws on circular inheritance', () => {
    const brands = new BrandManager();
    brands.register({ name: 'a', extends: 'b' });
    brands.register({ name: 'b', extends: 'a' });

    expect(() => brands.resolve('a')).toThrow(/circular/i);
  });

  it('expands the brand x mode matrix into a ThemeConfig', () => {
    const brands = new BrandManager();
    brands.register({ name: 'acme', tokens: sharedTokens, modes: { light: {}, dark: darkOverrides } });
    brands.register({ name: 'globex', extends: 'acme', modes: { light: {}, dark: darkOverrides } });

    const config = brands.toThemeConfig({ defaultTheme: 'acme-light' });
    expect(config.themes.map((t) => t.name)).toEqual([
      'acme-light',
      'acme-dark',
      'globex-light',
      'globex-dark',
    ]);
    expect(config.defaultTheme).toBe('acme-light');
  });

  it('names modeless brands after the brand itself', () => {
    const brands = new BrandManager();
    brands.register({ name: 'acme', tokens: sharedTokens });

    const config = brands.toThemeConfig();
    expect(config.themes[0].name).toBe('acme');
    expect(config.defaultTheme).toBe('acme');
  });

  it('errors on unknown brand or mode', () => {
    const brands = new BrandManager();
    brands.register({ name: 'acme', tokens: sharedTokens, modes: { dark: darkOverrides } });

    expect(() => brands.resolve('nope')).toThrow('Brand "nope" not found');
    expect(() => brands.resolve('acme', 'sepia')).toThrow('Mode "sepia" not found');
  });
});
