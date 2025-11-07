import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ThemeRuntime } from './ThemeRuntime';
import type { ThemeConfig } from './types';

describe('ThemeRuntime', () => {
  const mockConfig: ThemeConfig = {
    themes: [
      {
        name: 'light',
        tokens: {
          color: {
            primary: { value: '#7C3AED', type: 'color' },
            text: { value: '#1F2937', type: 'color' },
          },
        },
      },
      {
        name: 'dark',
        tokens: {
          color: {
            primary: { value: '#A78BFA', type: 'color' },
            text: { value: '#F9FAFB', type: 'color' },
          },
        },
      },
    ],
    defaultTheme: 'light',
  };

  beforeEach(() => {
    document.head.innerHTML = '';
  });

  afterEach(() => {
    document.head.innerHTML = '';
  });

  it('should create a ThemeRuntime instance', () => {
    const runtime = new ThemeRuntime(mockConfig);
    expect(runtime).toBeInstanceOf(ThemeRuntime);
  });

  it('should throw error if no themes provided', () => {
    expect(() => {
      new ThemeRuntime({ themes: [] });
    }).toThrow();
  });

  it('should get current theme', () => {
    const runtime = new ThemeRuntime(mockConfig);
    expect(runtime.getCurrentTheme()).toBe('light');
  });

  it('should get available themes', () => {
    const runtime = new ThemeRuntime(mockConfig);
    expect(runtime.getAvailableThemes()).toEqual(['light', 'dark']);
  });

  it('should get theme tokens', () => {
    const runtime = new ThemeRuntime(mockConfig);
    const tokens = runtime.getThemeTokens('light');
    expect(tokens.color).toBeDefined();
    if (tokens.color && typeof tokens.color === 'object' && !Array.isArray(tokens.color)) {
      expect('primary' in tokens.color).toBe(true);
    }
  });

  it('should apply theme', () => {
    const runtime = new ThemeRuntime(mockConfig);
    runtime.init();
    runtime.applyTheme('dark');
    expect(runtime.getCurrentTheme()).toBe('dark');
  });

  it('should throw error for invalid theme', () => {
    const runtime = new ThemeRuntime(mockConfig);
    expect(() => {
      runtime.applyTheme('invalid');
    }).toThrow();
  });

  it('should cycle through themes', () => {
    const runtime = new ThemeRuntime(mockConfig);
    const nextTheme = runtime.nextTheme();
    expect(nextTheme).toBe('dark');
    expect(runtime.getCurrentTheme()).toBe('dark');
  });

  it('should inject CSS variables', () => {
    const runtime = new ThemeRuntime(mockConfig);
    runtime.init();
    
    const styleElement = document.getElementById('tokiforge-theme') as HTMLStyleElement;
    expect(styleElement).toBeTruthy();
    expect(styleElement.textContent).toContain('--hf-color-primary');
  });

  it('should detect system theme', () => {
    const theme = ThemeRuntime.detectSystemTheme();
    expect(['light', 'dark']).toContain(theme);
  });

  it('should clean up on destroy', () => {
    const runtime = new ThemeRuntime(mockConfig);
    runtime.init();
    runtime.destroy();
    
    const styleElement = document.getElementById('tokiforge-theme');
    expect(styleElement).toBeNull();
  });
});

