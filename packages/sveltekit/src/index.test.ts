import { describe, it, expect, vi, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { createThemeStore } from './index';
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

describe('SvelteKit Integration', () => {
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

  describe('createThemeStore', () => {
    it('should create a theme store object', () => {
      const store = createThemeStore(testConfig);

      expect(store).toBeDefined();
      expect(store.theme).toBeDefined();
      expect(store.tokens).toBeDefined();
      expect(typeof store.theme.subscribe).toBe('function');
    });

    it('should initialize with default theme', () => {
      const store = createThemeStore(testConfig);
      const currentTheme = get(store.theme);
      expect(currentTheme).toBe('light');
    });

    it('should support ssrTheme option', () => {
      const store = createThemeStore(testConfig, { ssrTheme: 'dark' });
      const currentTheme = get(store.theme);
      expect(currentTheme).toBe('dark');
    });

    it('should provide setTheme method', () => {
      const store = createThemeStore(testConfig);
      expect(typeof store.setTheme).toBe('function');
    });

    it('should provide nextTheme method', () => {
      const store = createThemeStore(testConfig);
      expect(typeof store.nextTheme).toBe('function');
    });

    it('should provide runtime instance', () => {
      const store = createThemeStore(testConfig);
      expect(store.runtime).toBeDefined();
    });

    it('should provide availableThemes derived store', () => {
      const store = createThemeStore(testConfig);
      expect(store.availableThemes).toBeDefined();
      expect(typeof store.availableThemes.subscribe).toBe('function');
    });
  });

  describe('Theme Switching', () => {
    it('should switch themes with setTheme', async () => {
      const store = createThemeStore(testConfig);

      let currentTheme = get(store.theme);
      expect(currentTheme).toBe('light');

      await store.setTheme('dark');
      currentTheme = get(store.theme);
      expect(currentTheme).toBe('dark');
    });

    it('should cycle themes with nextTheme', async () => {
      const store = createThemeStore(testConfig);

      await store.nextTheme();
      const currentTheme = get(store.theme);
      expect(currentTheme).toBe('dark');
    });
  });
});
