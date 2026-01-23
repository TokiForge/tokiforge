import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ThemeComparison } from '../components/ThemeComparison';
import type { ThemeConfig } from '@tokiforge/core';

describe('ThemeComparison', () => {
  const mockConfig: ThemeConfig = {
    themes: [
      {
        name: 'light',
        tokens: {
          color: {
            primary: { value: '#7C3AED', type: 'color' },
          },
        },
      },
      {
        name: 'dark',
        tokens: {
          color: {
            primary: { value: '#A78BFA', type: 'color' },
          },
        },
      },
    ],
    defaultTheme: 'light',
  };

  const mockConfigSingleTheme: ThemeConfig = {
    themes: [
      {
        name: 'light',
        tokens: {
          color: {
            primary: { value: '#7C3AED', type: 'color' },
          },
        },
      },
    ],
    defaultTheme: 'light',
  };

  it('renders theme comparison', () => {
    render(<ThemeComparison config={mockConfig} />);
    expect(document.body.textContent).toContain('Theme Comparison');
  });

  it('shows placeholder for single theme', () => {
    render(<ThemeComparison config={mockConfigSingleTheme} />);
    expect(document.body.textContent).toMatch(/Add at least two themes to enable comparison/i);
  });

  it('displays comparison statistics', () => {
    render(<ThemeComparison config={mockConfig} />);
    expect(document.body.textContent).toContain('Total Tokens');
    expect(document.body.textContent).toContain('Same Values');
    expect(document.body.textContent).toContain('Different Values');
  });

  it('renders comparison table headers', () => {
    render(<ThemeComparison config={mockConfig} />);
    expect(document.body.textContent).toContain('Token Path');
    expect(document.body.textContent).toContain('light');
    expect(document.body.textContent).toContain('dark');
  });
});
