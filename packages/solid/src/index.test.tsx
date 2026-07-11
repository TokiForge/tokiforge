import { describe, it, expect, vi, beforeEach } from 'vitest';

import { createTheme } from './index';
import type { ThemeConfig } from '@tokiforge/core';

vi.mock('@tokiforge/core', async () => {
  const actual = await vi.importActual('@tokiforge/core');
  return {
    ...actual,
    ThemeController: class MockThemeController {
      constructor(config: any, options?: any) {
        const opts = options || {};
        const themes = config.themes || [];
        this.themes = themes;
        this.currentTheme = opts.defaultTheme || config.defaultTheme || themes[0]?.name || 'light';
        this.listeners = new Set<(snapshot: { theme: string; tokens: any }) => void>();
      }

      subscribe(cb: (snapshot: { theme: string; tokens: any }) => void) {
        this.listeners.add(cb);
        return () => this.listeners.delete(cb);
      }

      getSnapshot() {
        return {
          theme: this.currentTheme,
          tokens: this.themes.find((t: any) => t.name === this.currentTheme)?.tokens || {},
        };
      }

      init = vi.fn();
      destroy = vi.fn();

      setTheme = vi.fn((name: string) => {
        this.currentTheme = name;
        this.listeners.forEach((l: any) => l({ theme: this.currentTheme, tokens: this.themes.find((t: any) => t.name === this.currentTheme)?.tokens || {} }));
      });

      nextTheme = vi.fn(() => {
        const names = this.themes.map((t: any) => t.name);
        const idx = names.indexOf(this.currentTheme);
        if (idx !== -1) {
          this.currentTheme = names[(idx + 1) % names.length];
          this.listeners.forEach((l: any) => l({ theme: this.currentTheme, tokens: this.themes.find((t: any) => t.name === this.currentTheme)?.tokens || {} }));
        }
      });

      getAvailableThemes() {
        return this.themes.map((t: any) => t.name);
      }

      get runtime() {
        return {
          init: vi.fn(),
          applyTheme: vi.fn(),
          getCurrentTheme: () => this.currentTheme,
          getAvailableThemes: () => this.themes.map((t: any) => t.name),
          getThemeTokens: (name: string) =>
            this.themes.find((t: any) => t.name === name)?.tokens || {},
          destroy: vi.fn(),
        };
      }

      private themes: any[];
      private currentTheme: string;
      private listeners: Set<(snapshot: { theme: string; tokens: any }) => void>;
    },
  };
});

describe('Solid Integration', () => {
  const testConfig: ThemeConfig = {
    themes: [
      {
        name: 'light',
        tokens: {
          color: {
            primary: { value: '#7C3AED', type: 'color' },
            background: { value: '#FFFFFF', type: 'color' },
          },
        },
      },
      {
        name: 'dark',
        tokens: {
          color: {
            primary: { value: '#A78BFA', type: 'color' },
            background: { value: '#1F2937', type: 'color' },
          },
        },
      },
    ],
    defaultTheme: 'light',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createTheme', () => {
    it('should return a theme context object', () => {
      const ctx = createTheme(testConfig);

      expect(ctx).toBeDefined();
      expect(typeof ctx.theme).toBe('function');
      expect(typeof ctx.tokens).toBe('function');
      expect(typeof ctx.setTheme).toBe('function');
      expect(typeof ctx.nextTheme).toBe('function');
      expect(typeof ctx.availableThemes).toBe('function');
      expect(ctx.runtime).toBeDefined();
    });

    it('should initialize with default theme', () => {
      const ctx = createTheme(testConfig);
      expect(ctx.theme()).toBe('light');
    });

    it('should initialize with configured default theme', () => {
      const ctx = createTheme(testConfig, { defaultTheme: 'dark' });
      expect(ctx.theme()).toBe('dark');
    });

    it('should return available themes', () => {
      const ctx = createTheme(testConfig);
      expect(ctx.availableThemes()).toEqual(['light', 'dark']);
    });

    it('should return tokens for current theme', () => {
      const ctx = createTheme(testConfig);
      const t = ctx.tokens();
      expect(t).toBeDefined();
      expect((t as any).color?.primary?.value).toBe('#7C3AED');
    });
  });

  describe('Theme Switching', () => {
    it('should switch themes with setTheme', async () => {
      const ctx = createTheme(testConfig);

      expect(ctx.theme()).toBe('light');

      await ctx.setTheme('dark');
      expect(ctx.theme()).toBe('dark');
    });

    it('should cycle themes with nextTheme', async () => {
      const ctx = createTheme(testConfig);

      await ctx.nextTheme();
      expect(ctx.theme()).toBe('dark');
    });

    it('should update tokens when theme changes', async () => {
      const ctx = createTheme(testConfig);

      await ctx.setTheme('dark');
      const t = ctx.tokens();
      expect((t as any).color?.primary?.value).toBe('#A78BFA');
    });
  });
});
