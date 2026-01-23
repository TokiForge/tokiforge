import { describe, it, expect } from 'vitest';
import { IOSExporter, AndroidExporter, ReactNativeExporter } from './index';

const mockTokens: any = {
  colors: {
    primary: { value: '#007AFF', type: 'color' },
    secondary: { value: '#5AC8FA', type: 'color' },
    error: { value: '#FF3B30', type: 'color' },
  },
  typography: {
    heading: {
      value: {
        fontSize: 28,
        fontWeight: 'bold',
        lineHeight: 1.4,
      },
      type: 'typography',
    },
    body: {
      value: {
        fontSize: 16,
        fontWeight: 'regular',
        lineHeight: 1.5,
      },
      type: 'typography',
    },
  },
  spacing: {
    xs: { value: 4, type: 'spacing' },
    sm: { value: 8, type: 'spacing' },
    md: { value: 16, type: 'spacing' },
    lg: { value: 32, type: 'spacing' },
  },
  sizing: {
    small: { value: 20, type: 'sizing' },
    medium: { value: 40, type: 'sizing' },
    large: { value: 80, type: 'sizing' },
  },
};

describe('Platform Exporters', () => {
  describe('IOSExporter', () => {
    it('should export as Swift format', () => {
      const result = IOSExporter.export(mockTokens, { format: 'swift' });

      expect(result).toContain('import UIKit');
      expect(result).toContain('enum DesignTokens');
      expect(result).toContain('colorsPrimary');
      expect(result).toContain('colorsSecondary');
    });

    it('should export as SwiftUI format', () => {
      const result = IOSExporter.export(mockTokens, { format: 'swiftui' });

      expect(result).toContain('import SwiftUI');
      expect(result).toContain('struct DesignTokens');
      expect(result).toContain('EnvironmentKey');
    });

    it('should export colors in hex format', () => {
      const result = IOSExporter.export(mockTokens, {
        format: 'swift',
        colorFormat: 'hex',
      });

      expect(result).toContain('colorsPrimary');
      expect(result).toContain('007AFF');
    });

    it('should export colors in RGB format', () => {
      const result = IOSExporter.export(mockTokens, {
        format: 'swift',
        colorFormat: 'rgb',
      });

      expect(result).toContain('UIColor(red:');
    });

    it('should export typography tokens', () => {
      const result = IOSExporter.export(mockTokens, { format: 'swift' });

      expect(result).toContain('typographyHeading');
      expect(result).toContain('UIFont.systemFont');
    });

    it('should export spacing tokens', () => {
      const result = IOSExporter.export(mockTokens, { format: 'swift' });

      expect(result).toContain('spacingXs');
      expect(result).toContain('CGFloat');
    });

    it('should use custom class name', () => {
      const result = IOSExporter.export(mockTokens, {
        format: 'swift',
        className: 'AppTokens',
      });

      expect(result).toContain('enum AppTokens');
    });
  });

  describe('AndroidExporter', () => {
    it('should export as Kotlin format', () => {
      const result = AndroidExporter.export(mockTokens, { format: 'kotlin' });

      expect(result).toContain('object DesignTokens');
      expect(result).toContain('Color');
      expect(result).toContain('primary');
    });

    it('should export as XML format', () => {
      const result = AndroidExporter.export(mockTokens, { format: 'xml' });

      expect(result).toContain('<?xml version');
      expect(result).toContain('<resources>');
      expect(result).toContain('<color name=');
      expect(result).toContain('</resources>');
    });

    it('should export colors to XML', () => {
      const result = AndroidExporter.export(mockTokens, { format: 'xml' });

      expect(result).toContain('colors_primary');
      expect(result).toContain('#007AFF');
    });

    it('should export spacing to XML dimensions', () => {
      const result = AndroidExporter.export(mockTokens, { format: 'xml' });

      expect(result).toContain('<dimen');
      expect(result).toContain('spacing_xs');
      expect(result).toContain('dp');
    });

    it('should export colors in Kotlin format', () => {
      const result = AndroidExporter.export(mockTokens, {
        format: 'kotlin',
        colorFormat: 'hex',
      });

      expect(result).toContain('Color');
      expect(result).toContain('primary');
    });

    it('should format colors as Int in Kotlin', () => {
      const result = AndroidExporter.export(mockTokens, {
        format: 'kotlin',
        colorFormat: 'int',
      });

      expect(result).toContain('primary');
    });

    it('should use custom package name', () => {
      const result = AndroidExporter.export(mockTokens, {
        format: 'kotlin',
        packageName: 'com.myapp.design',
      });

      expect(result).toContain('package com.myapp.design');
    });

    it('should use custom object name', () => {
      const result = AndroidExporter.export(mockTokens, {
        format: 'kotlin',
        objectName: 'AppTheme',
      });

      expect(result).toContain('object AppTheme');
    });
  });

  describe('ReactNativeExporter', () => {
    it('should export as TypeScript format', () => {
      const result = ReactNativeExporter.export(mockTokens, {
        format: 'typescript',
      });

      expect(result).toContain("import { StyleSheet }");
      expect(result).toContain('export const tokens');
      expect(result).toContain('export type Tokens');
    });

    it('should export as JavaScript format', () => {
      const result = ReactNativeExporter.export(mockTokens, {
        format: 'javascript',
      });

      expect(result).toContain("import { StyleSheet }");
      expect(result).toContain('export const tokens');
      expect(result).toContain('export function useTokens');
    });

    it('should export colors correctly', () => {
      const result = ReactNativeExporter.export(mockTokens, {
        format: 'typescript',
      });

      expect(result).toContain('colors:');
      expect(result).toContain('colorsPrimary');
      expect(result).toContain('#007AFF');
    });

    it('should export typography correctly', () => {
      const result = ReactNativeExporter.export(mockTokens, {
        format: 'typescript',
      });

      expect(result).toContain('typography:');
      expect(result).toContain('typographyHeading');
      expect(result).toContain('fontSize');
    });

    it('should export spacing correctly', () => {
      const result = ReactNativeExporter.export(mockTokens, {
        format: 'typescript',
      });

      expect(result).toContain('spacing:');
      expect(result).toContain('spacingXs: 4');
    });

    it('should include theme interface when includeTheme is true', () => {
      const result = ReactNativeExporter.export(mockTokens, {
        format: 'typescript',
        includeTheme: true,
      });

      expect(result).toContain('interface Theme');
    });

    it('should skip theme interface when includeTheme is false', () => {
      const result = ReactNativeExporter.export(mockTokens, {
        format: 'typescript',
        includeTheme: false,
      });

      expect(result).not.toContain('interface Theme');
    });

    it('should include useTokens hook', () => {
      const result = ReactNativeExporter.export(mockTokens, {
        format: 'typescript',
      });

      expect(result).toContain('export function useTokens()');
    });
  });

  describe('Token Type Detection', () => {
    it('should detect color tokens correctly', () => {
      const result = IOSExporter.export(mockTokens);
      expect(result).toContain('colorsPrimary');
    });

    it('should detect typography tokens correctly', () => {
      const result = AndroidExporter.export(mockTokens, { format: 'xml' });
      expect(result).toContain('typography_heading');
    });

    it('should detect spacing tokens correctly', () => {
      const result = ReactNativeExporter.export(mockTokens);
      expect(result).toContain('spacingXs');
    });

    it('should detect sizing tokens correctly', () => {
      const result = ReactNativeExporter.export(mockTokens);
      expect(result).toContain('sizingSmall');
    });
  });

  describe('Value Formatting', () => {
    it('should convert camelCase to snake_case for Android', () => {
      const result = AndroidExporter.export(mockTokens, { format: 'kotlin' });
      expect(result).toContain('colors_primary');
    });

    it('should preserve hex color format', () => {
      const result = IOSExporter.export(mockTokens);
      expect(result).toContain('007AFF');
    });

    it('should extract numeric values for spacing', () => {
      const result = ReactNativeExporter.export(mockTokens);
      expect(result).toContain('spacingXs: 4');
      expect(result).toContain('spacingMd: 16');
    });
  });
});
