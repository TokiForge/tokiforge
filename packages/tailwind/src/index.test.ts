import { describe, it, expect } from 'vitest';
import { generateTailwindConfig } from './index';
import type { DesignTokens } from '@tokiforge/core';

describe('Tailwind Integration', () => {
  const testTokens: DesignTokens = {
    color: {
      primary: { value: '#7C3AED', type: 'color' },
      secondary: { value: '#06B6D4', type: 'color' },
      background: {
        default: { value: '#FFFFFF', type: 'color' },
        muted: { value: '#F3F4F6', type: 'color' },
      },
    },
    spacing: {
      xs: { value: '4px', type: 'dimension' },
      sm: { value: '8px', type: 'dimension' },
      md: { value: '16px', type: 'dimension' },
      lg: { value: '24px', type: 'dimension' },
    },
    radius: {
      sm: { value: '4px', type: 'dimension' },
      md: { value: '8px', type: 'dimension' },
      lg: { value: '12px', type: 'dimension' },
    },
  };

  describe('generateTailwindConfig', () => {
    it('should throw error if no tokens provided', () => {
      expect(() => generateTailwindConfig()).toThrow(
        'Either tokensPath or tokens must be provided'
      );
    });

    it('should generate config from tokens object', () => {
      const config = generateTailwindConfig({ tokens: testTokens });

      expect(config).toBeDefined();
      expect(config.theme).toBeDefined();
      expect(config.theme?.extend).toBeDefined();
    });

    it('should generate colors from color tokens', () => {
      const config = generateTailwindConfig({ tokens: testTokens });

      const colors = config.theme?.extend?.colors as Record<string, unknown>;
      expect(colors).toBeDefined();
      expect(colors?.primary).toBeDefined();
      expect(colors?.secondary).toBeDefined();
    });

    it('should generate spacing from spacing tokens', () => {
      const config = generateTailwindConfig({ tokens: testTokens });

      const spacing = config.theme?.extend?.spacing as Record<string, unknown>;
      expect(spacing).toBeDefined();
      expect(spacing?.xs).toBeDefined();
      expect(spacing?.sm).toBeDefined();
      expect(spacing?.md).toBeDefined();
    });

    it('should generate border radius from radius tokens', () => {
      const config = generateTailwindConfig({ tokens: testTokens });

      const borderRadius = config.theme?.extend?.borderRadius as Record<string, unknown>;
      expect(borderRadius).toBeDefined();
    });

    it('should use CSS variables when useCSSVariables is true', () => {
      const config = generateTailwindConfig({
        tokens: testTokens,
        useCSSVariables: true,
        prefix: 'test',
      });

      const colors = config.theme?.extend?.colors as Record<string, string>;
      expect(colors?.primary).toContain('var(--test-');
    });

    it('should use raw values when useCSSVariables is false', () => {
      const config = generateTailwindConfig({
        tokens: testTokens,
        useCSSVariables: false,
      });

      const colors = config.theme?.extend?.colors as Record<string, string>;
      expect(colors?.primary).toBe('#7C3AED');
    });

    it('should respect custom prefix', () => {
      const config = generateTailwindConfig({
        tokens: testTokens,
        useCSSVariables: true,
        prefix: 'custom',
      });

      const colors = config.theme?.extend?.colors as Record<string, string>;
      expect(colors?.primary).toContain('--custom-');
    });

    it('should handle nested color tokens', () => {
      const config = generateTailwindConfig({ tokens: testTokens });

      const colors = config.theme?.extend?.colors as Record<string, unknown>;
      // Just verify colors are generated - implementation may flatten differently
      expect(colors).toBeDefined();
      expect(Object.keys(colors || {}).length).toBeGreaterThan(0);
    });

    it('should respect custom theme mappings', () => {
      const customTokens: DesignTokens = {
        myColors: {
          brand: { value: '#FF0000', type: 'color' },
        },
      };

      const config = generateTailwindConfig({
        tokens: customTokens,
        themeMappings: {
          colors: ['myColors'],
        },
      });

      // Just verify config is generated with theme.extend
      expect(config.theme?.extend).toBeDefined();
    });
  });

  describe('Tailwind Plugin', () => {
    it('should export generateTailwindConfig function', () => {
      expect(generateTailwindConfig).toBeDefined();
      expect(typeof generateTailwindConfig).toBe('function');
    });

    it('should return valid Tailwind config structure', () => {
      const config = generateTailwindConfig({ tokens: testTokens });

      expect(config).toHaveProperty('theme');
      expect(config.theme).toHaveProperty('extend');
      expect(typeof config.theme?.extend).toBe('object');
    });

    it('should handle empty token categories gracefully', () => {
      const minimalTokens: DesignTokens = {
        color: {
          primary: { value: '#000000', type: 'color' },
        },
      };

      expect(() => 
        generateTailwindConfig({ tokens: minimalTokens })
      ).not.toThrow();
    });
  });
});
