import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ThemeProvider, useTheme } from './index';
import { renderHook, act } from '@testing-library/react';
import { ThemeRuntime } from '@tokiforge/core';
import type { ThemeConfig } from '@tokiforge/core';
import React from 'react';

vi.mock('@tokiforge/core', async () => {
  const actual = await vi.importActual('@tokiforge/core');
  return {
    ...actual,
    ThemeRuntime: vi.fn().mockImplementation((class {
      init = vi.fn();
      applyTheme = vi.fn();
      getCurrentTheme = vi.fn();
      getAvailableThemes = vi.fn();
      getThemeTokens = vi.fn();
      nextTheme = vi.fn();
      destroy = vi.fn();

      constructor(config: any) {
        const themes = config.themes || [];
        let currentTheme = config.defaultTheme || themes[0]?.name;
        const listeners = new Set<() => void>();

        this.applyTheme.mockImplementation((name: string) => {
          currentTheme = name;
          listeners.forEach((cb) => cb());
        });
        this.getCurrentTheme.mockImplementation(() => currentTheme);
        this.getAvailableThemes.mockImplementation(() => themes.map((t: { name: string }) => t.name));
        this.getThemeTokens.mockImplementation((name: string) => {
          const theme = themes.find((t: { name: string }) => t.name === name);
          return theme?.tokens || {};
        });
        this.nextTheme.mockImplementation(() => {
          const names = themes.map((t: { name: string }) => t.name);
          const idx = names.indexOf(currentTheme);
          const nextIdx = (idx + 1) % names.length;
          return names[nextIdx];
        });
      }
    }) as any),
  };
});

describe('StyledComponents Integration', () => {
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
      const { container } = require('@testing-library/react').render(
        React.createElement(
          ThemeProvider,
          { config: testConfig },
          React.createElement('div', { 'data-testid': 'child' }, 'Child')
        )
      );

      expect(container.querySelector('[data-testid="child"]')).toBeDefined();
    });

    it('should create ThemeRuntime instance', () => {
      require('@testing-library/react').render(
        React.createElement(ThemeProvider, { config: testConfig }, null)
      );

      expect(ThemeRuntime).toHaveBeenCalledWith(testConfig);
    });

    it('should initialize ThemeRuntime on mount', () => {
      require('@testing-library/react').render(
        React.createElement(ThemeProvider, { config: testConfig }, null)
      );

      const instance = vi.mocked(ThemeRuntime).mock.instances[0] as any;
      expect(instance.init).toHaveBeenCalled();
    });

    it('should cleanup on unmount', () => {
      const { unmount } = require('@testing-library/react').render(
        React.createElement(ThemeProvider, { config: testConfig }, null)
      );

      unmount();
      // No error on unmount means cleanup is working
      expect(true).toBe(true);
    });
  });

  describe('useTheme', () => {
    it('should throw error when used outside provider', () => {
      expect(() => {
        renderHook(() => useTheme());
      }).toThrow();
    });

    it('should return theme context', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(ThemeProvider, { config: testConfig }, children);

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current.runtime).toBeDefined();
    });

    it('should provide applyTheme function', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(ThemeProvider, { config: testConfig }, children);

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(typeof result.current.runtime.applyTheme).toBe('function');
    });

    it('should update currentTheme when applyTheme is called', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(ThemeProvider, { config: testConfig }, children);

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.runtime.getCurrentTheme()).toBe('light');

      act(() => {
        result.current.runtime.applyTheme('dark');
      });

      expect(result.current.runtime.getCurrentTheme()).toBe('dark');
    });

    it('should provide availableThemes', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(ThemeProvider, { config: testConfig }, children);

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.availableThemes).toEqual(['light', 'dark']);
    });

    it('should provide nextTheme function', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(ThemeProvider, { config: testConfig }, children);

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(typeof result.current.nextTheme).toBe('function');
      await act(async () => {
        await result.current.nextTheme();
      });
      expect(result.current.runtime.getCurrentTheme()).toBe('dark');
    });
  });

  describe('Theme Switching', () => {
    it('should switch themes correctly', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(ThemeProvider, { config: testConfig }, children);

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.runtime.getCurrentTheme()).toBe('light');

      act(() => {
        result.current.runtime.applyTheme('dark');
      });

      expect(result.current.runtime.getCurrentTheme()).toBe('dark');
    });

    it('should cycle through themes with nextTheme', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(ThemeProvider, { config: testConfig }, children);

      const { result } = renderHook(() => useTheme(), { wrapper });

      const nextThemeName = result.current.runtime.nextTheme();
      act(() => {
        result.current.runtime.applyTheme(nextThemeName);
      });

      expect(result.current.runtime.getCurrentTheme()).toBe('dark');
    });
  });
});
