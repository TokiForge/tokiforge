import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ContrastVisualizer } from '../components/ContrastVisualizer';
import type { DesignTokens } from '@tokiforge/core';

describe('ContrastVisualizer', () => {
  const mockTokens: DesignTokens = {
    color: {
      primary: { value: '#7C3AED', type: 'color' },
      secondary: { value: '#06B6D4', type: 'color' },
      text: {
        primary: { value: '#1F2937', type: 'color' },
        secondary: { value: '#6B7280', type: 'color' },
      },
      background: {
        default: { value: '#FFFFFF', type: 'color' },
      },
    },
  };

  it('renders contrast visualizer', () => {
    render(<ContrastVisualizer tokens={mockTokens} />);
    expect(document.body.textContent).toContain('Contrast Ratio Checker');
  });

  it('displays color selectors', () => {
    render(<ContrastVisualizer tokens={mockTokens} />);
    expect(document.body.textContent).toContain('Foreground Color');
    expect(document.body.textContent).toContain('Background Color');
  });

  it('shows placeholder when no colors selected', () => {
    render(<ContrastVisualizer tokens={mockTokens} />);
    expect(document.body.textContent).toMatch(/Select two colors to check their contrast ratio/i);
  });
});
