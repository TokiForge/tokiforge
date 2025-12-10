import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ThemeService } from './theme.service';
import type { ThemeConfig, DesignTokens } from '@tokiforge/core';

function createThemeService(): ThemeService {
  const service = new (ThemeService as any)();
  
  // Mock the injected PLATFORM_ID
  Object.defineProperty(service, 'platformId', {
    value: 'browser',
    writable: true,
    configurable: true,
  });
  
  // Mock isPlatformBrowser check
  Object.defineProperty(service, 'isBrowser', {
    value: true,
    writable: true,
    configurable: true,
  });
  
  return service;
}

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

describe('ThemeService', () => {
  let service: ThemeService;
  let config: ThemeConfig;

  beforeEach(() => {
    config = {
      themes: [
        { name: 'light', tokens: lightTokens },
        { name: 'dark', tokens: darkTokens },
      ],
      defaultTheme: 'light',
    };

    // Mock browser environment
    Object.defineProperty(global, 'window', {
      value: {
        localStorage: {
          getItem: vi.fn(() => null),
          setItem: vi.fn(),
          removeItem: vi.fn(),
        },
        matchMedia: vi.fn(() => ({
          matches: false,
          media: '',
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          addListener: vi.fn(),
          removeListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
      writable: true,
      configurable: true,
    });

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
        body: {
          classList: {
            add: vi.fn(),
            remove: vi.fn(),
            contains: vi.fn(() => false),
          },
        },
      },
      writable: true,
      configurable: true,
    });

    service = createThemeService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (service && service.initialized()) {
      service.destroy();
    }
  });

  describe('Initialization', () => {
    it('should create service', () => {
      expect(service).toBeTruthy();
    });

    it('should not be initialized by default', () => {
      expect(service.initialized()).toBe(false);
    });

    it('should initialize with config', () => {
      service.init(config);
      expect(service.initialized()).toBe(true);
      expect(service.theme()).toBe('light');
    });

    it('should initialize with options', () => {
      service.init(config, {
        selector: ':root',
        prefix: 'myapp',
        mode: 'dynamic',
        persist: false,
      });
      expect(service.initialized()).toBe(true);
    });

    it('should load theme from localStorage if persist is enabled', () => {
      const getItemSpy = vi.spyOn(global.window.localStorage, 'getItem');
      getItemSpy.mockReturnValue('dark');

      service.init(config, { persist: true });

      expect(getItemSpy).toHaveBeenCalledWith('tokiforge-theme');
      expect(service.theme()).toBe('dark');
    });

    it('should detect system theme if watchSystemTheme is enabled', () => {
      const matchMediaSpy = vi.spyOn(global.window, 'matchMedia');
      matchMediaSpy.mockReturnValue({
        matches: true, // dark mode
        media: '',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      } as any);

      service.init(config, {
        watchSystemTheme: true,
        persist: false,
      });

      expect(matchMediaSpy).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    });
  });

  describe('Theme Management', () => {
    beforeEach(() => {
      service.init(config);
    });

    it('should get current theme', () => {
      expect(service.theme()).toBe('light');
    });

    it('should set theme', () => {
      service.setTheme('dark');
      expect(service.theme()).toBe('dark');
    });

    it('should throw error for invalid theme', () => {
      expect(() => {
        service.setTheme('nonexistent');
      }).toThrow();
    });

    it('should get available themes', () => {
      const themes = service.availableThemes();
      expect(themes).toEqual(['light', 'dark']);
    });

    it('should get tokens for current theme', () => {
      const tokens = service.tokens();
      expect(tokens).toEqual(lightTokens);
    });

    it('should update tokens when theme changes', () => {
      service.setTheme('dark');
      const tokens = service.tokens();
      expect(tokens).toEqual(darkTokens);
    });

    it('should cycle to next theme', () => {
      service.setTheme('light');
      service.nextTheme();
      expect(service.theme()).toBe('dark');
    });

    it('should wrap around to first theme after last', () => {
      service.setTheme('dark');
      service.nextTheme();
      expect(service.theme()).toBe('light');
    });
  });

  describe('CSS Generation', () => {
    beforeEach(() => {
      service.init(config, { mode: 'static' });
    });

    it('should generate CSS for current theme', () => {
      const css = service.generateCSS();
      expect(css).toContain('--hf-color-primary');
      expect(css).toContain('#7C3AED');
    });

    it('should generate CSS for specific theme', () => {
      const css = service.generateCSS('dark');
      expect(css).toContain('--hf-color-primary');
      expect(css).toContain('#A78BFA');
    });

    it('should throw error if not initialized', () => {
      const newService = TestBed.inject(ThemeService);
      expect(() => {
        newService.generateCSS();
      }).toThrow();
    });
  });

  describe('Persistence', () => {
    it('should save theme to localStorage', () => {
      const setItemSpy = vi.spyOn(global.window.localStorage, 'setItem');
      service.init(config, { persist: true });
      service.setTheme('dark');

      expect(setItemSpy).toHaveBeenCalledWith('tokiforge-theme', 'dark');
    });

    it('should not save to localStorage if persist is disabled', () => {
      const setItemSpy = vi.spyOn(global.window.localStorage, 'setItem');
      service.init(config, { persist: false });
      service.setTheme('dark');

      expect(setItemSpy).not.toHaveBeenCalled();
    });
  });

  describe('Static Mode', () => {
    beforeEach(() => {
      service.init(config, {
        mode: 'static',
        bodyClassPrefix: 'theme',
      });
    });

    it('should add body class for theme', () => {
      const addSpy = vi.spyOn(global.document.body.classList, 'add');
      service.setTheme('dark');
      expect(addSpy).toHaveBeenCalledWith('theme-dark');
    });

    it('should remove previous theme class', () => {
      const removeSpy = vi.spyOn(global.document.body.classList, 'remove');
      service.setTheme('dark');
      expect(removeSpy).toHaveBeenCalledWith('theme-light');
    });
  });

  describe('System Theme Watching', () => {
    it('should watch system theme changes', () => {
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

      service.init(config, {
        watchSystemTheme: true,
        persist: false,
      });

      expect(mediaQuery.addEventListener).toHaveBeenCalled();
    });

    it('should cleanup watcher on destroy', () => {
      const removeEventListenerSpy = vi.fn();
      const mediaQuery = {
        matches: false,
        media: '',
        addEventListener: vi.fn((event, handler) => {
          mediaQuery.removeEventListener = removeEventListenerSpy;
        }),
        removeEventListener: removeEventListenerSpy,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      };

      vi.spyOn(global.window, 'matchMedia').mockReturnValue(mediaQuery as any);

      service.init(config, {
        watchSystemTheme: true,
      });

      service.destroy();

      expect(removeEventListenerSpy).toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    it('should destroy service', () => {
      service.init(config);
      service.destroy();
      expect(service.initialized()).toBe(false);
    });

    it('should remove style element on destroy', () => {
      const styleElement = {
        id: 'tokiforge-theme',
        remove: vi.fn(),
      };
      vi.spyOn(global.document, 'getElementById').mockReturnValue(styleElement as any);

      service.init(config);
      service.destroy();

      expect(styleElement.remove).toHaveBeenCalled();
    });

    it('should be safe to call destroy multiple times', () => {
      service.init(config);
      expect(() => {
        service.destroy();
        service.destroy();
      }).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should throw error if setTheme called before init', () => {
      expect(() => {
        service.setTheme('dark');
      }).toThrow();
    });

    it('should throw error if nextTheme called before init', () => {
      expect(() => {
        service.nextTheme();
      }).toThrow();
    });

    it('should throw error if generateCSS called before init', () => {
      expect(() => {
        service.generateCSS();
      }).toThrow();
    });

    it('should warn if init called multiple times', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      service.init(config);
      service.init(config);

      expect(consoleSpy).toHaveBeenCalledWith('ThemeService already initialized');
      consoleSpy.mockRestore();
    });
  });

  describe('SSR Safety', () => {
    it('should handle SSR environment safely', () => {
      // @ts-ignore
      const ssrService = new ThemeService();
      (ssrService as any).platformId = 'server';
      (ssrService as any).isBrowser = false;

      // Should not throw in SSR
      expect(() => {
        ssrService.init(config);
      }).not.toThrow();
    });
  });
});

