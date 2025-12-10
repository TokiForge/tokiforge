import type { DesignTokens } from '@tokiforge/core';

/**
 * Sketch integration for TokiForge
 */
export interface SketchConfig {
  /**
   * Sketch document path or ID
   */
  documentPath?: string;
  /**
   * Sketch plugin context (required for most operations)
   */
  pluginContext?: any;
}

/**
 * Sketch integration adapter
 */
export class SketchAdapter {
  private config: SketchConfig;

  constructor(config: SketchConfig) {
    this.config = config;
  }

  async exportToSketch(tokens: DesignTokens): Promise<void> {
    if (!this.config.pluginContext) {
      throw new Error('Sketch plugin context is required. This must be called from within a Sketch plugin.');
    }

    const colors = this.extractColors(tokens);
    
    for (const [path, color] of Object.entries(colors)) {
      await this.createSketchColorStyle(path, color);
    }
  }

  async importFromSketch(): Promise<DesignTokens> {
    if (!this.config.pluginContext) {
      throw new Error('Sketch plugin context is required. This must be called from within a Sketch plugin.');
    }

    const tokens: DesignTokens = {
      color: {},
    };

    const sharedStyles = this.config.pluginContext.document.sharedLayerStyles;
    const sharedTextStyles = this.config.pluginContext.document.sharedTextStyles;

    for (const style of sharedStyles) {
      if (style.style && style.style.fills && style.style.fills.length > 0) {
        const fill = style.style.fills[0];
        if (fill.color) {
          const color = this.sketchColorToHex(fill.color);
          const tokenPath = this.styleNameToTokenPath(style.name);
          this.setNestedValue(tokens, tokenPath, {
            value: color,
            type: 'color',
          });
        }
      }
    }

    return tokens;
  }

  private async createSketchColorStyle(_name: string, _color: string): Promise<void> {
    throw new Error('Sketch plugin API integration required');
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
   * Convert Sketch color to hex
   */
  private sketchColorToHex(color: { red: number; green: number; blue: number; alpha?: number }): string {
    const r = Math.round(color.red * 255);
    const g = Math.round(color.green * 255);
    const b = Math.round(color.blue * 255);
    return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
  }

  /**
   * Convert style name to token path
   */
  private styleNameToTokenPath(name: string): string {
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

