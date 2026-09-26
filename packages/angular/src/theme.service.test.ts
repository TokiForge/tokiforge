import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ThemeService } from './theme.service';
import type { ThemeConfig, DesignTokens } from '@tokiforge/core';

const lightTokens: DesignTokens = {
  color: {
    primary: { value: '#7C3AED', type: 'color' },
  },
};

const darkTokens: DesignTokens = {
  color: {
    primary: { value: '#A78BFA', type: 'color' },
  },
};

describe('ThemeService', () => {
  let service: ThemeService;
  const config: ThemeConfig = {
    themes: [
      { name: 'light', tokens: lightTokens },
      { name: 'dark', tokens: darkTokens },
    ],
    defaultTheme: 'light',
  };

  beforeEach(() => {
    try {
      window.localStorage?.removeItem('tokiforge-theme');
    } catch {
      // ignore
    }
    service = new ThemeService();
    Object.defineProperty(service, 'isBrowser', {
      value: true,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    service.destroy();
    vi.restoreAllMocks();
  });

  it('starts uninitialized', () => {
    expect(service.initialized()).toBe(false);
  });

  it('initializes with the default theme', () => {
    service.init(config, { persist: false });
    expect(service.initialized()).toBe(true);
    expect(service.theme()).toBe('light');
    expect(service.availableThemes()).toEqual(['light', 'dark']);
    expect(service.tokens()).toEqual(lightTokens);
  });

  it('switches themes and updates tokens', () => {
    service.init(config, { persist: false });
    service.setTheme('dark');
    expect(service.theme()).toBe('dark');
    expect(service.tokens()).toEqual(darkTokens);
  });

  it('rejects unknown themes', () => {
    service.init(config, { persist: false });
    expect(() => service.setTheme('nope')).toThrow(/not found/);
  });

  it('cycles with nextTheme', () => {
    service.init(config, { persist: false });
    service.nextTheme();
    expect(service.theme()).toBe('dark');
    service.nextTheme();
    expect(service.theme()).toBe('light');
  });

  it('persists the selected theme', () => {
    service.init(config, { persist: true, storageKey: 'tokiforge-theme' });
    service.setTheme('dark');
    expect(window.localStorage.getItem('tokiforge-theme')).toBe('dark');
  });

  it('restores a persisted theme on init', () => {
    window.localStorage.setItem('tokiforge-theme', 'dark');
    service.init(config, { persist: true });
    expect(service.theme()).toBe('dark');
  });

  it('generates CSS for the active theme', () => {
    service.init(config, { persist: false });
    const css = service.generateCSS();
    expect(css).toContain('--hf-color-primary: #7C3AED');
  });

  it('warns when init is called twice', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    service.init(config, { persist: false });
    service.init(config, { persist: false });
    expect(warn).toHaveBeenCalled();
  });

  it('is safe to destroy more than once', () => {
    service.init(config, { persist: false });
    expect(() => {
      service.destroy();
      service.destroy();
    }).not.toThrow();
  });
});
