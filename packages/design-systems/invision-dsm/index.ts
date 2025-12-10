import type { DesignTokens } from '@tokiforge/core';
import axios, { type AxiosInstance } from 'axios';

/**
 * InVision DSM integration for TokiForge
 */
export interface InVisionDSMConfig {
  /**
   * InVision DSM API token
   */
  apiToken: string;
  /**
   * InVision DSM space ID
   */
  spaceId: string;
  /**
   * Optional: Design system ID
   */
  designSystemId?: string;
}

/**
 * InVision DSM API client
 */
export class InVisionDSMAdapter {
  private api: AxiosInstance;
  private config: InVisionDSMConfig;

  constructor(config: InVisionDSMConfig) {
    this.config = config;
    this.api = axios.create({
      baseURL: 'https://api.invisionapp.com/dsm-api/v1',
      headers: {
        'Authorization': `Bearer ${config.apiToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Push tokens to InVision DSM
   */
  async pushTokens(tokens: DesignTokens): Promise<void> {
    try {
      const endpoint = this.config.designSystemId
        ? `/spaces/${this.config.spaceId}/design-systems/${this.config.designSystemId}/tokens`
        : `/spaces/${this.config.spaceId}/tokens`;

      await this.api.post(endpoint, {
        tokens: this.formatTokensForDSM(tokens),
      });
    } catch (error: any) {
      throw new Error(`Failed to push tokens to InVision DSM: ${error.message}`);
    }
  }

  /**
   * Fetch tokens from InVision DSM
   */
  async fetchTokens(): Promise<DesignTokens> {
    try {
      const endpoint = this.config.designSystemId
        ? `/spaces/${this.config.spaceId}/design-systems/${this.config.designSystemId}/tokens`
        : `/spaces/${this.config.spaceId}/tokens`;

      const response = await this.api.get(endpoint);
      return this.parseDSMTokens(response.data);
    } catch (error: any) {
      throw new Error(`Failed to fetch tokens from InVision DSM: ${error.message}`);
    }
  }

  /**
   * Sync tokens (push and pull)
   */
  async syncTokens(localTokens: DesignTokens, options?: {
    strategy?: 'local' | 'remote' | 'merge';
  }): Promise<DesignTokens> {
    const strategy = options?.strategy || 'local';

    if (strategy === 'local') {
      await this.pushTokens(localTokens);
      return localTokens;
    }

    if (strategy === 'remote') {
      return await this.fetchTokens();
    }

    // Merge strategy
    const remoteTokens = await this.fetchTokens();
    const merged = this.mergeTokens(localTokens, remoteTokens);
    await this.pushTokens(merged);
    return merged;
  }

  private formatTokensForDSM(tokens: DesignTokens): any {
    return {
      version: '1.0',
      tokens: this.flattenTokens(tokens),
    };
  }

  private parseDSMTokens(data: any): DesignTokens {
    if (data.tokens) {
      return this.unflattenTokens(data.tokens);
    }
    return {};
  }

  /**
   * Flatten tokens for API
   */
  private flattenTokens(tokens: DesignTokens, prefix: string = ''): Record<string, any> {
    const flattened: Record<string, any> = {};

    const traverse = (obj: any, path: string) => {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;

        if (value && typeof value === 'object' && !Array.isArray(value)) {
          if ('value' in value) {
            flattened[currentPath] = value;
          } else {
            traverse(value, currentPath);
          }
        }
      }
    };

    traverse(tokens, prefix);
    return flattened;
  }

  /**
   * Unflatten tokens from API
   */
  private unflattenTokens(flattened: Record<string, any>): DesignTokens {
    const tokens: DesignTokens = {};

    for (const [path, value] of Object.entries(flattened)) {
      const parts = path.split('.');
      let current: any = tokens;

      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!(part in current) || typeof current[part] !== 'object') {
          current[part] = {};
        }
        current = current[part];
      }

      current[parts[parts.length - 1]] = value;
    }

    return tokens;
  }

  /**
   * Merge tokens
   */
  private mergeTokens(local: DesignTokens, remote: DesignTokens): DesignTokens {
    const merged = { ...local };

    const mergeRecursive = (localObj: any, remoteObj: any): any => {
      for (const [key, remoteValue] of Object.entries(remoteObj)) {
        if (remoteValue && typeof remoteValue === 'object' && !Array.isArray(remoteValue)) {
          if ('value' in remoteValue) {
            // TokenValue - use remote if local doesn't exist
            if (!localObj[key] || typeof localObj[key] !== 'object' || !('value' in localObj[key])) {
              localObj[key] = remoteValue;
            }
          } else {
            // Nested tokens
            if (!localObj[key] || typeof localObj[key] !== 'object') {
              localObj[key] = {};
            }
            mergeRecursive(localObj[key], remoteValue);
          }
        }
      }
    };

    mergeRecursive(merged, remote);
    return merged;
  }
}

