import { describe, it, expect } from 'vitest';
import { SSRUtils } from './ssr-utils.js';
import type { ThemeConfig } from './types.js';

const testConfig: ThemeConfig = {
  themes: [
    {
      name: 'light',
      tokens: {
        color: {
          primary: { value: '#7C3AED', type: 'color' },
          background: { value: '#FFFFFF', type: 'color' },
          text: { value: '#000000', type: 'color' },
        },
        spacing: {
          sm: { value: '8px', type: 'dimension' },
          md: { value: '16px', type: 'dimension' },
        },
      },
    },
    {
      name: 'dark',
      tokens: {
        color: {
          primary: { value: '#A78BFA', type: 'color' },
          background: { value: '#1F2937', type: 'color' },
          text: { value: '#FFFFFF', type: 'color' },
        },
        spacing: {
          sm: { value: '8px', type: 'dimension' },
          md: { value: '16px', type: 'dimension' },
        },
      },
    },
  ],
  defaultTheme: 'light',
};

describe('SSRUtils', () => {
  describe('generateInlineCSS', () => {
    it('should generate inline CSS for a theme', () => {
      const css = SSRUtils.generateInlineCSS(testConfig, {
        theme: 'light',
      });

      expect(css).toContain(':root');
      expect(css).toContain('--hf-color-primary');
      expect(css).toContain('#7C3AED');
    });

    it('should use custom selector', () => {
      const css = SSRUtils.generateInlineCSS(testConfig, {
        theme: 'light',
        selector: '.app',
      });

      expect(css).toContain('.app');
      expect(css).not.toContain(':root');
    });

    it('should use custom prefix', () => {
      const css = SSRUtils.generateInlineCSS(testConfig, {
        theme: 'light',
        prefix: 'app',
      });

      expect(css).toContain('--app-color-primary');
      expect(css).not.toContain('--hf-color-primary');
    });

    it('should minify CSS when requested', () => {
      const css = SSRUtils.generateInlineCSS(testConfig, {
        theme: 'light',
        minify: true,
      });

      expect(css).not.toContain('\n  '); // Should not have indentation
      expect(css.length).toBeLessThan(
        SSRUtils.generateInlineCSS(testConfig, {
          theme: 'light',
          minify: false,
        }).length
      );
    });

    it('should throw error for non-existent theme', () => {
      expect(() => {
        SSRUtils.generateInlineCSS(testConfig, {
          theme: 'non-existent',
        });
      }).toThrow('Theme "non-existent" not found');
    });
  });

  describe('generateCriticalCSS', () => {
    it('should generate critical CSS for multiple themes', () => {
      const css = SSRUtils.generateCriticalCSS(testConfig, {
        themes: ['light', 'dark'],
      });

      expect(css).toContain('[data-theme="light"]');
      expect(css).toContain('[data-theme="dark"]');
      expect(css).toContain('#7C3AED'); // light primary
      expect(css).toContain('#A78BFA'); // dark primary
    });

    it('should not include theme selectors when disabled', () => {
      const css = SSRUtils.generateCriticalCSS(testConfig, {
        themes: ['light'],
        includeThemeSelectors: false,
      });

      expect(css).toContain(':root');
      expect(css).not.toContain('[data-theme="light"]');
    });

    it('should minify CSS by default', () => {
      const css = SSRUtils.generateCriticalCSS(testConfig, {
        themes: ['light'],
      });

      expect(css).not.toContain('\n  '); // Should not have indentation
    });

    it('should skip non-existent themes with warning', () => {
      const css = SSRUtils.generateCriticalCSS(testConfig, {
        themes: ['light', 'non-existent', 'dark'],
      });

      expect(css).toContain('[data-theme="light"]');
      expect(css).toContain('[data-theme="dark"]');
      expect(css).not.toContain('[data-theme="non-existent"]');
    });

    it('should use custom selector without theme selectors', () => {
      const css = SSRUtils.generateCriticalCSS(testConfig, {
        themes: ['light'],
        selector: '.my-app',
        includeThemeSelectors: false,
      });

      expect(css).toContain('.my-app');
      expect(css).not.toContain(':root');
    });
  });

  describe('generateBodyClass', () => {
    it('should generate body class with default prefix', () => {
      const className = SSRUtils.generateBodyClass('dark');
      expect(className).toBe('theme-dark');
    });

    it('should generate body class with custom prefix', () => {
      const className = SSRUtils.generateBodyClass('dark', 'app-theme');
      expect(className).toBe('app-theme-dark');
    });
  });

  describe('generateDataTheme', () => {
    it('should generate data-theme attribute', () => {
      const attr = SSRUtils.generateDataTheme('dark');
      expect(attr).toBe('data-theme="dark"');
    });
  });

  describe('getThemeFromCookie', () => {
    it('should extract theme from cookie string', () => {
      const cookieString = 'tokiforge-theme=dark; path=/';
      const theme = SSRUtils.getThemeFromCookie(cookieString);
      expect(theme).toBe('dark');
    });

    it('should extract theme from cookie string with multiple cookies', () => {
      const cookieString = 'session=abc123; tokiforge-theme=dark; lang=en';
      const theme = SSRUtils.getThemeFromCookie(cookieString);
      expect(theme).toBe('dark');
    });

    it('should use custom cookie name', () => {
      const cookieString = 'my-theme=dark; path=/';
      const theme = SSRUtils.getThemeFromCookie(cookieString, 'my-theme');
      expect(theme).toBe('dark');
    });

    it('should return null for undefined cookie string', () => {
      const theme = SSRUtils.getThemeFromCookie(undefined);
      expect(theme).toBeNull();
    });

    it('should return null when theme cookie not found', () => {
      const cookieString = 'session=abc123; lang=en';
      const theme = SSRUtils.getThemeFromCookie(cookieString);
      expect(theme).toBeNull();
    });
  });

  describe('generateThemeCookie', () => {
    it('should generate Set-Cookie header with defaults', () => {
      const cookie = SSRUtils.generateThemeCookie('dark');
      expect(cookie).toContain('tokiforge-theme=dark');
      expect(cookie).toContain('Path=/');
      expect(cookie).toContain('Max-Age=31536000');
      expect(cookie).toContain('SameSite=Lax');
    });

    it('should use custom cookie name', () => {
      const cookie = SSRUtils.generateThemeCookie('dark', 'my-theme');
      expect(cookie).toContain('my-theme=dark');
    });

    it('should include Secure flag when requested', () => {
      const cookie = SSRUtils.generateThemeCookie('dark', 'tokiforge-theme', {
        secure: true,
      });
      expect(cookie).toContain('Secure');
    });

    it('should include HttpOnly flag when requested', () => {
      const cookie = SSRUtils.generateThemeCookie('dark', 'tokiforge-theme', {
        httpOnly: true,
      });
      expect(cookie).toContain('HttpOnly');
    });

    it('should use custom Max-Age', () => {
      const cookie = SSRUtils.generateThemeCookie('dark', 'tokiforge-theme', {
        maxAge: 86400, // 1 day
      });
      expect(cookie).toContain('Max-Age=86400');
    });

    it('should use custom SameSite', () => {
      const cookie = SSRUtils.generateThemeCookie('dark', 'tokiforge-theme', {
        sameSite: 'Strict',
      });
      expect(cookie).toContain('SameSite=Strict');
    });
  });

  describe('generateHydrationScript', () => {
    it('should generate hydration script with defaults', () => {
      const script = SSRUtils.generateHydrationScript();
      expect(script).toContain('tokiforge-theme');
      expect(script).toContain('theme-');
      expect(script).toContain("'light'"); // fallback
      expect(script).toContain('data-theme');
    });

    it('should use custom cookie name', () => {
      const script = SSRUtils.generateHydrationScript('my-theme');
      expect(script).toContain('my-theme');
    });

    it('should use custom body class prefix', () => {
      const script = SSRUtils.generateHydrationScript('tokiforge-theme', 'app-theme');
      expect(script).toContain('app-theme-');
    });

    it('should use custom fallback theme', () => {
      const script = SSRUtils.generateHydrationScript('tokiforge-theme', 'theme', 'dark');
      expect(script).toContain("'dark'");
    });

    it('should be valid JavaScript', () => {
      const script = SSRUtils.generateHydrationScript();
      expect(() => {
        new Function(script);
      }).not.toThrow();
    });
  });

  describe('generateSSRHead', () => {
    it('should generate both style and script', () => {
      const result = SSRUtils.generateSSRHead(testConfig, {
        theme: 'light',
      });

      expect(result.style).toContain(':root');
      expect(result.style).toContain('--hf-color-primary');
      expect(result.script).toBeDefined();
      expect(result.script).toContain('tokiforge-theme');
    });

    it('should generate only style when script disabled', () => {
      const result = SSRUtils.generateSSRHead(testConfig, {
        theme: 'light',
        includeHydrationScript: false,
      });

      expect(result.style).toBeDefined();
      expect(result.script).toBeUndefined();
    });

    it('should use custom cookie name in script', () => {
      const result = SSRUtils.generateSSRHead(testConfig, {
        theme: 'light',
        cookieName: 'my-theme',
      });

      expect(result.script).toContain('my-theme');
    });

    it('should minify style by default', () => {
      const result = SSRUtils.generateSSRHead(testConfig, {
        theme: 'light',
      });

      expect(result.style).not.toContain('\n  ');
    });

    it('should not minify when disabled', () => {
      const result = SSRUtils.generateSSRHead(testConfig, {
        theme: 'light',
        minify: false,
      });

      expect(result.style).toContain('\n  ');
    });
  });

  describe('CSS minification', () => {
    it('should remove comments', () => {
      const css = SSRUtils.generateInlineCSS(testConfig, {
        theme: 'light',
        minify: true,
      });

      expect(css).not.toContain('/*');
      expect(css).not.toContain('*/');
    });

    it('should collapse whitespace', () => {
      const css = SSRUtils.generateInlineCSS(testConfig, {
        theme: 'light',
        minify: true,
      });

      expect(css).not.toContain('  '); // No double spaces
      expect(css).not.toContain('\n');
    });

    it('should preserve CSS variable values', () => {
      const css = SSRUtils.generateInlineCSS(testConfig, {
        theme: 'light',
        minify: true,
      });

      expect(css).toContain('#7C3AED');
      expect(css).toContain('8px');
      expect(css).toContain('16px');
    });
  });

  describe('Integration scenarios', () => {
    it('should generate complete SSR setup', () => {
      const theme = 'dark';
      
      // Get theme from cookie
      const cookieString = 'tokiforge-theme=dark';
      const extractedTheme = SSRUtils.getThemeFromCookie(cookieString);
      expect(extractedTheme).toBe(theme);

      // Generate head content
      const { style, script } = SSRUtils.generateSSRHead(testConfig, {
        theme: extractedTheme!,
      });

      expect(style).toContain('#A78BFA'); // dark primary
      expect(script).toBeDefined();

      // Generate body class
      const bodyClass = SSRUtils.generateBodyClass(theme);
      expect(bodyClass).toBe('theme-dark');

      // Generate data-theme
      const dataTheme = SSRUtils.generateDataTheme(theme);
      expect(dataTheme).toBe('data-theme="dark"');
    });

    it('should handle missing cookie with fallback', () => {
      const extractedTheme = SSRUtils.getThemeFromCookie(undefined);
      const theme = extractedTheme || 'light';

      const { style, script } = SSRUtils.generateSSRHead(testConfig, {
        theme,
      });

      expect(style).toContain('#7C3AED'); // light primary
      expect(script).toBeDefined();
    });

    it('should generate critical CSS for theme switching', () => {
      const css = SSRUtils.generateCriticalCSS(testConfig, {
        themes: ['light', 'dark'],
        minify: true,
      });

      // Should support both themes
      expect(css).toContain('[data-theme="light"]');
      expect(css).toContain('[data-theme="dark"]');
      expect(css).toContain('#7C3AED'); // light
      expect(css).toContain('#A78BFA'); // dark

      // Should be minified
      expect(css).not.toContain('\n  ');
    });
  });
});
