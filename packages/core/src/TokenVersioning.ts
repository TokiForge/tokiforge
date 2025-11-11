import type { DesignTokens, TokenValue, TokenVersion } from './types';

interface VersionInfo {
  path: string;
  version: TokenVersion;
  token: TokenValue;
}

interface MigrationResult {
  success: boolean;
  tokens: DesignTokens;
  message: string;
}

interface VersionValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class TokenVersioning {
  static getDeprecatedTokens(tokens: DesignTokens): Array<{ path: string; token: TokenValue; version: TokenVersion }> {
    const deprecated: Array<{ path: string; token: TokenValue; version: TokenVersion }> = [];
    
    this.collectDeprecatedTokens(tokens, '', deprecated);
    
    return deprecated;
  }

  static getVersionHistory(tokens: DesignTokens): Map<string, TokenVersion> {
    const history = new Map<string, TokenVersion>();
    
    this.collectVersionHistory(tokens, '', history);
    
    return history;
  }

  static filterDeprecated(tokens: DesignTokens, includeDeprecated: boolean = false): DesignTokens {
    if (includeDeprecated) {
      return tokens;
    }

    const filtered = JSON.parse(JSON.stringify(tokens)) as DesignTokens;
    this.removeDeprecatedTokens(filtered);
    return filtered;
  }

  static migrateToken(tokens: DesignTokens, oldPath: string, newPath: string): MigrationResult {
    try {
      const migrated = JSON.parse(JSON.stringify(tokens)) as DesignTokens;
      
      const oldValue = this.getTokenByPath(migrated, oldPath);
      if (!oldValue) {
        return {
          success: false,
          tokens: migrated,
          message: `Token at path "${oldPath}" not found`,
        };
      }

      this.setTokenByPath(migrated, newPath, oldValue);
      this.removeTokenByPath(migrated, oldPath);

      return {
        success: true,
        tokens: migrated,
        message: `Successfully migrated token from "${oldPath}" to "${newPath}"`,
      };
    } catch (error) {
      return {
        success: false,
        tokens,
        message: `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  static validateVersion(tokens: DesignTokens, minVersion?: string): VersionValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!minVersion) {
      return { valid: true, errors, warnings };
    }

    const versionHistory = this.getVersionHistory(tokens);
    
    for (const [path, version] of versionHistory.entries()) {
      if (version.deprecated) {
        warnings.push(`Token "${path}" is deprecated${version.replacedBy ? `, replaced by "${version.replacedBy}"` : ''}`);
      }

      if (version.removed) {
        errors.push(`Token "${path}" has been removed`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private static collectDeprecatedTokens(
    tokens: DesignTokens,
    path: string,
    result: Array<{ path: string; token: TokenValue; version: TokenVersion }>
  ): void {
    for (const [key, value] of Object.entries(tokens)) {
      const currentPath = path ? `${path}.${key}` : key;

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        const token = value as TokenValue;
        if (token.version?.deprecated || token.deprecated) {
          const version: TokenVersion = token.version || { version: '1.0.0', deprecated: token.deprecated ? 'true' : undefined };
          result.push({
            path: currentPath,
            token,
            version,
          });
        } else {
          this.collectDeprecatedTokens(value as DesignTokens, currentPath, result);
        }
      }
    }
  }

  private static collectVersionHistory(tokens: DesignTokens, path: string, result: Map<string, TokenVersion>): void {
    for (const [key, value] of Object.entries(tokens)) {
      const currentPath = path ? `${path}.${key}` : key;

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        const token = value as TokenValue;
        if (token.version) {
          result.set(currentPath, token.version);
        } else {
          this.collectVersionHistory(value as DesignTokens, currentPath, result);
        }
      }
    }
  }

  private static removeDeprecatedTokens(tokens: DesignTokens): void {
    for (const [key, value] of Object.entries(tokens)) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        const token = value as TokenValue;
        if (token.deprecated || token.version?.deprecated) {
          delete tokens[key];
        } else {
          this.removeDeprecatedTokens(value as DesignTokens);
        }
      }
    }
  }

  private static getTokenByPath(tokens: DesignTokens, path: string): TokenValue | null {
    const parts = path.split('.');
    let current: unknown = tokens;

    for (const part of parts) {
      if (current && typeof current === 'object' && !Array.isArray(current) && part in current) {
        current = (current as DesignTokens)[part];
      } else {
        return null;
      }
    }

    return (current as TokenValue) || null;
  }

  private static setTokenByPath(tokens: DesignTokens, path: string, value: TokenValue): void {
    const parts = path.split('.');
    let current: DesignTokens = tokens;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!(part in current)) {
        current[part] = {};
      }
      current = current[part] as DesignTokens;
    }

    current[parts[parts.length - 1]] = value;
  }

  private static removeTokenByPath(tokens: DesignTokens, path: string): void {
    const parts = path.split('.');
    let current: DesignTokens = tokens;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (current && typeof current === 'object' && !Array.isArray(current) && part in current) {
        current = current[part] as DesignTokens;
      } else {
        return;
      }
    }

    delete current[parts[parts.length - 1]];
  }
}

