import type { DesignTokens } from '@tokiforge/core';

/**
 * Adobe XD integration for TokiForge
 */
export interface AdobeXDConfig {
  /**
   * XD document reference
   */
  document?: any;
  /**
   * XD plugin context (required for most operations)
   */
  pluginContext?: any;
}

/**
 * Adobe XD integration adapter
 */
export class AdobeXDAdapter {
  private config: AdobeXDConfig;

  constructor(config: AdobeXDConfig) {
    this.config = config;
  }

  async exportToXD(tokens: DesignTokens): Promise<void> {
    if (!this.config.pluginContext) {
      throw new Error('Adobe XD plugin context is required. This must be called from within an XD plugin.');
    }

    const colors = this.extractColors(tokens);
    
    for (const [path, color] of Object.entries(colors)) {
      await this.createXDColorSwatch(path, color);
    }
  }

  async importFromXD(): Promise<DesignTokens> {
    if (!this.config.pluginContext) {
      throw new Error('Adobe XD plugin context is required. This must be called from within an XD plugin.');
    }

    const tokens: DesignTokens = {
      color: {},
    };

    const swatches = this.config.pluginContext.document.swatches;
    
    for (const swatch of swatches) {
      const color = this.xdColorToHex(swatch.color);
      const tokenPath = this.swatchNameToTokenPath(swatch.name);
      this.setNestedValue(tokens, tokenPath, {
        value: color,
        type: 'color',
      });
    }

    return tokens;
  }

  private async createXDColorSwatch(_name: string, _color: string): Promise<void> {
    throw new Error('Adobe XD plugin API integration required');
  }

  /**
   * Extract colors from tokens
   */
  private extractColors(tokens: DesignTokens): Record<string, string> {
    const colors: Record<string, string> = {};

    const traverse = (obj: any, path: string = ''): void => {
      for (const key in obj) {
        const currentPath = path ? `${path}.${key}` : key;
        const value = obj[key];

        if (value && typeof value === 'object' && !Array.isArray(value)) {
          if ('value' in value) {
            const tokenValue = (value as any).value;
            if (typeof tokenValue === 'string' && tokenValue.startsWith('#')) {
              colors[currentPath] = tokenValue;
            }
          } else {
            traverse(value, currentPath);
          }
        }
      }
    };

    traverse(tokens);
    return colors;
  }

  /**
   * Convert XD color to hex
   */
  private xdColorToHex(color: { r: number; g: number; b: number; a?: number }): string {
    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);
    const b = Math.round(color.b * 255);
    return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
  }

  /**
   * Convert swatch name to token path
   */
  private swatchNameToTokenPath(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '');
  }

  /**
   * Set nested value in object
   */
  private setNestedValue(obj: DesignTokens, path: string, value: any): void {
    const parts = path.split('.');
    let current: any = obj;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!(part in current) || typeof current[part] !== 'object') {
        current[part] = {};
      }
      current = current[part];
    }

    current[parts[parts.length - 1]] = value;
  }
}

