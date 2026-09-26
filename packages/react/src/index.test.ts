import { describe, it, expect, beforeEach } from 'vitest';
import { ThemeProvider, useTheme } from './ThemeContext';
import { renderHook, act, render } from '@testing-library/react';
import type { ThemeConfig } from '@tokiforge/core/runtime';
import React from 'react';

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
    try {
      window.localStorage?.removeItem('tokiforge-theme');
    } catch {
      // ignore
    }
  });

  describe('ThemeProvider', () => {
    it('should render children', () => {
      const { container } = render(
        React.createElement(
          ThemeProvider,
          { config: testConfig, persist: false },
          React.createElement('div', { 'data-testid': 'child' }, 'Child')
        )
      );
      expect(container.querySelector('[data-testid="child"]')).toBeDefined();
    });

    it('should cleanup on unmount', () => {
      const { unmount } = render(
        React.createElement(ThemeProvider, { config: testConfig, persist: false }, null)
      );
      expect(() => unmount()).not.toThrow();
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
        React.createElement(ThemeProvider, { config: testConfig, persist: false }, children);
      const { result } = renderHook(() => useTheme(), { wrapper });
      expect(result.current.theme).toBe('light');
      expect(result.current.availableThemes).toEqual(['light', 'dark']);
    });

    it('should switch themes', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(ThemeProvider, { config: testConfig, persist: false }, children);
      const { result } = renderHook(() => useTheme(), { wrapper });

      await act(async () => {
        await result.current.setTheme('dark');
      });
      expect(result.current.theme).toBe('dark');
    });

    it('should cycle themes with nextTheme', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(ThemeProvider, { config: testConfig, persist: false }, children);
      const { result } = renderHook(() => useTheme(), { wrapper });

      await act(async () => {
        await result.current.nextTheme();
      });
      expect(result.current.theme).toBe('dark');
    });
  });
});
