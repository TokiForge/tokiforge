import { describe, it, expect } from 'vitest';
import { TokenExporter } from './exporter';
import type { DesignTokens } from './types';

describe('TokenExporter', () => {
  const sampleTokens: DesignTokens = {
    color: {
      primary: { value: '#7C3AED', type: 'color' },
      secondary: { value: '#06B6D4', type: 'color' },
    },
    spacing: {
      sm: { value: '8px', type: 'dimension' },
      md: { value: '16px', type: 'dimension' },
    },
  };

  describe('exportCSS', () => {
    it('should export CSS custom properties', () => {
      const css = TokenExporter.exportCSS(sampleTokens);
      expect(css).toContain(':root {');
      expect(css).toContain('--hf-color-primary');
      expect(css).toContain('#7C3AED');
    });

    it('should use custom selector', () => {
      const css = TokenExporter.exportCSS(sampleTokens, { selector: '.theme' });
      expect(css).toContain('.theme {');
    });

    it('should use custom prefix', () => {
      const css = TokenExporter.exportCSS(sampleTokens, { prefix: 'tf' });
      expect(css).toContain('--tf-color-primary');
    });
  });

  describe('exportSCSS', () => {
    it('should export SCSS variables', () => {
      const scss = TokenExporter.exportSCSS(sampleTokens);
      expect(scss).toContain('$hf-color-primary');
      expect(scss).toContain('#7C3AED');
    });
  });

  describe('exportJS', () => {
    it('should export JavaScript object', () => {
      const js = TokenExporter.exportJS(sampleTokens);
      expect(js).toContain('export default');
      expect(js).toContain('color');
      expect(js).toContain('primary');
      expect(js).toContain('#7C3AED');
    });
  });

  describe('exportTS', () => {
    it('should export TypeScript with types', () => {
      const ts = TokenExporter.exportTS(sampleTokens);
      expect(ts).toContain('export type DesignTokens');
      expect(ts).toContain('export default');
    });
  });

  describe('export', () => {
    it('should export CSS format', () => {
      const result = TokenExporter.export(sampleTokens, { format: 'css' });
      expect(result).toContain(':root {');
    });

    it('should export SCSS format', () => {
      const result = TokenExporter.export(sampleTokens, { format: 'scss' });
      expect(result).toContain('$hf-');
    });

    it('should export JS format', () => {
      const result = TokenExporter.export(sampleTokens, { format: 'js' });
      expect(result).toContain('export default');
      expect(result).toContain('color');
    });

    it('should export TS format', () => {
      const result = TokenExporter.export(sampleTokens, { format: 'ts' });
      expect(result).toContain('export type DesignTokens');
      expect(result).toContain('export default');
    });

    it('should export JSON format', () => {
      const result = TokenExporter.export(sampleTokens, { format: 'json' });
      const parsed = JSON.parse(result);
      expect(parsed.color.primary.value).toBe('#7C3AED');
    });
  });
});

