import { describe, it, expect, vi } from 'vitest';
import tokiforge, { getThemeFromCookies, setThemeCookie } from './index';
import type { ThemeConfig } from '@tokiforge/core';

vi.mock('@tokiforge/core', async () => {
  const actual = await vi.importActual('@tokiforge/core');
  return actual;
});

describe('Astro Integration', () => {
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

  describe('tokiforge (default export)', () => {
    it('should return an AstroIntegration object', () => {
      const integration = tokiforge({ config: testConfig });

      expect(integration).toBeDefined();
      expect(integration.name).toBe('@tokiforge/astro');
      expect(integration.hooks).toBeDefined();
      expect(typeof integration.hooks['astro:config:setup']).toBe('function');
      expect(typeof integration.hooks['astro:config:done']).toBe('function');
    });

    it('should not throw when called with valid config', () => {
      expect(() => tokiforge({ config: testConfig })).not.toThrow();
    });

    it('should accept generateStaticCSS option', () => {
      const integration = tokiforge({ config: testConfig, generateStaticCSS: true });
      expect(integration).toBeDefined();
    });
  });

  describe('getThemeFromCookies', () => {
    it('should return theme value from cookies', () => {
      const cookies = {
        get: (name: string) => {
          if (name === 'tokiforge-theme') return { value: 'dark' };
          return null;
        },
      };

      const result = getThemeFromCookies(cookies);
      expect(result).toBe('dark');
    });

    it('should return null when no theme cookie exists', () => {
      const cookies = {
        get: () => null,
      };

      const result = getThemeFromCookies(cookies);
      expect(result).toBeNull();
    });

    it('should support custom cookie name', () => {
      const cookies = {
        get: (name: string) => {
          if (name === 'custom-theme') return { value: 'dark' };
          return null;
        },
      };

      const result = getThemeFromCookies(cookies, 'custom-theme');
      expect(result).toBe('dark');
    });
  });

  describe('setThemeCookie', () => {
    it('should return a cookie string for the given theme', () => {
      const result = setThemeCookie('dark');
      expect(result).toContain('tokiforge-theme=dark');
      expect(result).toContain('Path=/');
      expect(result).toContain('Max-Age=31536000');
      expect(result).toContain('SameSite=Lax');
    });

    it('should support custom cookie name', () => {
      const result = setThemeCookie('dark', 'custom-theme');
      expect(result).toContain('custom-theme=dark');
    });
  });
});
