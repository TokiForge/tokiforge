import type { DesignTokens } from '@tokiforge/core';
import { TokenParser } from '@tokiforge/core';
import axios from 'axios';
import type { AxiosInstance } from 'axios';

export interface FigmaConfig {
  /**
   * Figma Personal Access Token
   */
  accessToken: string;
  /**
   * Figma File Key
   */
  fileKey: string;
  /**
   * Optional: Node ID to sync from/to
   */
  nodeId?: string;
}

export interface FigmaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface FigmaStyle {
  key: string;
  name: string;
  description?: string;
  styleType: 'FILL' | 'TEXT' | 'EFFECT' | 'GRID';
}

/**
 * Figma API client for syncing design tokens
 */
export class FigmaSync {
  private api: AxiosInstance;
  private config: FigmaConfig;

  constructor(config: FigmaConfig) {
    this.config = config;
    this.api = axios.create({
      baseURL: 'https://api.figma.com/v1',
      headers: {
        'X-Figma-Token': config.accessToken,
      },
    });
  }

  /**
   * Pull tokens from Figma
   */
  async pullTokens(): Promise<DesignTokens> {
    try {
      // Extract colors from styles
      const stylesResponse = await this.api.get(`/files/${this.config.fileKey}/styles`);
      const styles = stylesResponse.data.meta.styles;

      const tokens: DesignTokens = {
        color: {},
      };

      // Convert Figma styles to tokens
      for (const style of styles) {
        if (style.styleType === 'FILL') {
          // Get style details
          const styleDetails = await this.getStyleDetails(style.key);
          if (styleDetails && styleDetails.fills && styleDetails.fills[0]) {
            const fill = styleDetails.fills[0];
            if (fill.type === 'SOLID' && fill.color) {
              const color = this.figmaColorToHex(fill.color);
              const tokenName = this.styleNameToTokenPath(style.name);
              this.setNestedValue(tokens, tokenName, {
                value: color,
                type: 'color',
                description: style.description,
              });
            }
          }
        }
      }

      return tokens;
    } catch (error: any) {
      throw new Error(`Failed to pull tokens from Figma: ${error.message}`);
    }
  }

  /**
   * Push tokens to Figma
   */
  async pushTokens(tokensPath: string): Promise<void> {
    try {
      const tokens = TokenParser.parse(tokensPath, { expandReferences: true });
      
      // Extract colors from tokens
      const colors = this.extractColors(tokens);
      
      // Create/update Figma styles
      for (const [path, color] of Object.entries(colors)) {
        const styleName = this.tokenPathToStyleName(path);
        await this.createOrUpdateStyle(styleName, color);
      }
    } catch (error: any) {
      throw new Error(`Failed to push tokens to Figma: ${error.message}`);
    }
  }

  /**
   * Get style details from Figma
   */
  private async getStyleDetails(styleKey: string): Promise<any> {
    try {
      const response = await this.api.get(`/styles/${styleKey}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  /**
   * Create or update a Figma style
   */
  private async createOrUpdateStyle(
    name: string,
    color: string
  ): Promise<void> {
    // Creating styles via Figma API requires plugin context
    // This functionality is limited by Figma API restrictions
    throw new Error('Creating styles via API requires a Figma plugin context. Please use the Figma plugin for this feature.');
  }

  /**
   * Convert Figma color to hex
   */
  private figmaColorToHex(color: FigmaColor): string {
    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);
    const b = Math.round(color.b * 255);
    return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
  }


  /**
   * Extract colors from tokens
   */
  private extractColors(tokens: DesignTokens): Record<string, string> {
    const colors: Record<string, string> = {};

    const traverse = (obj: DesignTokens, path: string = ''): void => {
      for (const key in obj) {
        const currentPath = path ? `${path}.${key}` : key;
        const value = obj[key];

        if (value && typeof value === 'object' && !Array.isArray(value)) {
          if ('value' in value || '$value' in value) {
            const token = value as any;
            const tokenValue = 'value' in token ? token.value : ('$value' in token ? token.$value : null);
            if (typeof tokenValue === 'string' && tokenValue.startsWith('#')) {
              colors[currentPath] = tokenValue;
            }
          } else {
            traverse(value as DesignTokens, currentPath);
          }
        }
      }
    };

    traverse(tokens);
    return colors;
  }

  /**
   * Convert style name to token path
   */
  private styleNameToTokenPath(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '');
  }

  /**
   * Convert token path to style name
   */
  private tokenPathToStyleName(path: string): string {
    return path
      .split('.')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  /**
   * Set nested value in object
   */
  private setNestedValue(obj: any, path: string, value: any): void {
    const parts = path.split('.');
    let current = obj;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }

    current[parts[parts.length - 1]] = value;
  }
}

/**
 * Pull tokens from Figma
 */
export async function pullFromFigma(config: FigmaConfig): Promise<DesignTokens> {
  const sync = new FigmaSync(config);
  return sync.pullTokens();
}

/**
 * Push tokens to Figma
 */
export async function pushToFigma(tokensPath: string, config: FigmaConfig): Promise<void> {
  const sync = new FigmaSync(config);
  return sync.pushTokens(tokensPath);
}

