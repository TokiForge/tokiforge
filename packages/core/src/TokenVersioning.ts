import type { DesignTokens, TokenValue, TokenVersion } from './types';

export interface DeprecationWarning {
  path: string;
  token: TokenValue;
  version: TokenVersion;
  message: string;
  replacement?: string;
}

export class TokenVersioning {
  static getDeprecatedTokens(tokens: DesignTokens): DeprecationWarning[] {
    const warnings: DeprecationWarning[] = [];

    const traverse = (obj: DesignTokens, path: string = ''): void => {
      for (const key in obj) {
        const currentPath = path ? `${path}.${key}` : key;
        const value = obj[key];

        if (value && typeof value === 'object' && !Array.isArray(value)) {
          if (this.isTokenValue(value)) {
            const token = value as TokenValue;
            if (token.deprecated || token.version?.deprecated) {
              warnings.push({
                path: currentPath,
                token,
                version: token.version || { version: 'unknown' },
                message: this.getDeprecationMessage(token, currentPath),
                replacement: token.version?.replacedBy,
              });
            }
          } else {
            traverse(value as DesignTokens, currentPath);
          }
        }
      }
    };

    traverse(tokens);
    return warnings;
  }

  static getVersionHistory(tokens: DesignTokens): Map<string, TokenVersion> {
    const versions = new Map<string, TokenVersion>();

    const traverse = (obj: DesignTokens, path: string = ''): void => {
      for (const key in obj) {
        const currentPath = path ? `${path}.${key}` : key;
        const value = obj[key];

        if (value && typeof value === 'object' && !Array.isArray(value)) {
          if (this.isTokenValue(value)) {
            const token = value as TokenValue;
            if (token.version) {
              versions.set(currentPath, token.version);
            }
          } else {
            traverse(value as DesignTokens, currentPath);
          }
        }
      }
    };

    traverse(tokens);
    return versions;
  }

  static filterDeprecated(tokens: DesignTokens, includeDeprecated: boolean = false): DesignTokens {
    if (includeDeprecated) {
      return tokens;
    }

    const filtered: DesignTokens = {};

    const traverse = (obj: DesignTokens, target: DesignTokens): void => {
      for (const key in obj) {
        const value = obj[key];

        if (value && typeof value === 'object' && !Array.isArray(value)) {
          if (this.isTokenValue(value)) {
            const token = value as TokenValue;
            if (!token.deprecated && !token.version?.deprecated) {
              target[key] = value;
            }
          } else {
            target[key] = {};
            traverse(value as DesignTokens, target[key] as DesignTokens);
          }
        }
      }
    };

    traverse(tokens, filtered);
    return filtered;
  }

  static migrateToken(
    tokens: DesignTokens,
    oldPath: string,
    newPath: string
  ): { success: boolean; tokens: DesignTokens; message: string } {
    try {
      const oldValue = this.getTokenByPath(tokens, oldPath);
      if (!oldValue) {
        return {
          success: false,
          tokens,
          message: `Token not found at path: ${oldPath}`,
        };
      }

      const migrated = this.setTokenByPath(tokens, newPath, oldValue);
      const deprecated = this.setTokenByPath(migrated, oldPath, {
        ...oldValue,
        deprecated: true,
        version: {
          version: oldValue.version?.version || '1.0.0',
          deprecated: new Date().toISOString(),
          replacedBy: newPath,
        },
      } as TokenValue);

      return {
        success: true,
        tokens: deprecated,
        message: `Token migrated from ${oldPath} to ${newPath}`,
      };
    } catch (error: any) {
      return {
        success: false,
        tokens,
        message: error.message,
      };
    }
  }

  static validateVersion(tokens: DesignTokens, minVersion?: string): {
    valid: boolean;
    errors: string[];
    warnings: DeprecationWarning[];
  } {
    const errors: string[] = [];
    const warnings = this.getDeprecatedTokens(tokens);

    if (minVersion) {
      const versions = this.getVersionHistory(tokens);
      for (const [path, version] of versions.entries()) {
        if (this.compareVersions(version.version, minVersion) < 0) {
          errors.push(`Token at ${path} has version ${version.version}, but minimum required is ${minVersion}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private static getDeprecationMessage(token: TokenValue, path: string): string {
    if (token.version?.deprecated) {
      const replacement = token.version.replacedBy
        ? ` Use ${token.version.replacedBy} instead.`
        : '';
      const migration = token.version.migration ? ` ${token.version.migration}` : '';
      return `Token "${path}" is deprecated since ${token.version.deprecated}.${replacement}${migration}`;
    }
    return `Token "${path}" is deprecated.`;
  }

  private static isTokenValue(value: any): value is TokenValue {
    return (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      ('value' in value || '$value' in value || '$alias' in value || 'version' in value || 'deprecated' in value)
    );
  }

  private static getTokenByPath(tokens: DesignTokens, path: string): TokenValue | null {
    const parts = path.split('.');
    let current: any = tokens;

    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return null;
      }
    }

    return this.isTokenValue(current) ? (current as TokenValue) : null;
  }

  private static setTokenByPath(tokens: DesignTokens, path: string, value: TokenValue): DesignTokens {
    const parts = path.split('.');
    const result = JSON.parse(JSON.stringify(tokens));
    let current: any = result;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }

    current[parts[parts.length - 1]] = value;
    return result;
  }

  private static compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;

      if (part1 < part2) return -1;
      if (part1 > part2) return 1;
    }

    return 0;
  }
}

