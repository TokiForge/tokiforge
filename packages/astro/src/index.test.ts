import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import tokiforge, { getThemeFromCookies, setThemeCookie } from './index';
import type { ThemeConfig } from '@tokiforge/core/runtime';

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

  describe('generateStaticCSS', () => {
    let tmpDir: string;

    beforeEach(() => {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tokiforge-astro-'));
    });

    afterEach(() => {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    it('writes per-theme CSS and a combined themes.css', () => {
      const integration = tokiforge({
        config: testConfig,
        generateStaticCSS: true,
        cssOutputDir: 'public/tokiforge',
      });

      const done = integration.hooks['astro:config:done'];
      expect(done).toBeDefined();
      done!({
        config: { root: pathToFileURL(tmpDir + path.sep) },
      } as never);

      const light = fs.readFileSync(path.join(tmpDir, 'public/tokiforge/light.css'), 'utf-8');
      const dark = fs.readFileSync(path.join(tmpDir, 'public/tokiforge/dark.css'), 'utf-8');
      const combined = fs.readFileSync(path.join(tmpDir, 'public/tokiforge/themes.css'), 'utf-8');

      expect(light).toContain('[data-theme="light"]');
      expect(light).toContain('--hf-color-primary: #7C3AED');
      expect(dark).toContain('[data-theme="dark"]');
      expect(dark).toContain('--hf-color-primary: #A78BFA');
      expect(combined).toContain('[data-theme="light"]');
      expect(combined).toContain('[data-theme="dark"]');
    });

    it('skips writing when generateStaticCSS is false', () => {
      const integration = tokiforge({ config: testConfig, generateStaticCSS: false });
      integration.hooks['astro:config:done']!({
        config: { root: pathToFileURL(tmpDir + path.sep) },
      } as never);
      expect(fs.existsSync(path.join(tmpDir, 'public/tokiforge'))).toBe(false);
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

      expect(getThemeFromCookies(cookies)).toBe('dark');
    });

    it('should return null when no theme cookie exists', () => {
      expect(getThemeFromCookies({ get: () => null })).toBeNull();
    });

    it('should support custom cookie name', () => {
      const cookies = {
        get: (name: string) => {
          if (name === 'custom-theme') return { value: 'dark' };
          return null;
        },
      };

      expect(getThemeFromCookies(cookies, 'custom-theme')).toBe('dark');
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
      expect(setThemeCookie('dark', 'custom-theme')).toContain('custom-theme=dark');
    });
  });
});
