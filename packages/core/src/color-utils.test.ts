import { describe, it, expect } from 'vitest';
import { ColorUtils } from './color-utils';

describe('ColorUtils', () => {
  describe('hexToRgb', () => {
    it('should convert hex to RGB', () => {
      const rgb = ColorUtils.hexToRgb('#7C3AED');
      expect(rgb).toEqual({ r: 124, g: 58, b: 237 });
    });

    it('should convert hex without #', () => {
      const rgb = ColorUtils.hexToRgb('7C3AED');
      expect(rgb).toEqual({ r: 124, g: 58, b: 237 });
    });

    it('should return null for invalid hex', () => {
      expect(ColorUtils.hexToRgb('invalid')).toBeNull();
      expect(ColorUtils.hexToRgb('#GG')).toBeNull();
    });
  });

  describe('rgbToHex', () => {
    it('should convert RGB to hex', () => {
      const hex = ColorUtils.rgbToHex(124, 58, 237);
      expect(hex).toBe('#7c3aed');
    });

    it('should handle edge cases', () => {
      expect(ColorUtils.rgbToHex(0, 0, 0)).toBe('#000000');
      expect(ColorUtils.rgbToHex(255, 255, 255)).toBe('#ffffff');
    });
  });

  describe('rgbToHsl', () => {
    it('should convert RGB to HSL', () => {
      const hsl = ColorUtils.rgbToHsl(124, 58, 237);
      expect(hsl.h).toBeGreaterThanOrEqual(0);
      expect(hsl.h).toBeLessThanOrEqual(360);
      expect(hsl.s).toBeGreaterThanOrEqual(0);
      expect(hsl.s).toBeLessThanOrEqual(100);
      expect(hsl.l).toBeGreaterThanOrEqual(0);
      expect(hsl.l).toBeLessThanOrEqual(100);
    });

    it('should handle grayscale', () => {
      const hsl = ColorUtils.rgbToHsl(128, 128, 128);
      expect(hsl.s).toBe(0);
    });
  });

  describe('lighten', () => {
    it('should lighten a color', () => {
      const lightened = ColorUtils.lighten('#000000', 50);
      const rgb = ColorUtils.hexToRgb(lightened);
      expect(rgb?.r).toBeGreaterThan(0);
      expect(rgb?.g).toBeGreaterThan(0);
      expect(rgb?.b).toBeGreaterThan(0);
    });

    it('should not exceed white', () => {
      const lightened = ColorUtils.lighten('#FFFFFF', 50);
      expect(lightened.toLowerCase()).toBe('#ffffff');
    });
  });

  describe('darken', () => {
    it('should darken a color', () => {
      const darkened = ColorUtils.darken('#FFFFFF', 50);
      const rgb = ColorUtils.hexToRgb(darkened);
      expect(rgb?.r).toBeLessThan(255);
      expect(rgb?.g).toBeLessThan(255);
      expect(rgb?.b).toBeLessThan(255);
    });

    it('should not go below black', () => {
      const darkened = ColorUtils.darken('#000000', 50);
      expect(darkened.toLowerCase()).toBe('#000000');
    });
  });

  describe('generateShades', () => {
    it('should generate shades', () => {
      const shades = ColorUtils.generateShades('#7C3AED', 5);
      expect(Object.keys(shades)).toHaveLength(5);
      expect(shades['0']).toBeTruthy();
      expect(shades['100']).toBeTruthy();
    });

    it('should generate correct number of shades', () => {
      const shades = ColorUtils.generateShades('#7C3AED', 10);
      expect(Object.keys(shades)).toHaveLength(10);
    });
  });

  describe('getContrastRatio', () => {
    it('should calculate contrast ratio', () => {
      const ratio = ColorUtils.getContrastRatio('#000000', '#FFFFFF');
      expect(ratio).toBe(21); // Perfect contrast
    });

    it('should return lower ratio for similar colors', () => {
      const ratio = ColorUtils.getContrastRatio('#FFFFFF', '#F0F0F0');
      expect(ratio).toBeLessThan(5);
    });
  });

  describe('isAccessible', () => {
    it('should return true for accessible colors', () => {
      expect(ColorUtils.isAccessible('#000000', '#FFFFFF', 'AA')).toBe(true);
      expect(ColorUtils.isAccessible('#000000', '#FFFFFF', 'AAA')).toBe(true);
    });

    it('should return false for inaccessible colors', () => {
      expect(ColorUtils.isAccessible('#FFFFFF', '#FFFFFF', 'AA')).toBe(false);
    });
  });

  describe('findAccessibleColor', () => {
    it('should find accessible color', () => {
      const accessible = ColorUtils.findAccessibleColor('#000000', '#FFFFFF', 'AA');
      expect(ColorUtils.isAccessible(accessible, '#FFFFFF', 'AA')).toBe(true);
    });
  });
});

