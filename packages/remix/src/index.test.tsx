import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, renderHook, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from './index';
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
        this.listeners = new Set<() => void>();
      }

      subscribe(cb: () => void) {
        this.listeners.add(cb);
        return () => this.listeners.delete(cb);
      }

      private lastSnapshot: any = null;

      getSnapshot() {
        if (!this.lastSnapshot || this.lastSnapshot.theme !== this.currentTheme) {
          this.lastSnapshot = {
            theme: this.currentTheme,
            tokens: this.themes.find((t: any) => t.name === this.currentTheme)?.tokens || {},
          };
        }
        return this.lastSnapshot;
      }

      init = vi.fn();
      destroy = vi.fn();

      setTheme = vi.fn((name: string) => {
        this.currentTheme = name;
        this.listeners.forEach((l: () => void) => l());
      });

      nextTheme = vi.fn(() => {
        const names = this.themes.map((t: any) => t.name);
        const idx = names.indexOf(this.currentTheme);
        if (idx !== -1) {
          this.currentTheme = names[(idx + 1) % names.length];
          this.listeners.forEach((l: () => void) => l());
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
      private listeners: Set<() => void>;
    },
  };
});

describe('Remix Integration', () => {
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

  describe('ThemeProvider', () => {
    it('should render children', () => {
      const { container } = render(
        <ThemeProvider config={testConfig}>
          <div data-testid="child">Child</div>
        </ThemeProvider>
      );

      expect(container.querySelector('[data-testid="child"]')).toBeDefined();
    });
  });

  describe('useTheme', () => {
    it('should throw error when used outside provider', () => {
      expect(() => {
        renderHook(() => useTheme());
      }).toThrow('useTheme must be used within a ThemeProvider');
    });

    it('should return theme context when inside provider', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) =>
        <ThemeProvider config={testConfig}>{children}</ThemeProvider>;

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current.theme).toBe('light');
      expect(result.current.availableThemes).toEqual(['light', 'dark']);
    });

    it('should provide setTheme and nextTheme functions', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) =>
        <ThemeProvider config={testConfig}>{children}</ThemeProvider>;

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(typeof result.current.setTheme).toBe('function');
      expect(typeof result.current.nextTheme).toBe('function');
    });
  });

  describe('Theme Switching', () => {
    it('should switch themes via context', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) =>
        <ThemeProvider config={testConfig}>{children}</ThemeProvider>;

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.theme).toBe('light');

      await act(async () => {
        await result.current.setTheme('dark');
      });

      expect(result.current.theme).toBe('dark');
    });

    it('should cycle themes with nextTheme', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) =>
        <ThemeProvider config={testConfig}>{children}</ThemeProvider>;

      const { result } = renderHook(() => useTheme(), { wrapper });

      await act(async () => {
        await result.current.nextTheme();
      });

      expect(result.current.theme).toBe('dark');
    });
  });
});
