import { describe, it, expect } from 'vitest';
import { createThemeStore } from './stores';
import { get } from 'svelte/store';
import type { ThemeConfig } from '@tokiforge/core';

describe('Svelte Integration', () => {
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

    it('should provide runtime instance', () => {
      const store = createThemeStore(testConfig);

      expect(store.runtime).toBeDefined();
    });

    it('should provide setTheme method', () => {
      const store = createThemeStore(testConfig);

      expect(typeof store.setTheme).toBe('function');
    });

    it('should provide nextTheme method', () => {
      const store = createThemeStore(testConfig);

      expect(typeof store.nextTheme).toBe('function');
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
      
      let currentTheme = get(store.theme);
      expect(currentTheme).toBe('light');

      await store.nextTheme();
      currentTheme = get(store.theme);

      expect(currentTheme).toBe('dark');
    });

    it('should wrap around to first theme', async () => {
      const store = createThemeStore(testConfig);

      await store.setTheme('dark');
      let currentTheme = get(store.theme);
      expect(currentTheme).toBe('dark');

      await store.nextTheme();
      currentTheme = get(store.theme);

      expect(currentTheme).toBe('light');
    });
  });

  describe('Store Reactivity', () => {
    it('should notify subscribers when theme changes', async () => {
      const store = createThemeStore(testConfig);
      let callCount = 0;
      let resolvePromise: () => void;
      const promise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });

      store.theme.subscribe((value) => {
        callCount++;
        if (callCount === 1) {
          expect(value).toBe('light');
        } else if (callCount === 2) {
          expect(value).toBe('dark');
          resolvePromise();
        }
      });

      await store.setTheme('dark');
      await promise;
    });

    it('should provide available themes through derived store', () => {
      const store = createThemeStore(testConfig);
      
      const themes = get(store.availableThemes);
      expect(themes).toEqual(['light', 'dark']);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid theme name gracefully', async () => {
      const store = createThemeStore(testConfig);

      // ThemeRuntime should handle this internally
      await expect(store.setTheme('nonexistent')).rejects.toThrow();
    });

    it('should require at least one theme', () => {
      const invalidConfig: ThemeConfig = {
        themes: [],
      };

      expect(() => {
        createThemeStore(invalidConfig);
      }).toThrow();
    });
  });

  describe('Integration with ThemeRuntime', () => {
    it('should use provided config options', () => {
      const customConfig: ThemeConfig = {
        themes: [
          {
            name: 'custom',
            tokens: {
              color: { primary: { value: '#FF0000', type: 'color' } },
            },
          },
        ],
        defaultTheme: 'custom',
      };

      const store = createThemeStore(customConfig, '#app', 'custom', 'custom');
      const currentTheme = get(store.theme);

      expect(currentTheme).toBe('custom');
    });

    it('should provide runtime destroy method', () => {
      const store = createThemeStore(testConfig);

      expect(store.runtime).toBeDefined();
      expect(typeof store.runtime.destroy).toBe('function');
    });
  });
});
