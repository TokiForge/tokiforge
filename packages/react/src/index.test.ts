import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ThemeProvider, useTheme } from './ThemeContext';
import { renderHook } from '@testing-library/react';
import { ThemeRuntime } from '@tokiforge/core';
import type { ThemeConfig } from '@tokiforge/core';
import React from 'react';

// Mock ThemeRuntime
vi.mock('@tokiforge/core', async () => {
  const actual = await vi.importActual('@tokiforge/core');
  return {
    ...actual,
    ThemeRuntime: vi.fn().mockImplementation((config) => {
      const themes = config.themes || [];
      let currentTheme = config.defaultTheme || themes[0]?.name;
      const listeners = new Set<() => void>();

      return {
        init: vi.fn(),
        applyTheme: vi.fn((name: string) => {
          currentTheme = name;
          listeners.forEach((cb) => cb());
        }),
        getCurrentTheme: vi.fn(() => currentTheme),
        getAvailableThemes: vi.fn(() => themes.map((t: { name: string }) => t.name)),
        getThemeTokens: vi.fn((name: string) => {
          const theme = themes.find((t: { name: string }) => t.name === name);
          return theme?.tokens || {};
        }),
        nextTheme: vi.fn(() => {
          const names = themes.map((t: { name: string }) => t.name);
          const idx = names.indexOf(currentTheme);
          const nextIdx = (idx + 1) % names.length;
          return names[nextIdx];
        }),
        destroy: vi.fn(),
        watchSystemTheme: vi.fn(() => vi.fn()),
        addEventListener: vi.fn((event: string, callback: () => void) => {
          if (event === 'themechange') {
            listeners.add(callback);
          }
        }),
        removeEventListener: vi.fn((event: string, callback: () => void) => {
          if (event === 'themechange') {
            listeners.delete(callback);
          }
        }),
      };
    }),
  };
});

describe('React Integration', () => {
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
          { config: testConfig, children: React.createElement('div', { 'data-testid': 'child' }, 'Child') }
        )
      );

      expect(container.querySelector('[data-testid="child"]')).toBeDefined();
    });

    it('should create ThemeRuntime instance', () => {
      require('@testing-library/react').render(
        React.createElement(ThemeProvider, { config: testConfig, children: null })
      );

      expect(ThemeRuntime).toHaveBeenCalledWith(testConfig);
    });

    it('should initialize ThemeRuntime on mount', () => {
      const mockRuntime = {
        init: vi.fn(),
        destroy: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      };

      (ThemeRuntime as any).mockReturnValue(mockRuntime);

      require('@testing-library/react').render(
        React.createElement(ThemeProvider, { config: testConfig, children: null })
      );

      expect(mockRuntime.init).toHaveBeenCalled();
    });

    it('should cleanup on unmount', () => {
      const mockRuntime = {
        init: vi.fn(),
        destroy: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      };

      (ThemeRuntime as any).mockReturnValue(mockRuntime);

      const { unmount } = require('@testing-library/react').render(
        React.createElement(ThemeProvider, { config: testConfig, children: null })
      );

      unmount();

      expect(mockRuntime.destroy).toHaveBeenCalled();
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
        React.createElement(ThemeProvider, { config: testConfig, children });

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current.runtime).toBeDefined();
    });

    it('should provide applyTheme function', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(ThemeProvider, { config: testConfig, children });

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(typeof result.current.runtime.applyTheme).toBe('function');
    });

    it('should update currentTheme when applyTheme is called', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(ThemeProvider, { config: testConfig, children });

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.runtime.getCurrentTheme()).toBe('light');

      result.current.runtime.applyTheme('dark');

      // Theme update happens synchronously in mocked runtime
      expect(result.current.runtime.getCurrentTheme()).toBe('dark');
    });

    it('should provide availableThemes', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(ThemeProvider, { config: testConfig, children });

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.availableThemes).toEqual(['light', 'dark']);
    });

    it('should provide nextTheme function', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(ThemeProvider, { config: testConfig, children });

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(typeof result.current.nextTheme).toBe('function');
      expect(result.current.nextTheme()).toBe('dark');
    });
  });

  describe('Theme Switching', () => {
    it('should switch themes correctly', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(ThemeProvider, { config: testConfig, children });

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.runtime.getCurrentTheme()).toBe('light');

      result.current.runtime.applyTheme('dark');

      // Theme update happens synchronously in mocked runtime
      expect(result.current.runtime.getCurrentTheme()).toBe('dark');
    });

    it('should cycle through themes with nextTheme', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(ThemeProvider, { config: testConfig, children });

      const { result } = renderHook(() => useTheme(), { wrapper });

      const nextThemeName = result.current.runtime.nextTheme();
      result.current.runtime.applyTheme(nextThemeName);

      // Theme update happens synchronously in mocked runtime
      expect(result.current.runtime.getCurrentTheme()).toBe('dark');
    });
  });
});
