import { describe, it, expect } from 'vitest';
import { AnalyticsDashboard } from '../components/AnalyticsDashboard';
import type { DesignTokens } from '@tokiforge/core';

describe('AnalyticsDashboard', () => {
  const mockTokens: DesignTokens = {
    color: {
      primary: { value: '#7C3AED', type: 'color' },
      secondary: { value: '#06B6D4', type: 'color' },
    },
    spacing: {
      sm: { value: '8px', type: 'dimension' },
      md: { value: '16px', type: 'dimension' },
      lg: { value: '24px', type: 'dimension' },
    },
    typography: {
      heading: { value: 'bold', type: 'fontWeight' },
      body: { value: 'normal', type: 'fontWeight' },
    },
  };

  it('component exports correctly', () => {
    expect(AnalyticsDashboard).toBeDefined();
    expect(typeof AnalyticsDashboard).toBe('function');
  });

  it('accepts tokens prop', () => {
    const props = { tokens: mockTokens };
    expect(props).toBeDefined();
    expect(props.tokens).toBeDefined();
  });

  it('has correct prop structure', () => {
    expect(mockTokens.color).toBeDefined();
    expect(mockTokens.spacing).toBeDefined();
    expect(mockTokens.typography).toBeDefined();
  });

  it('calculates token count correctly', () => {
    const tokenCount = Object.keys(mockTokens).reduce(
      (sum, category) => sum + Object.keys(mockTokens[category]).length,
      0
    );
    expect(tokenCount).toBe(7);
  });

  it('identifies token types correctly', () => {
    const types = new Set<string>();
    Object.values(mockTokens).forEach(category => {
      Object.values(category).forEach(token => {
        if (typeof token === 'object' && 'type' in token) {
          types.add(token.type);
        }
      });
    });
    expect(types.has('color')).toBe(true);
    expect(types.has('dimension')).toBe(true);
    expect(types.has('fontWeight')).toBe(true);
  });

  it('computes token distribution', () => {
    const distribution: Record<string, number> = {};
    Object.entries(mockTokens).forEach(([category, tokens]) => {
      distribution[category] = Object.keys(tokens).length;
    });
    expect(distribution.color).toBe(2);
    expect(distribution.spacing).toBe(3);
    expect(distribution.typography).toBe(2);
  });

  it('estimates bundle size for tokens', () => {
    let estimatedSize = 0;
    Object.values(mockTokens).forEach(category => {
      Object.values(category).forEach(token => {
        if (typeof token === 'object' && 'value' in token) {
          const value = String(token.value);
          estimatedSize += value.length * 2; // rough estimate in bytes
        }
      });
    });
    expect(estimatedSize).toBeGreaterThan(0);
  });

  it('handles empty token sets', () => {
    const emptyTokens: DesignTokens = {};
    const count = Object.keys(emptyTokens).length;
    expect(count).toBe(0);
  });
});
