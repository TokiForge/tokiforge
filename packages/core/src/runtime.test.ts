import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ThemeRuntime } from './runtime';
import type { ThemeConfig, DesignTokens } from './types';

// Mock DOM environment
const mockDocument = {
  head: {
    appendChild: vi.fn(),
    querySelector: vi.fn(() => null),
  },
  createElement: vi.fn(() => ({
    id: '',
    textContent: '',
    remove: vi.fn(),
  })),
};

const mockWindow = {
  dispatchEvent: vi.fn(),
};

describe('ThemeRuntime', () => {
  beforeEach(() => {
    vi.stubGlobal('document', mockDocument);
    vi.stubGlobal('window', mockWindow);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const createConfig = (): ThemeConfig => ({
    themes: [
      {
        name: 'light',
        tokens: {
          color: {
            primary: { value: '#7C3AED', type: 'color' },
          },
        },
      },
      {
        name: 'dark',
        tokens: {
          color: {
            primary: { value: '#A78BFA', type: 'color' },
          },
        },
      },
    ],
    defaultTheme: 'light',
  });

  describe('constructor', () => {
    it('should create runtime with themes', () => {
      const config = createConfig();
      const runtime = new ThemeRuntime(config);

      expect(runtime.getAvailableThemes()).toHaveLength(2);
    });

    it('should use first theme as default if not specified', () => {
      const config = createConfig();
      delete config.defaultTheme;
      const runtime = new ThemeRuntime(config);

      expect(runtime.getCurrentTheme()).toBe('light');
    });
  });

  describe('init', () => {
    it('should initialize theme in browser environment', () => {
      const runtime = new ThemeRuntime(createConfig());
      runtime.init();

      expect(mockDocument.createElement).toHaveBeenCalledWith('style');
      expect(mockDocument.head.appendChild).toHaveBeenCalled();
    });

    it('should not throw in non-browser environment', () => {
      vi.stubGlobal('document', undefined);
      const runtime = new ThemeRuntime(createConfig());

      expect(() => runtime.init()).not.toThrow();
    });
  });

  describe('applyTheme', () => {
    it('should apply theme', () => {
      const runtime = new ThemeRuntime(createConfig());
      runtime.init();
      runtime.applyTheme('dark');

      expect(runtime.getCurrentTheme()).toBe('dark');
      expect(mockWindow.dispatchEvent).toHaveBeenCalled();
    });

    it('should throw for non-existent theme', () => {
      const runtime = new ThemeRuntime(createConfig());
      runtime.init();

      expect(() => {
        runtime.applyTheme('nonexistent');
      }).toThrow('Theme "nonexistent" not found');
    });
  });

  describe('getCurrentTheme', () => {
    it('should return current theme', () => {
      const runtime = new ThemeRuntime(createConfig());
      expect(runtime.getCurrentTheme()).toBe('light');
    });
  });

  describe('getAvailableThemes', () => {
    it('should return all theme names', () => {
      const runtime = new ThemeRuntime(createConfig());
      const themes = runtime.getAvailableThemes();

      expect(themes).toContain('light');
      expect(themes).toContain('dark');
    });
  });

  describe('getThemeTokens', () => {
    it('should return tokens for theme', () => {
      const runtime = new ThemeRuntime(createConfig());
      const tokens = runtime.getThemeTokens('light');

      expect(tokens.color.primary.value).toBe('#7C3AED');
    });

    it('should return different tokens for different themes', () => {
      const runtime = new ThemeRuntime(createConfig());
      const lightTokens = runtime.getThemeTokens('light');
      const darkTokens = runtime.getThemeTokens('dark');

      expect(lightTokens.color.primary.value).not.toBe(darkTokens.color.primary.value);
    });
  });

  describe('nextTheme', () => {
    it('should cycle through themes', () => {
      const runtime = new ThemeRuntime(createConfig());
      runtime.init();

      const first = runtime.nextTheme();
      expect(first).toBe('dark');

      const second = runtime.nextTheme();
      expect(second).toBe('light');
    });
  });

  describe('destroy', () => {
    it('should clean up style element', () => {
      const runtime = new ThemeRuntime(createConfig());
      runtime.init();
      const removeSpy = vi.fn();
      if (runtime['styleElement']) {
        runtime['styleElement'].remove = removeSpy;
      }
      runtime.destroy();
      expect(removeSpy).toHaveBeenCalled();
    });
  });
});

