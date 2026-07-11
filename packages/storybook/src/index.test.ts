import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TokiForgeStorybookAddon, withTokiForge, tokiforgeParameters } from './index';
import type { ThemeConfig } from '@tokiforge/core';

vi.mock('@tokiforge/core', async () => {
  const actual = await vi.importActual('@tokiforge/core');
  return {
    ...actual,
    ThemeRuntime: class MockThemeRuntime {
      constructor(config: ThemeConfig) {
        this.themes = config.themes || [];
        this.config = config;
        this.currentTheme = config.defaultTheme || this.themes[0]?.name || 'default';
      }

      init = vi.fn().mockResolvedValue(undefined);
      applyTheme = vi.fn().mockResolvedValue(undefined);
      getCurrentTheme = vi.fn();
      destroy = vi.fn();

      getAvailableThemes() {
        return this.themes.map((t: any) => t.name);
      }

      getThemeTokens(name: string) {
        const theme = this.themes.find((t: any) => t.name === name);
        return theme?.tokens || {};
      }

      private themes: any[];
      private config: any;
      private currentTheme: string;
    } as any,
  };
});

describe('Storybook Integration', () => {
  const testConfig: ThemeConfig = {
    themes: [
      {
        name: 'light',
        tokens: {
          color: { primary: { value: '#7C3AED', type: 'color' } },
        },
      },
      {
        name: 'dark',
        tokens: {
          color: { primary: { value: '#A78BFA', type: 'color' } },
        },
      },
    ],
    defaultTheme: 'light',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('TokiForgeStorybookAddon', () => {
    it('should construct with config', () => {
      const addon = new TokiForgeStorybookAddon({ config: testConfig });

      expect(addon).toBeDefined();
    });

    it('should get current theme', () => {
      const addon = new TokiForgeStorybookAddon({ config: testConfig });
      expect(addon.getCurrentTheme()).toBe('light');
    });

    it('should get available themes', () => {
      const addon = new TokiForgeStorybookAddon({ config: testConfig });
      expect(addon.getAvailableThemes()).toEqual(['light', 'dark']);
    });

    it('should get tokens for current theme', () => {
      const addon = new TokiForgeStorybookAddon({ config: testConfig });
      const tokens = addon.getTokens();
      expect(tokens).toBeDefined();
      expect((tokens as any).color?.primary?.value).toBe('#7C3AED');
    });

    it('should get tokens for a specific theme', () => {
      const addon = new TokiForgeStorybookAddon({ config: testConfig });
      const tokens = addon.getThemeTokens('dark');
      expect((tokens as any).color?.primary?.value).toBe('#A78BFA');
    });

    it('should switch theme', async () => {
      const addon = new TokiForgeStorybookAddon({ config: testConfig });
      await addon.switchTheme('dark');
      expect(addon.getCurrentTheme()).toBe('dark');
    });

    it('should throw when switching to non-existent theme', async () => {
      const addon = new TokiForgeStorybookAddon({ config: testConfig });
      await expect(addon.switchTheme('nonexistent')).rejects.toThrow('Theme "nonexistent" not found');
    });

    it('should init without error when window is undefined', async () => {
      const addon = new TokiForgeStorybookAddon({ config: testConfig });
      await expect(addon.init()).resolves.toBeUndefined();
    });

    it('should apply default options', () => {
      const addon = new TokiForgeStorybookAddon({ config: testConfig });
      expect((addon as any).config.selector).toBe(':root');
      expect((addon as any).config.prefix).toBe('hf');
      expect((addon as any).config.enableThemeSwitcher).toBe(true);
      expect((addon as any).config.enableTokenViewer).toBe(true);
    });

    it('should override default options', () => {
      const addon = new TokiForgeStorybookAddon({
        config: testConfig,
        selector: '#app',
        prefix: 'custom',
        enableThemeSwitcher: false,
        enableTokenViewer: false,
      });
      expect((addon as any).config.selector).toBe('#app');
      expect((addon as any).config.prefix).toBe('custom');
      expect((addon as any).config.enableThemeSwitcher).toBe(false);
      expect((addon as any).config.enableTokenViewer).toBe(false);
    });
  });

  describe('withTokiForge', () => {
    it('should return a decorator function', () => {
      const decorator = withTokiForge({ config: testConfig });
      expect(typeof decorator).toBe('function');
    });
  });

  describe('tokiforgeParameters', () => {
    it('should return theme parameters', () => {
      const params = tokiforgeParameters({ config: testConfig });
      expect(params).toBeDefined();
      expect(params.tokiforge).toBeDefined();
      expect(params.tokiforge.themes).toEqual(['light', 'dark']);
      expect(params.tokiforge.defaultTheme).toBe('light');
    });
  });
});
