import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { TokenUsageVisualizer } from '../components/TokenUsageVisualizer';
import type { DesignTokens } from '@tokiforge/core';

describe('TokenUsageVisualizer', () => {
  const mockTokens: DesignTokens = {
    color: {
      primary: { value: '#7C3AED', type: 'color' },
      secondary: { value: '#06B6D4', type: 'color' },
    },
    spacing: {
      sm: { value: '8px', type: 'dimension' },
      md: { value: '16px', type: 'dimension' },
    },
  };

  it('renders token usage visualizer', () => {
    render(<TokenUsageVisualizer tokens={mockTokens} />);
    expect(document.body.textContent).toContain('Token Usage & Structure');
  });

  it('displays token statistics', () => {
    render(<TokenUsageVisualizer tokens={mockTokens} />);
    expect(document.body.textContent).toContain('Total Tokens');
    expect(document.body.textContent).toContain('Colors');
    expect(document.body.textContent).toContain('Spacing');
  });

  it('shows token distribution', () => {
    render(<TokenUsageVisualizer tokens={mockTokens} />);
    expect(document.body.textContent).toContain('Token Distribution');
  });

  it('renders token hierarchy', () => {
    render(<TokenUsageVisualizer tokens={mockTokens} />);
    expect(document.body.textContent).toContain('Token Hierarchy');
  });
});
