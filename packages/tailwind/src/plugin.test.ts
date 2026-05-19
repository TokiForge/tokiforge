import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  createTailwindPlugin,
  generateTailwindPreset,
  generateTailwindThemeVariables,
  mapTokensToUtilities,
} from './plugin';
import type { DesignTokens } from '@tokiforge/core';

const mockTokens: DesignTokens = {
  colors: {
    primary: { value: '#007AFF', type: 'color' },
    secondary: { value: '#5AC8FA', type: 'color' },
    error: { value: '#FF3B30', type: 'color' },
  } as any,
  spacing: {
    xs: { value: 4, type: 'spacing' },
    sm: { value: 8, type: 'spacing' },
    md: { value: 16, type: 'spacing' },
    lg: { value: 32, type: 'spacing' },
  } as any,
  borderRadius: {
    sm: { value: 4, type: 'borderRadius' },
    md: { value: 8, type: 'borderRadius' },
    lg: { value: 12, type: 'borderRadius' },
  } as any,
  fontSize: {
    sm: { value: 12, type: 'fontSize' },
    base: { value: 16, type: 'fontSize' },
    lg: { value: 20, type: 'fontSize' },
  } as any,
  fontFamily: {
    sans: { value: 'system-ui, -apple-system, sans-serif', type: 'fontFamily' },
    mono: { value: 'Menlo, monospace', type: 'fontFamily' },
  } as any,
};

const tokensTestFile = path.join(__dirname, 'test-tokens.json');

describe('Tailwind Plugin v4', () => {
  beforeEach(() => {
    fs.writeFileSync(tokensTestFile, JSON.stringify(mockTokens, null, 2));
  });

  afterEach(() => {
    if (fs.existsSync(tokensTestFile)) {
      fs.unlinkSync(tokensTestFile);
    }
  });

  describe('mapTokensToUtilities', () => {
    it('should map color tokens to utilities', () => {
      const utilities = mapTokensToUtilities(mockTokens as any);

      expect(utilities.colors).toBeDefined();
      expect(Object.keys(utilities.colors).length).toBeGreaterThan(0);
    });

    it('should map spacing tokens to utilities', () => {
      const utilities = mapTokensToUtilities(mockTokens as any);

      expect(utilities.spacing).toBeDefined();
      expect(utilities.spacing['xs']).toBe('4px');
      expect(utilities.spacing['md']).toBe('16px');
    });

    it('should map border radius tokens', () => {
      const utilities = mapTokensToUtilities(mockTokens as any);

      expect(utilities.borderRadius).toBeDefined();
      expect(utilities.borderRadius['md']).toBe('8px');
    });

    it('should map font size tokens', () => {
      const utilities = mapTokensToUtilities(mockTokens as any);

      expect(utilities.fontSize).toBeDefined();
      expect(utilities.fontSize['base']).toBe('16px');
    });

    it('should map font family tokens', () => {
      const utilities = mapTokensToUtilities(mockTokens as any);

      expect(utilities.fontFamily).toBeDefined();
      expect(utilities.fontFamily['sans']).toBe('system-ui, -apple-system, sans-serif');
    });

    it('should respect custom theme mappings', () => {
      const customMappings = {
        colors: ['colors', 'palette'],
        spacing: ['spacing', 'gaps'],
      };

      const utilities = mapTokensToUtilities(mockTokens as any, customMappings);

      expect(utilities.colors).toBeDefined();
      expect(utilities.spacing).toBeDefined();
    });
  });

  describe('createTailwindPlugin', () => {
    it('should create a valid Tailwind plugin', () => {
      const plugin = createTailwindPlugin({
        tokensPath: tokensTestFile,
      });

      expect(plugin).toBeDefined();
    });

    it('should handle missing tokens file gracefully when strict is false', () => {
      expect(() => {
        createTailwindPlugin({
          tokensPath: '/nonexistent/tokens.json',
          strict: false,
        });
      }).not.toThrow();
    });

    it('should throw when tokens file is missing and strict is true', () => {
      expect(() => {
        createTailwindPlugin({
          tokensPath: '/nonexistent/tokens.json',
          strict: true,
        });
      }).toThrow('Tokens file not found');
    });

    it('should support custom prefix', () => {
      const plugin = createTailwindPlugin({
        tokensPath: tokensTestFile,
        prefix: 'custom',
      });

      expect(plugin).toBeDefined();
    });

    it('should support watch mode', () => {
      const plugin = createTailwindPlugin({
        tokensPath: tokensTestFile,
        watch: true,
      });

      expect(plugin).toBeDefined();
    });

    it('should support Tailwind v4 syntax', () => {
      const plugin = createTailwindPlugin({
        tokensPath: tokensTestFile,
        v4: true,
      });

      expect(plugin).toBeDefined();
    });
  });

  describe('generateTailwindPreset', () => {
    it('should generate a valid Tailwind preset', () => {
      const preset = generateTailwindPreset(tokensTestFile);

      expect(preset).toBeDefined();
      expect(preset.theme).toBeDefined();
      expect(preset.theme?.extend).toBeDefined();
    });

    it('should include colors in preset', () => {
      const preset = generateTailwindPreset(tokensTestFile);

      expect(preset.theme?.extend?.colors).toBeDefined();
      expect(Object.keys(preset.theme?.extend?.colors || {}).length).toBeGreaterThan(0);
    });

    it('should include spacing in preset', () => {
      const preset = generateTailwindPreset(tokensTestFile);

      expect(preset.theme?.extend?.spacing).toBeDefined();
    });

    it('should support custom theme mappings in preset', () => {
      const preset = generateTailwindPreset(tokensTestFile, {
        themeMappings: {
          colors: ['colors'],
          spacing: ['spacing'],
        },
      });

      expect(preset.theme?.extend).toBeDefined();
    });

    it('should support v4 flag', () => {
      const preset = generateTailwindPreset(tokensTestFile, { v4: true });

      expect(preset).toBeDefined();
      expect(preset.plugins).toBeDefined();
      expect(Array.isArray(preset.plugins)).toBe(true);
    });

    it('should throw error for missing file', () => {
      expect(() => {
        generateTailwindPreset('/nonexistent/tokens.json');
      }).toThrow('Tokens file not found');
    });
  });

  describe('generateTailwindThemeVariables', () => {
    it('should generate CSS theme variables', () => {
      const variables = generateTailwindThemeVariables(mockTokens as any);

      expect(variables).toBeDefined();
      expect(Object.keys(variables).length).toBeGreaterThan(0);
    });

    it('should include color variables', () => {
      const variables = generateTailwindThemeVariables(mockTokens as any);

      expect(Object.keys(variables).some((k) => k.startsWith('--color-'))).toBe(true);
    });

    it('should include spacing variables', () => {
      const variables = generateTailwindThemeVariables(mockTokens as any);

      expect(Object.keys(variables).some((k) => k.startsWith('--spacing-'))).toBe(true);
    });

    it('should support custom prefix', () => {
      const variables = generateTailwindThemeVariables(mockTokens as any, 'custom');

      expect(variables).toBeDefined();
      expect(Object.keys(variables).length).toBeGreaterThan(0);
    });
  });

  describe('Tailwind v4 Support', () => {
    it('should generate v4-compatible config', () => {
      const preset = generateTailwindPreset(tokensTestFile, { v4: true });

      expect(preset.theme?.extend).toBeDefined();
      expect(preset.plugins).toBeDefined();
    });

    it('should support @theme syntax variables', () => {
      const variables = generateTailwindThemeVariables(mockTokens as any);

      const colorVariables = Object.entries(variables).filter(([key]) =>
        key.startsWith('--color-')
      );

      expect(colorVariables.length).toBeGreaterThan(0);
    });

    it('should generate theme variables for all token categories', () => {
      const variables = generateTailwindThemeVariables(mockTokens as any);

      const hasColors = Object.keys(variables).some((k) => k.includes('color'));
      const hasSpacing = Object.keys(variables).some((k) => k.includes('spacing'));
      const hasRadius = Object.keys(variables).some((k) => k.includes('radius'));

      expect(hasColors).toBe(true);
      expect(hasSpacing).toBe(true);
      expect(hasRadius).toBe(true);
    });
  });

  describe('Token-to-Utility Mapping', () => {
    it('should map all token types correctly', () => {
      const utilities = mapTokensToUtilities(mockTokens as any);

      expect(utilities.colors).toBeDefined();
      expect(utilities.spacing).toBeDefined();
      expect(utilities.borderRadius).toBeDefined();
      expect(utilities.fontSize).toBeDefined();
      expect(utilities.fontFamily).toBeDefined();
    });

    it('should convert numeric spacing to px units', () => {
      const utilities = mapTokensToUtilities(mockTokens as any);

      expect(utilities.spacing['xs']).toBe('4px');
      expect(utilities.spacing['sm']).toBe('8px');
    });

    it('should handle color format validation', () => {
      const customTokens: DesignTokens = {
        colors: {
          hex: { value: '#FF0000', type: 'color' },
          rgb: { value: 'rgb(255, 0, 0)', type: 'color' },
        } as any,
      };

      const utilities = mapTokensToUtilities(customTokens);

      expect(utilities.colors['hex']).toBe('#FF0000');
      expect(utilities.colors['rgb']).toBe('rgb(255, 0, 0)');
    });

    it('should skip invalid token values', () => {
      const customTokens: DesignTokens = {
        colors: {
          valid: { value: '#FF0000', type: 'color' },
          invalid: { value: 'not-a-color', type: 'color' },
        } as any,
      };

      const utilities = mapTokensToUtilities(customTokens);

      expect(utilities.colors['valid']).toBe('#FF0000');
      expect(utilities.colors['invalid']).toBeUndefined();
    });
  });

  describe('Watch Mode', () => {
    it('should support file watching option', () => {
      const plugin = createTailwindPlugin({
        tokensPath: tokensTestFile,
        watch: true,
      });

      expect(plugin).toBeDefined();
    });

    it('should handle token file updates', async () => {
      createTailwindPlugin({
        tokensPath: tokensTestFile,
        watch: true,
      });

      // Simulate file update after delay
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          const updatedTokens = {
            ...mockTokens,
            colors: {
              ...mockTokens.colors,
              success: { value: '#34C759', type: 'color' },
            },
          };

          fs.writeFileSync(tokensTestFile, JSON.stringify(updatedTokens, null, 2));
          resolve();
        }, 100);
      });
    });
  });
});
