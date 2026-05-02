import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ThemeRuntime } from './theme-runtime';
import { ThemeError } from './types';
import type { ThemeConfig, DesignTokens } from './types';

const lightTokens: DesignTokens = {
  color: {
    primary: { value: '#7C3AED', type: 'color' },
    secondary: { value: '#06B6D4', type: 'color' },
  },
  spacing: {
    sm: { value: '8px', type: 'dimension' },
    md: { value: '16px', type: 'dimension' },
  },
};

const darkTokens: DesignTokens = {
  color: {
    primary: { value: '#A78BFA', type: 'color' },
    secondary: { value: '#22D3EE', type: 'color' },
  },
  spacing: {
    sm: { value: '8px', type: 'dimension' },
    md: { value: '16px', type: 'dimension' },
  },
};

const highContrastTokens: DesignTokens = {
  color: {
    primary: { value: '#000000', type: 'color' },
    secondary: { value: '#FFFFFF', type: 'color' },
  },
  spacing: {
    sm: { value: '8px', type: 'dimension' },
    md: { value: '16px', type: 'dimension' },
  },
};

describe('ThemeRuntime', () => {
  let config: ThemeConfig;

  beforeEach(() => {
    config = {
      themes: [
        { name: 'light', tokens: lightTokens },
        { name: 'dark', tokens: darkTokens },
        { name: 'high-contrast', tokens: highContrastTokens },
      ],
      defaultTheme: 'light',
    };

    // Mock document for browser environment
    Object.defineProperty(global, 'document', {
      value: {
        createElement: vi.fn(() => ({
          id: '',
          textContent: '',
          remove: vi.fn(),
        })),
        getElementById: vi.fn(() => null),
        head: {
          appendChild: vi.fn(),
        },
      },
      writable: true,
      configurable: true,
    });

    Object.defineProperty(global, 'window', {
      value: {
        dispatchEvent: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        matchMedia: vi.fn(() => ({
          matches: false,
          media: '',
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Constructor', () => {
    it('should create instance with valid config', () => {
      const runtime = new ThemeRuntime(config);
      expect(runtime).toBeInstanceOf(ThemeRuntime);
    });

    it('should throw error if no themes provided', () => {
      expect(() => {
        new ThemeRuntime({ themes: [] });
      }).toThrow(ThemeError);
    });

    it('should throw error if theme has no name', () => {
      expect(() => {
        new ThemeRuntime({
          themes: [{ name: '', tokens: lightTokens }],
        });
      }).toThrow(ThemeError);
    });

    it('should throw error if defaultTheme not found', () => {
      expect(() => {
        new ThemeRuntime({
          themes: [
            { name: 'light', tokens: lightTokens },
            { name: 'dark', tokens: darkTokens },
          ],
          defaultTheme: 'nonexistent',
        });
      }).toThrow(ThemeError);
    });

    it('should use first theme as default if defaultTheme not specified', () => {
      const runtime = new ThemeRuntime({
        themes: [
          { name: 'light', tokens: lightTokens },
          { name: 'dark', tokens: darkTokens },
        ],
      });
      expect(runtime.getCurrentTheme()).toBeNull();
    });
  });

  describe('init', () => {
    it('should initialize with default theme', () => {
      const runtime = new ThemeRuntime(config);
      runtime.init();
      expect(runtime.getCurrentTheme()).toBe('light');
    });

    it('should initialize with custom selector and prefix', () => {
      const runtime = new ThemeRuntime(config);
      runtime.init(':root', 'myapp');
      expect(runtime.getCurrentTheme()).toBe('light');
    });

    it('should be SSR-safe (no error in server environment)', () => {
      const originalDocument = global.document;
      // @ts-ignore
      delete global.document;

      const runtime = new ThemeRuntime(config);
      expect(() => runtime.init()).not.toThrow();

      global.document = originalDocument;
    });

    it('should remain synchronous and return void', () => {
      const runtime = new ThemeRuntime(config);
      const result = runtime.init();
      expect(result).toBeUndefined();
      expect(runtime.getCurrentTheme()).toBe('light');
    });
  });

  describe('applyTheme', () => {
    it('should apply theme successfully', () => {
      const runtime = new ThemeRuntime(config);
      runtime.applyTheme('dark');
      expect(runtime.getCurrentTheme()).toBe('dark');
    });

    it('should throw error for nonexistent theme', () => {
      const runtime = new ThemeRuntime(config);
      expect(() => {
        runtime.applyTheme('nonexistent');
      }).toThrow(ThemeError);
    });

    it('should dispatch theme change event', () => {
      const runtime = new ThemeRuntime(config);
      const dispatchEventSpy = vi.spyOn(global.window, 'dispatchEvent');

      runtime.applyTheme('dark');

      expect(dispatchEventSpy).toHaveBeenCalled();
      const event = dispatchEventSpy.mock.calls[0][0] as CustomEvent;
      expect(event.type).toBe('tokiforge:theme-change');
      expect(event.detail.theme).toBe('dark');
      expect(event.detail.tokens).toEqual(darkTokens);
    });

    it('should apply theme with custom selector and prefix', () => {
      const runtime = new ThemeRuntime(config);
      runtime.applyTheme('dark', ':root', 'myapp');
      expect(runtime.getCurrentTheme()).toBe('dark');
    });
  });

  describe('getCurrentTheme', () => {
    it('should return null before initialization', () => {
      const runtime = new ThemeRuntime(config);
      expect(runtime.getCurrentTheme()).toBeNull();
    });

    it('should return current theme after applyTheme', () => {
      const runtime = new ThemeRuntime(config);
      runtime.applyTheme('dark');
      expect(runtime.getCurrentTheme()).toBe('dark');
    });

    it('should return current theme after init', () => {
      const runtime = new ThemeRuntime(config);
      runtime.init();
      expect(runtime.getCurrentTheme()).toBe('light');
    });
  });

  describe('getThemeTokens', () => {
    it('should return tokens for specified theme', () => {
      const runtime = new ThemeRuntime(config);
      const tokens = runtime.getThemeTokens('dark');
      expect(tokens).toEqual(darkTokens);
    });

    it('should return tokens for light theme', () => {
      const runtime = new ThemeRuntime(config);
      const tokens = runtime.getThemeTokens('light');
      expect(tokens).toEqual(lightTokens);
    });

    it('should throw error for nonexistent theme', () => {
      const runtime = new ThemeRuntime(config);
      expect(() => {
        runtime.getThemeTokens('nonexistent');
      }).toThrow(ThemeError);
    });
  });

  describe('getAvailableThemes', () => {
    it('should return array of theme names', () => {
      const runtime = new ThemeRuntime(config);
      const themes = runtime.getAvailableThemes();
      expect(themes).toEqual(['light', 'dark', 'high-contrast']);
    });

    it('should return correct theme names in order', () => {
      const runtime = new ThemeRuntime({
        themes: [
          { name: 'dark', tokens: darkTokens },
          { name: 'light', tokens: lightTokens },
        ],
      });
      const themes = runtime.getAvailableThemes();
      expect(themes).toEqual(['dark', 'light']);
    });
  });

  describe('nextTheme', () => {
    it('should return next theme in sequence', () => {
      const runtime = new ThemeRuntime(config);
      runtime.applyTheme('light');
      const next = runtime.nextTheme();
      expect(next).toBe('dark');
    });

    it('should wrap around to first theme after last', () => {
      const runtime = new ThemeRuntime(config);
      runtime.applyTheme('high-contrast');
      const next = runtime.nextTheme();
      expect(next).toBe('light');
    });

    it('should return first theme if no current theme', () => {
      const runtime = new ThemeRuntime(config);
      const next = runtime.nextTheme();
      expect(next).toBe('light');
    });

    it('should cycle through all themes', () => {
      const runtime = new ThemeRuntime(config);
      runtime.applyTheme('light');
      
      expect(runtime.nextTheme()).toBe('dark');
      runtime.applyTheme('dark');
      
      expect(runtime.nextTheme()).toBe('high-contrast');
      runtime.applyTheme('high-contrast');
      
      expect(runtime.nextTheme()).toBe('light');
    });
  });

  describe('destroy', () => {
    it('should remove style element', () => {
      const styleElement = {
        id: 'tokiforge-theme',
        remove: vi.fn(),
      };
      
      vi.spyOn(global.document, 'getElementById').mockReturnValue(styleElement as any);
      
      const runtime = new ThemeRuntime(config);
      runtime.init();
      runtime.destroy();
      
      expect(styleElement.remove).toHaveBeenCalled();
    });

    it('should cleanup system theme watcher', () => {
      const runtime = new ThemeRuntime(config);
      runtime.init();
      
      const unwatch = vi.fn();
      const mediaQuery = {
        matches: false,
        media: '',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      };
      
      vi.spyOn(global.window, 'matchMedia').mockReturnValue(mediaQuery as any);
      mediaQuery.addEventListener.mockImplementation((event, handler) => {
        mediaQuery.removeEventListener = unwatch;
      });
      
      runtime.watchSystemTheme(() => {});
      runtime.destroy();
      
      // Watcher should be cleaned up
      expect(unwatch).toHaveBeenCalled();
    });

    it('should be safe to call multiple times', () => {
      const runtime = new ThemeRuntime(config);
      runtime.init();
      
      expect(() => {
        runtime.destroy();
        runtime.destroy();
      }).not.toThrow();
    });
  });

  describe('watchSystemTheme', () => {
    it('should return unwatch function', () => {
      const runtime = new ThemeRuntime(config);
      const mediaQuery = {
        matches: false,
        media: '',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      };
      
      vi.spyOn(global.window, 'matchMedia').mockReturnValue(mediaQuery as any);
      
      const unwatch = runtime.watchSystemTheme(() => {});
      expect(typeof unwatch).toBe('function');
    });

    it('should call callback with system theme', () => {
      const runtime = new ThemeRuntime(config);
      const callback = vi.fn();
      
      const mediaQuery = {
        matches: true, // dark mode
        media: '(prefers-color-scheme: dark)',
        addEventListener: vi.fn((event, handler) => {
          // Simulate initial call
          if (event === 'change') {
            handler({ matches: true } as MediaQueryListEvent);
          }
        }),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      };
      
      vi.spyOn(global.window, 'matchMedia').mockReturnValue(mediaQuery as any);
      
      runtime.watchSystemTheme(callback);
      
      expect(callback).toHaveBeenCalledWith('dark');
    });

    it('should use addListener for legacy browsers', () => {
      const runtime = new ThemeRuntime(config);
      const callback = vi.fn();
      
      const mediaQuery = {
        matches: false,
        media: '',
        addEventListener: undefined, // Legacy browser
        removeEventListener: undefined,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      };
      
      vi.spyOn(global.window, 'matchMedia').mockReturnValue(mediaQuery as any);
      
      runtime.watchSystemTheme(callback);
      
      expect(mediaQuery.addListener).toHaveBeenCalled();
    });

    it('should return no-op function in server environment', () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      const runtime = new ThemeRuntime(config);
      const unwatch = runtime.watchSystemTheme(() => {});
      
      expect(typeof unwatch).toBe('function');
      expect(() => unwatch()).not.toThrow();

      global.window = originalWindow;
    });
  });

  describe('detectSystemTheme (static)', () => {
    it('should return light when prefers-color-scheme is light', () => {
      const mediaQuery = {
        matches: false,
        media: '(prefers-color-scheme: dark)',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      };
      
      vi.spyOn(global.window, 'matchMedia').mockReturnValue(mediaQuery as any);
      
      const theme = ThemeRuntime.detectSystemTheme();
      expect(theme).toBe('light');
    });

    it('should return dark when prefers-color-scheme is dark', () => {
      const mediaQuery = {
        matches: true,
        media: '(prefers-color-scheme: dark)',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      };
      
      vi.spyOn(global.window, 'matchMedia').mockReturnValue(mediaQuery as any);
      
      const theme = ThemeRuntime.detectSystemTheme();
      expect(theme).toBe('dark');
    });

    it('should return light in server environment', () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      const theme = ThemeRuntime.detectSystemTheme();
      expect(theme).toBe('light');

      global.window = originalWindow;
    });

    it('should return light if matchMedia throws error', () => {
      vi.spyOn(global.window, 'matchMedia').mockImplementation(() => {
        throw new Error('matchMedia not supported');
      });

      const theme = ThemeRuntime.detectSystemTheme();
      expect(theme).toBe('light');
    });
  });

  describe('Integration tests', () => {
    it('should handle full theme switching workflow', () => {
      const runtime = new ThemeRuntime(config);
      
      // Initialize
      runtime.init();
      expect(runtime.getCurrentTheme()).toBe('light');
      
      // Get available themes
      const themes = runtime.getAvailableThemes();
      expect(themes).toContain('light');
      expect(themes).toContain('dark');
      
      // Get tokens
      const lightThemeTokens = runtime.getThemeTokens('light');
      expect(lightThemeTokens).toEqual(lightTokens);
      
      // Switch theme
      runtime.applyTheme('dark');
      expect(runtime.getCurrentTheme()).toBe('dark');
      
      // Get dark tokens
      const darkThemeTokens = runtime.getThemeTokens('dark');
      expect(darkThemeTokens).toEqual(darkTokens);
      
      // Cycle to next theme
      const nextTheme = runtime.nextTheme();
      expect(nextTheme).toBe('high-contrast');
      
      // Cleanup
      runtime.destroy();
    });

    it('should handle theme change events', () => {
      const runtime = new ThemeRuntime(config);
      const dispatchEventSpy = vi.spyOn(global.window, 'dispatchEvent');
      
      runtime.init();
      runtime.applyTheme('dark');
      
      expect(dispatchEventSpy).toHaveBeenCalled();
      const event = dispatchEventSpy.mock.calls[dispatchEventSpy.mock.calls.length - 1][0] as CustomEvent;
      expect(event.type).toBe('tokiforge:theme-change');
      expect(event.detail.theme).toBe('dark');
    });
  });
});

