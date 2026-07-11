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

  private async createSketchColorStyle(name: string, color: string): Promise<void> {
    const ctx = this.config.pluginContext;
    if (!ctx || !ctx.document) {
      throw new Error('Sketch plugin context with document is required');
    }

    const sharedStyles = ctx.document.sharedLayerStyles;
    if (!sharedStyles) {
      throw new Error('Sketch document does not have sharedLayerStyles');
    }

    const existing = sharedStyles.find((s: any) => s.name === name);
    if (existing) {
      if (existing.style) {
        existing.style.fills = [
          {
            fillType: 0,
            color: this.hexToSketchColor(color),
          },
        ];
      }
      return;
    }

    const newStyle: any = { fills: [] };
    newStyle.fills = [
      {
        fillType: 0,
        color: this.hexToSketchColor(color),
      },
    ];

    const sharedStyle: any = { name, style: newStyle };
    sharedStyles.push(sharedStyle);
  }

  private hexToSketchColor(hex: string): { red: number; green: number; blue: number; alpha: number } {
    const hexValue = hex.replace('#', '');
    const r = parseInt(hexValue.substring(0, 2), 16) / 255;
    const g = parseInt(hexValue.substring(2, 4), 16) / 255;
    const b = parseInt(hexValue.substring(4, 6), 16) / 255;
    return { red: r, green: g, blue: b, alpha: 1 };
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

