import type { DesignTokens, TokenValue } from '@tokiforge/core';
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
      const stylesResponse = await this.api.get(`/files/${this.config.fileKey}/styles`);
      const styles = stylesResponse.data.meta.styles;

      const tokens: DesignTokens = {
        color: {},
      };

      for (const style of styles) {
        if (style.styleType === 'FILL') {
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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to pull tokens from Figma: ${message}`);
    }
  }

  /**
   * Push tokens to Figma
   */
  async pushTokens(tokensPath: string): Promise<void> {
    try {
      const tokens = TokenParser.parse(tokensPath, { expandReferences: true });
      
      const colors = this.extractColors(tokens);
      
      for (const [path, color] of Object.entries(colors)) {
        const styleName = this.tokenPathToStyleName(path);
        await this.createOrUpdateStyle(styleName, color);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to push tokens to Figma: ${message}`);
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

  private async createOrUpdateStyle(
    name: string,
    color: string,
    styleType: 'FILL' | 'TEXT' = 'FILL'
  ): Promise<void> {
    throw new Error(
      `Creating styles via API requires a Figma plugin context. ` +
      `Please use the Figma plugin for this feature. ` +
      `Style: ${name}, Color: ${color}, Type: ${styleType}`
    );
  }

  /**
   * Enhanced sync with conflict resolution
   */
  async syncWithConflictResolution(
    localTokens: DesignTokens,
    options?: {
      strategy?: 'local' | 'remote' | 'merge';
      onConflict?: (path: string, local: any, remote: any) => any;
    }
  ): Promise<DesignTokens> {
    const remoteTokens = await this.pullTokens();
    const strategy = options?.strategy || 'merge';

    if (strategy === 'local') {
      return localTokens;
    }

    if (strategy === 'remote') {
      return remoteTokens;
    }

    // Merge strategy
    return this.mergeTokens(localTokens, remoteTokens, options?.onConflict);
  }

  /**
   * Merge tokens with conflict resolution
   */
  private mergeTokens(
    local: DesignTokens,
    remote: DesignTokens,
    onConflict?: (path: string, local: any, remote: any) => any
  ): DesignTokens {
    const merged = { ...local };

    const mergeRecursive = (localObj: any, remoteObj: any, path: string[] = []): any => {
      for (const [key, remoteValue] of Object.entries(remoteObj)) {
        const currentPath = [...path, key];
        const pathStr = currentPath.join('.');

        if (remoteValue && typeof remoteValue === 'object' && !Array.isArray(remoteValue)) {
          if ('value' in remoteValue) {
            // It's a TokenValue
            const localValue = localObj[key];
            if (localValue && typeof localValue === 'object' && 'value' in localValue) {
              // Conflict - both have values
              if (onConflict) {
                merged[key] = onConflict(pathStr, localValue, remoteValue) as TokenValue;
              } else {
                // Default: use remote
                merged[key] = remoteValue as TokenValue;
              }
            } else {
              // No conflict, use remote
              merged[key] = remoteValue as TokenValue;
            }
          } else {
            // Nested tokens
            if (!localObj[key] || typeof localObj[key] !== 'object') {
              localObj[key] = {};
            }
            mergeRecursive(localObj[key], remoteValue, currentPath);
          }
        }
      }
    };

    mergeRecursive(merged, remote);
    return merged;
  }

  /**
   * Get sync status (what would change)
   */
  async getSyncStatus(localTokens: DesignTokens): Promise<{
    added: string[];
    modified: string[];
    removed: string[];
  }> {
    const remoteTokens = await this.pullTokens();
    
    const localPaths = this.getTokenPaths(localTokens);
    const remotePaths = this.getTokenPaths(remoteTokens);

    const added = remotePaths.filter(p => !localPaths.includes(p));
    const removed = localPaths.filter(p => !remotePaths.includes(p));
    const modified: string[] = [];

    for (const path of localPaths) {
      if (remotePaths.includes(path)) {
        const localValue = this.getTokenByPath(localTokens, path);
        const remoteValue = this.getTokenByPath(remoteTokens, path);
        if (JSON.stringify(localValue) !== JSON.stringify(remoteValue)) {
          modified.push(path);
        }
      }
    }

    return { added, modified, removed };
  }

  /**
   * Get all token paths
   */
  private getTokenPaths(tokens: DesignTokens, prefix: string = ''): string[] {
    const paths: string[] = [];

    const traverse = (obj: any, path: string) => {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;

        if (value && typeof value === 'object' && !Array.isArray(value)) {
          if ('value' in value) {
            paths.push(currentPath);
          } else {
            traverse(value, currentPath);
          }
        }
      }
    };

    traverse(tokens, prefix);
    return paths;
  }

  /**
   * Get token by path
   */
  private getTokenByPath(tokens: DesignTokens, path: string): any {
    const parts = path.split('.');
    let current: any = tokens;

    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return undefined;
      }
    }

    return current;
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
  private setNestedValue(obj: DesignTokens, path: string, value: TokenValue): void {
    const parts = path.split('.');
    let current: DesignTokens = obj;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      const partValue = current[part];
      if (!partValue || typeof partValue !== 'object' || Array.isArray(partValue) || 'value' in partValue) {
        current[part] = {} as DesignTokens;
      }
      const nextValue = current[part];
      if (typeof nextValue === 'object' && nextValue !== null && !Array.isArray(nextValue) && !('value' in nextValue)) {
        current = nextValue as DesignTokens;
      } else {
        current[part] = {} as DesignTokens;
        current = current[part] as DesignTokens;
      }
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

