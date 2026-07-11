import { describe, it, expect, vi } from 'vitest';
import { SketchAdapter, AdobeXDAdapter } from '../../index';
import type { DesignTokens } from '@tokiforge/core';

const mockTokens: DesignTokens = {
  color: {
    primary: { value: '#7C3AED', type: 'color' },
    background: { value: '#FFFFFF', type: 'color' },
  },
};

describe('SketchAdapter', () => {
  it('should create instance with config', () => {
    const adapter = new SketchAdapter({});
    expect(adapter).toBeDefined();
    expect(typeof adapter.exportToSketch).toBe('function');
    expect(typeof adapter.importFromSketch).toBe('function');
  });

  it('should throw on exportToSketch without pluginContext', async () => {
    const adapter = new SketchAdapter({});
    await expect(adapter.exportToSketch(mockTokens)).rejects.toThrow(
      'Sketch plugin context is required'
    );
  });

  it('should throw on importFromSketch without pluginContext', async () => {
    const adapter = new SketchAdapter({});
    await expect(adapter.importFromSketch()).rejects.toThrow(
      'Sketch plugin context is required'
    );
  });

  it('should import tokens from Sketch shared styles', async () => {
    const mockSharedStyles = [
      {
        name: 'color.primary',
        style: {
          fills: [
            {
              color: { red: 0.486, green: 0.227, blue: 0.929, alpha: 1 },
            },
          ],
        },
      },
    ];

    const mockContext = {
      document: {
        sharedLayerStyles: mockSharedStyles,
        sharedTextStyles: [],
      },
    };

    const adapter = new SketchAdapter({ pluginContext: mockContext });
    const tokens = await adapter.importFromSketch();

    expect(tokens.color).toBeDefined();
    expect(tokens.color).toHaveProperty('primary');
  });

});

describe('AdobeXDAdapter', () => {
  it('should create instance with config', () => {
    const adapter = new AdobeXDAdapter({});
    expect(adapter).toBeDefined();
    expect(typeof adapter.exportToXD).toBe('function');
    expect(typeof adapter.importFromXD).toBe('function');
  });

  it('should throw on exportToXD without pluginContext', async () => {
    const adapter = new AdobeXDAdapter({});
    await expect(adapter.exportToXD(mockTokens)).rejects.toThrow(
      'Adobe XD plugin context is required'
    );
  });

  it('should throw on importFromXD without pluginContext', async () => {
    const adapter = new AdobeXDAdapter({});
    await expect(adapter.importFromXD()).rejects.toThrow(
      'Adobe XD plugin context is required'
    );
  });

  it('should import tokens from XD swatches', async () => {
    const mockSwatches = [
      {
        name: 'color.primary',
        color: { r: 0.486, g: 0.227, b: 0.929, a: 1 },
      },
    ];

    const mockContext = {
      document: {
        swatches: mockSwatches,
      },
    };

    const adapter = new AdobeXDAdapter({ pluginContext: mockContext });
    const tokens = await adapter.importFromXD();

    expect(tokens.color).toBeDefined();
    expect(tokens.color).toHaveProperty('primary');
  });
});
