import type { DesignTokens, TokenValue } from '@tokiforge/core';
import axios from 'axios';
import type { AxiosInstance } from 'axios';

/**
 * Tokens Studio API configuration
 */
export interface TokensStudioConfig {
  /**
   * Personal access token from Tokens Studio
   */
  accessToken: string;
  /**
   * Base URL for Tokens Studio API (usually https://tokens.studio/api)
   */
  apiUrl?: string;
  /**
   * Project ID to sync from
   */
  projectId: string;
}

/**
 * Tokens Studio token set format
 */
export interface TokensStudioTokenSet {
  name: string;
  $metadata?: {
    tokenSetOrder?: string[];
  };
  [key: string]: any;
}

/**
 * Sync metadata for tracking changes
 */
export interface SyncMetadata {
  timestamp: number;
  source: 'local' | 'remote';
  version: string;
  hash: string;
}

/**
 * Bidirectional sync state
 */
export interface SyncState {
  lastSync: SyncMetadata;
  remoteVersion: string;
  localVersion: string;
  pendingChanges: {
    added: string[];
    modified: string[];
    deleted: string[];
  };
}

/**
 * Conflict information for resolution
 */
export interface ConflictInfo {
  path: string;
  local: TokenValue;
  remote: TokenValue;
  localModifiedAt: number;
  remoteModifiedAt: number;
  resolution?: 'local' | 'remote' | 'manual';
}

/**
 * Tokens Studio API client
 */
export class TokensStudioAPI {
  private api: AxiosInstance;
  private config: TokensStudioConfig;
  private syncState: Map<string, SyncState>;

  constructor(config: TokensStudioConfig) {
    this.config = config;
    this.syncState = new Map();
    
    const apiUrl = config.apiUrl || 'https://tokens.studio/api/v1';
    
    this.api = axios.create({
      baseURL: apiUrl,
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Fetch tokens from Tokens Studio
   */
  async fetchTokens(tokenSetId?: string): Promise<DesignTokens> {
    try {
      const response = await this.api.get(`/projects/${this.config.projectId}/token-sets`, {
        params: tokenSetId ? { id: tokenSetId } : {},
      });

      const tokenSets = response.data.data || response.data;
      return this.convertTokensStudioToDesignTokens(tokenSets);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to fetch tokens from Tokens Studio: ${message}`);
    }
  }

  /**
   * Push tokens to Tokens Studio
   */
  async pushTokens(tokens: DesignTokens, tokenSetId?: string): Promise<void> {
    try {
      const tokensStudioFormat = this.convertDesignTokensToTokensStudio(tokens);

      await this.api.post(`/projects/${this.config.projectId}/token-sets`, {
        data: tokensStudioFormat,
        ...(tokenSetId && { id: tokenSetId }),
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to push tokens to Tokens Studio: ${message}`);
    }
  }

  /**
   * Get sync status with conflict detection
   */
  async getSyncStatus(
    localTokens: DesignTokens,
    tokenSetId?: string
  ): Promise<{
    status: 'in-sync' | 'needs-pull' | 'needs-push' | 'conflicts';
    conflicts: ConflictInfo[];
    changes: {
      added: string[];
      modified: string[];
      deleted: string[];
    };
    lastSync?: SyncMetadata;
  }> {
    try {
      const remoteTokens = await this.fetchTokens(tokenSetId);
      const state = this.syncState.get(tokenSetId || 'default');

      const localPaths = this.getTokenPaths(localTokens);
      const remotePaths = this.getTokenPaths(remoteTokens);

      const added = remotePaths.filter(p => !localPaths.includes(p));
      const deleted = localPaths.filter(p => !remotePaths.includes(p));
      const conflicts: ConflictInfo[] = [];

      let status: 'in-sync' | 'needs-pull' | 'needs-push' | 'conflicts' = 'in-sync';

      // Check for modifications and conflicts
      for (const path of localPaths.filter(p => remotePaths.includes(p))) {
        const localValue = this.getTokenByPath(localTokens, path);
        const remoteValue = this.getTokenByPath(remoteTokens, path);

        if (JSON.stringify(localValue) !== JSON.stringify(remoteValue)) {
          const conflict: ConflictInfo = {
            path,
            local: localValue as TokenValue,
            remote: remoteValue as TokenValue,
            localModifiedAt: Date.now(),
            remoteModifiedAt: Date.now(),
          };
          conflicts.push(conflict);
          status = 'conflicts';
        }
      }

      if (added.length > 0 || deleted.length > 0) {
        status = status === 'conflicts' ? 'conflicts' : 'needs-pull';
      }

      return {
        status,
        conflicts,
        changes: { added, modified: conflicts.map(c => c.path), deleted },
        lastSync: state?.lastSync,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get sync status: ${message}`);
    }
  }

  /**
   * Perform bidirectional sync with conflict resolution
   */
  async bidirectionalSync(
    localTokens: DesignTokens,
    options?: {
      strategy?: 'local-wins' | 'remote-wins' | 'merge' | 'manual';
      onConflict?: (conflict: ConflictInfo) => 'local' | 'remote' | TokenValue;
      tokenSetId?: string;
    }
  ): Promise<{
    merged: DesignTokens;
    conflicts: ConflictInfo[];
    syncState: SyncState;
  }> {
    const strategy = options?.strategy || 'merge';
    const tokenSetId = options?.tokenSetId || 'default';
    const remoteTokens = await this.fetchTokens(tokenSetId);

    if (strategy === 'local-wins') {
      this.recordSync(tokenSetId, localTokens, 'local');
      return {
        merged: localTokens,
        conflicts: [],
        syncState: this.syncState.get(tokenSetId)!,
      };
    }

    if (strategy === 'remote-wins') {
      this.recordSync(tokenSetId, remoteTokens, 'remote');
      return {
        merged: remoteTokens,
        conflicts: [],
        syncState: this.syncState.get(tokenSetId)!,
      };
    }

    // Merge with conflict detection
    const merged = JSON.parse(JSON.stringify(localTokens));
    const conflicts: ConflictInfo[] = [];

    const mergeRecursive = (
      localObj: any,
      remoteObj: any,
      path: string[] = []
    ): void => {
      for (const [key, remoteValue] of Object.entries(remoteObj)) {
        const currentPath = [...path, key];
        const pathStr = currentPath.join('.');

        if (
          remoteValue &&
          typeof remoteValue === 'object' &&
          !Array.isArray(remoteValue)
        ) {
          if ('value' in remoteValue || '$value' in remoteValue) {
            // It's a token value
            const localValue = this.getTokenByPath(localObj, pathStr);

            if (localValue) {
              // Potential conflict
              const localVal = JSON.stringify(localValue);
              const remoteVal = JSON.stringify(remoteValue);

              if (localVal !== remoteVal) {
                const conflict: ConflictInfo = {
                  path: pathStr,
                  local: localValue as TokenValue,
                  remote: remoteValue as TokenValue,
                  localModifiedAt: Date.now(),
                  remoteModifiedAt: Date.now(),
                };

                if (options?.onConflict) {
                  const resolution = options.onConflict(conflict);
                  conflict.resolution = typeof resolution === 'string' ? resolution : 'manual';

                  if (resolution === 'local') {
                    // Keep local value
                  } else if (resolution === 'remote') {
                    this.setTokenByPath(merged, pathStr, remoteValue);
                  } else if (typeof resolution === 'object') {
                    this.setTokenByPath(merged, pathStr, resolution as TokenValue);
                  }
                } else if (strategy === 'manual') {
                  conflicts.push(conflict);
                } else {
                  // Default merge: remote wins in conflicts
                  this.setTokenByPath(merged, pathStr, remoteValue);
                }
              }
            } else {
              // No conflict, add remote
              this.setTokenByPath(merged, pathStr, remoteValue);
            }
          } else {
            // Nested object
            if (!localObj[key]) {
              localObj[key] = {};
            }
            mergeRecursive(localObj[key], remoteValue, currentPath);
          }
        }
      }
    };

    mergeRecursive(merged, remoteTokens);

    this.recordSync(tokenSetId, merged, 'local');

    return {
      merged,
      conflicts,
      syncState: this.syncState.get(tokenSetId)!,
    };
  }

  /**
   * Convert Tokens Studio format to DesignTokens
   */
  private convertTokensStudioToDesignTokens(
    tokenSets: TokensStudioTokenSet[] | Record<string, any>
  ): DesignTokens {
    const designTokens: DesignTokens = {};

    const processTokenSet = (tokenSet: any, prefix = ''): void => {
      for (const [key, value] of Object.entries(tokenSet)) {
        if (key.startsWith('$')) continue; // Skip metadata

        if (
          value &&
          typeof value === 'object' &&
          !Array.isArray(value) &&
          'value' in value
        ) {
          // It's a token
          const tokenType = (value as any).type;
          const category = this.tokenTypeToCategory(tokenType || 'string');
          if (!designTokens[category]) {
            designTokens[category] = {};
          }

          const tokenKey = prefix ? `${prefix}.${key}` : key;
          this.setNestedValue(designTokens, `${category}.${tokenKey}`, value);
        } else if (value && typeof value === 'object' && !Array.isArray(value)) {
          // Nested tokens
          const newPrefix = prefix ? `${prefix}.${key}` : key;
          processTokenSet(value, newPrefix);
        }
      }
    };

    if (Array.isArray(tokenSets)) {
      tokenSets.forEach(set => processTokenSet(set));
    } else {
      processTokenSet(tokenSets);
    }

    return designTokens;
  }

  /**
   * Convert DesignTokens to Tokens Studio format
   */
  private convertDesignTokensToTokensStudio(tokens: DesignTokens): Record<string, any> {
    const result: Record<string, any> = {};

    const traverse = (obj: DesignTokens, path: string[] = []): void => {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = [...path, key];

        if (value && typeof value === 'object' && !Array.isArray(value)) {
          if ('value' in value || '$value' in value) {
            // It's a token
            let current = result;
            for (const part of currentPath.slice(0, -1)) {
              if (!current[part]) {
                current[part] = {};
              }
              current = current[part];
            }
            current[currentPath[currentPath.length - 1]] = {
              value: (value as any).value || (value as any).$value,
              type: (value as any).type || 'string',
              description: (value as any).description,
            };
          } else {
            // Nested tokens
            traverse(value as DesignTokens, currentPath);
          }
        }
      }
    };

    traverse(tokens);
    return result;
  }

  /**
   * Map token type to category
   */
  private tokenTypeToCategory(
    type: string
  ): string {
    const typeMap: Record<string, string> = {
      'color': 'color',
      'dimension': 'spacing',
      'fontFamily': 'typography',
      'fontWeight': 'typography',
      'lineHeight': 'typography',
      'fontSize': 'typography',
      'duration': 'animation',
      'cubic-bezier': 'animation',
      'shadow': 'effects',
      'border': 'borders',
      'borderRadius': 'radius',
      'opacity': 'opacity',
      'sizing': 'sizing',
      'spacing': 'spacing',
      'string': 'other',
      'number': 'other',
      'boolean': 'other',
    };

    return typeMap[type] || 'other';
  }

  /**
   * Get all token paths
   */
  private getTokenPaths(tokens: DesignTokens, prefix = ''): string[] {
    const paths: string[] = [];

    const traverse = (obj: any, path: string): void => {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;

        if (value && typeof value === 'object' && !Array.isArray(value)) {
          if ('value' in value || '$value' in value) {
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
  private getTokenByPath(tokens: any, path: string): any {
    const parts = path.split('.');
    let current = tokens;

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
   * Set token by path
   */
  private setTokenByPath(tokens: any, path: string, value: any): void {
    const parts = path.split('.');
    let current = tokens;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part] || typeof current[part] !== 'object') {
        current[part] = {};
      }
      current = current[part];
    }

    current[parts[parts.length - 1]] = value;
  }

  /**
   * Set nested value
   */
  private setNestedValue(obj: any, path: string, value: any): void {
    const parts = path.split('.');
    let current = obj;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part] || typeof current[part] !== 'object') {
        current[part] = {};
      }
      current = current[part];
    }

    current[parts[parts.length - 1]] = value;
  }

  /**
   * Record sync state
   */
  private recordSync(tokenSetId: string, tokens: DesignTokens, source: 'local' | 'remote'): void {
    const hash = this.computeHash(JSON.stringify(tokens));
    const version = new Date().toISOString();

    this.syncState.set(tokenSetId, {
      lastSync: {
        timestamp: Date.now(),
        source,
        version,
        hash,
      },
      remoteVersion: version,
      localVersion: version,
      pendingChanges: {
        added: [],
        modified: [],
        deleted: [],
      },
    });
  }

  /**
   * Simple hash computation
   */
  private computeHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
  }
}

/**
 * Helper function to create API client and sync tokens
 */
export async function syncWithTokensStudio(
  config: TokensStudioConfig,
  localTokens: DesignTokens,
  options?: {
    strategy?: 'local-wins' | 'remote-wins' | 'merge' | 'manual';
    tokenSetId?: string;
  }
): Promise<DesignTokens> {
  const api = new TokensStudioAPI(config);
  const result = await api.bidirectionalSync(localTokens, options);
  return result.merged;
}
