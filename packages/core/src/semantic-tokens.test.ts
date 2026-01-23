import { describe, it, expect } from 'vitest';
import { SemanticTokenManager, type SemanticTokenLayer } from './semantic-tokens';

describe('SemanticTokenManager', () => {
  const primitiveTokens = {
    color: {
      primary: { value: '#007AFF' },
      secondary: { value: '#5AC8FA' },
      gray: {
        50: { value: '#F9FAFB' },
        100: { value: '#F3F4F6' },
        500: { value: '#6B7280' },
        900: { value: '#111827' },
      },
    },
  };

  describe('Layer Registration', () => {
    it('should register a semantic layer', () => {
      const manager = new SemanticTokenManager(primitiveTokens);
      const layer: SemanticTokenLayer = {
        name: 'base',
        tokens: {
          'color.primary': 'color.primary',
        },
      };

      manager.registerLayer(layer);
      expect(manager.getLayer('base')).toEqual(layer);
    });

    it('should get all registered layers', () => {
      const manager = new SemanticTokenManager(primitiveTokens);
      const layer1: SemanticTokenLayer = {
        name: 'base',
        tokens: { 'color.primary': 'color.primary' },
      };
      const layer2: SemanticTokenLayer = {
        name: 'dark',
        tokens: { 'color.primary': 'color.secondary' },
      };

      manager.registerLayer(layer1);
      manager.registerLayer(layer2);

      const layers = manager.getLayers();
      expect(layers).toHaveLength(2);
      expect(layers.map((l) => l.name)).toEqual(['base', 'dark']);
    });

    it('should throw error for layer without name', () => {
      const manager = new SemanticTokenManager(primitiveTokens);
      const layer = {
        tokens: { 'color.primary': 'color.primary' },
      } as any;

      expect(() => manager.registerLayer(layer)).toThrow('name');
    });
  });

  describe('Token Resolution', () => {
    it('should resolve a semantic token to primitive value', () => {
      const manager = new SemanticTokenManager(primitiveTokens);
      const layer: SemanticTokenLayer = {
        name: 'base',
        tokens: {
          'color.bg': 'color.gray.50',
        },
      };

      manager.registerLayer(layer);
      const resolution = manager.resolveSemantic('color.bg', 'base');

      expect(resolution.semanticName).toBe('color.bg');
      expect(resolution.primitiveToken).toBe('color.gray.50');
      expect(resolution.primitiveValue).toBe('#F9FAFB');
      expect(resolution.resolved).toBe(true);
    });

    it('should handle unresolved tokens', () => {
      const manager = new SemanticTokenManager(primitiveTokens);
      const layer: SemanticTokenLayer = {
        name: 'base',
        tokens: {
          'color.missing': 'color.nonexistent',
        },
      };

      manager.registerLayer(layer);
      const resolution = manager.resolveSemantic('color.missing', 'base');

      expect(resolution.resolved).toBe(false);
      expect(resolution.primitiveValue).toBe('');
    });

    it('should resolve non-existent semantic token', () => {
      const manager = new SemanticTokenManager(primitiveTokens);
      const layer: SemanticTokenLayer = {
        name: 'base',
        tokens: {},
      };

      manager.registerLayer(layer);
      const resolution = manager.resolveSemantic('color.nonexistent', 'base');

      expect(resolution.resolved).toBe(false);
      expect(resolution.primitiveToken).toBe('');
    });

    it('should resolve all tokens in a layer', () => {
      const manager = new SemanticTokenManager(primitiveTokens);
      const layer: SemanticTokenLayer = {
        name: 'base',
        tokens: {
          'color.primary': 'color.primary',
          'color.secondary': 'color.secondary',
          'color.bg': 'color.gray.50',
        },
      };

      manager.registerLayer(layer);
      const resolutions = manager.resolveLayer('base');

      expect(resolutions.size).toBe(3);
      expect(resolutions.get('color.primary')?.primitiveValue).toBe('#007AFF');
      expect(resolutions.get('color.bg')?.primitiveValue).toBe('#F9FAFB');
    });
  });

  describe('Layer Inheritance', () => {
    it('should inherit tokens from parent layer', () => {
      const manager = new SemanticTokenManager(primitiveTokens);
      
      const base: SemanticTokenLayer = {
        name: 'base',
        tokens: {
          'color.primary': 'color.primary',
          'color.secondary': 'color.secondary',
        },
      };

      const dark: SemanticTokenLayer = {
        name: 'dark',
        inherit: ['base'],
        tokens: {
          'color.primary': 'color.gray.900',
        },
      };

      manager.registerLayer(base);
      manager.registerLayer(dark);

      const darkResolutions = manager.resolveLayer('dark');
      
      expect(darkResolutions.get('color.primary')?.primitiveToken).toBe('color.gray.900');
      expect(darkResolutions.get('color.secondary')?.primitiveToken).toBe('color.secondary');
    });

    it('should handle multiple inheritance levels', () => {
      const manager = new SemanticTokenManager(primitiveTokens);

      const base: SemanticTokenLayer = {
        name: 'base',
        tokens: { 'color.primary': 'color.primary' },
      };

      const dark: SemanticTokenLayer = {
        name: 'dark',
        inherit: ['base'],
        tokens: { 'color.bg': 'color.gray.900' },
      };

      const hc: SemanticTokenLayer = {
        name: 'high-contrast',
        inherit: ['dark'],
        tokens: { 'color.primary': 'color.gray.50' },
      };

      manager.registerLayer(base);
      manager.registerLayer(dark);
      manager.registerLayer(hc);

      const hcResolutions = manager.resolveLayer('high-contrast');

      expect(hcResolutions.get('color.primary')?.primitiveToken).toBe('color.gray.50');
      expect(hcResolutions.get('color.bg')?.primitiveToken).toBe('color.gray.900');
    });

    it('should prevent circular inheritance', () => {
      const manager = new SemanticTokenManager(primitiveTokens);

      const layer1: SemanticTokenLayer = {
        name: 'layer1',
        inherit: ['layer2'],
        tokens: {},
      };

      const layer2: SemanticTokenLayer = {
        name: 'layer2',
        inherit: ['layer1'],
        tokens: {},
      };

      manager.registerLayer(layer1);
      manager.registerLayer(layer2);

      const validation = manager.validate('layer1');
      expect(validation.valid).toBe(false);
      expect(validation.errors.some((e) => e.includes('circular'))).toBe(true);
    });
  });

  describe('Conditional Mappings', () => {
    it('should resolve conditional mappings', () => {
      const manager = new SemanticTokenManager(primitiveTokens);

      const layer: SemanticTokenLayer = {
        name: 'conditional',
        tokens: {
          'color.text': {
            $resolve: 'color.gray.50',
            $condition: ['dark', 'high-contrast'],
            $fallback: 'color.gray.900',
          },
        },
      };

      manager.registerLayer(layer);

      // With matching condition
      const darkResolution = manager.resolveSemantic('color.text', 'conditional', {
        theme: 'dark',
      });
      expect(darkResolution.primitiveToken).toBe('color.gray.50');

      // Without matching condition - uses fallback
      const lightResolution = manager.resolveSemantic(
        'color.text',
        'conditional',
        { theme: 'light' }
      );
      expect(lightResolution.primitiveToken).toBe('color.gray.900');
    });

    it('should use fallback for unresolved token', () => {
      const manager = new SemanticTokenManager(primitiveTokens);

      const layer: SemanticTokenLayer = {
        name: 'fallback',
        tokens: {
          'color.accent': {
            $resolve: 'color.brand.accent', // Non-existent
            $fallback: 'color.primary',
          },
        },
      };

      manager.registerLayer(layer);
      const resolution = manager.resolveSemantic('color.accent', 'fallback');

      expect(resolution.primitiveToken).toBe('color.primary');
      expect(resolution.primitiveValue).toBe('#007AFF');
      expect(resolution.resolved).toBe(true);
    });
  });

  describe('Validation', () => {
    it('should validate layer structure', () => {
      const manager = new SemanticTokenManager(primitiveTokens);

      const validLayer: SemanticTokenLayer = {
        name: 'valid',
        tokens: {
          'color.primary': 'color.primary',
          'color.bg': 'color.gray.50',
        },
      };

      manager.registerLayer(validLayer);
      const validation = manager.validate('valid');

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect unresolved references', () => {
      const manager = new SemanticTokenManager(primitiveTokens);

      const invalidLayer: SemanticTokenLayer = {
        name: 'invalid',
        tokens: {
          'color.missing': 'color.nonexistent',
        },
      };

      manager.registerLayer(invalidLayer);
      const validation = manager.validate('invalid');

      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors[0]).toContain('undefined');
    });

    it('should validate all layers', () => {
      const manager = new SemanticTokenManager(primitiveTokens);

      manager.registerLayer({
        name: 'valid',
        tokens: { 'color.primary': 'color.primary' },
      });

      manager.registerLayer({
        name: 'invalid',
        tokens: { 'color.missing': 'color.nonexistent' },
      });

      const validation = manager.validate();

      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should detect non-existent parent layers', () => {
      const manager = new SemanticTokenManager(primitiveTokens);

      const layer: SemanticTokenLayer = {
        name: 'orphan',
        inherit: ['nonexistent'],
        tokens: {},
      };

      manager.registerLayer(layer);
      const validation = manager.validate('orphan');

      expect(validation.valid).toBe(false);
      expect(validation.errors.some((e) => e.includes('non-existent'))).toBe(true);
    });
  });

  describe('Documentation', () => {
    it('should generate documentation', () => {
      const manager = new SemanticTokenManager(primitiveTokens);

      const layer: SemanticTokenLayer = {
        name: 'base',
        tokens: {
          'color.primary': 'color.primary',
          'color.bg': 'color.gray.50',
        },
      };

      manager.registerLayer(layer);
      const docs = manager.getDocumentation('base');

      expect(docs['color.primary']).toBeDefined();
      expect(docs['color.primary'].primitiveToken).toBe('color.primary');
      expect(docs['color.primary'].primitiveValue).toBe('#007AFF');
      expect(docs['color.bg'].primitiveValue).toBe('#F9FAFB');
    });
  });

  describe('Export', () => {
    it('should export as JSON', () => {
      const manager = new SemanticTokenManager(primitiveTokens);

      const layer: SemanticTokenLayer = {
        name: 'base',
        tokens: {
          'color.primary': 'color.primary',
          'color.bg': 'color.gray.50',
        },
      };

      manager.registerLayer(layer);
      const json = manager.export('base', 'json');

      const parsed = JSON.parse(json);
      expect(parsed['color.primary'].value).toBe('#007AFF');
      expect(parsed['color.bg'].value).toBe('#F9FAFB');
    });

    it('should export as CSS', () => {
      const manager = new SemanticTokenManager(primitiveTokens);

      const layer: SemanticTokenLayer = {
        name: 'base',
        tokens: {
          'color.primary': 'color.primary',
          'color.bg': 'color.gray.50',
        },
      };

      manager.registerLayer(layer);
      const css = manager.export('base', 'css');

      expect(css).toContain(':root[data-semantic="base"]');
      expect(css).toContain('--semantic-color-primary: #007AFF');
      expect(css).toContain('--semantic-color-bg: #F9FAFB');
    });
  });

  describe('Cache Management', () => {
    it('should clear resolution cache', () => {
      const manager = new SemanticTokenManager(primitiveTokens);

      const layer: SemanticTokenLayer = {
        name: 'base',
        tokens: { 'color.primary': 'color.primary' },
      };

      manager.registerLayer(layer);
      manager.resolveSemantic('color.primary', 'base');

      // Should not throw
      expect(() => manager.clearCache()).not.toThrow();
    });

    it('should clear cache on layer registration', () => {
      const manager = new SemanticTokenManager(primitiveTokens);

      const layer1: SemanticTokenLayer = {
        name: 'base',
        tokens: { 'color.primary': 'color.primary' },
      };

      manager.registerLayer(layer1);
      manager.resolveSemantic('color.primary', 'base');

      const layer2: SemanticTokenLayer = {
        name: 'dark',
        tokens: { 'color.primary': 'color.gray.900' },
      };

      // Should clear cache when registering new layer
      manager.registerLayer(layer2);

      const resolution = manager.resolveSemantic('color.primary', 'dark');
      expect(resolution.primitiveValue).toBe('#111827');
    });
  });
});
