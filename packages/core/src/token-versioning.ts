import type {
  DesignTokens,
  MigrationResult,
  VersionValidationResult,
  TokenValue,
} from './types';

type TokenNode = Record<string, unknown>;

export class TokenVersioning {
  static getDeprecatedTokens(tokens: DesignTokens): string[] {
    const deprecated: string[] = [];

    const checkTokens = (obj: unknown, path = ''): void => {
      if (typeof obj !== 'object' || obj === null) {
        return;
      }

      if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
          checkTokens(obj[i], `${path}[${i}]`);
        }
        return;
      }

      const node = obj as TokenNode;
      if ('value' in node) {
        const token = node as unknown as TokenValue;
        if (token.deprecated === true || token.version?.deprecated === true) {
          deprecated.push(path || 'root');
        }
      } else {
        for (const key of Object.keys(node)) {
          const newPath = path ? `${path}.${key}` : key;
          checkTokens(node[key], newPath);
        }
      }
    };

    checkTokens(tokens);
    return deprecated;
  }

  static filterDeprecated(tokens: DesignTokens, includeDeprecated = false): DesignTokens {
    const cloned = JSON.parse(JSON.stringify(tokens)) as DesignTokens;

    const filterTokens = (obj: unknown): unknown => {
      if (typeof obj !== 'object' || obj === null) {
        return obj;
      }

      if (Array.isArray(obj)) {
        return obj.map(filterTokens).filter((item) => item !== null);
      }

      const node = obj as TokenNode;
      if ('value' in node) {
        const token = node as unknown as TokenValue;
        if (token.deprecated === true || token.version?.deprecated === true) {
          return includeDeprecated ? obj : null;
        }
        return obj;
      }

      const filteredObj: TokenNode = {};
      for (const key of Object.keys(node)) {
        const filteredValue = filterTokens(node[key]);
        if (filteredValue !== null) {
          filteredObj[key] = filteredValue;
        }
      }
      return filteredObj;
    };

    return filterTokens(cloned) as DesignTokens;
  }

  static migrateToken(tokens: DesignTokens, oldPath: string, newPath: string): MigrationResult {
    const errors: string[] = [];
    let migrated = 0;

    try {
      const cloned = JSON.parse(JSON.stringify(tokens)) as DesignTokens;
      
      // Get value at old path
      const getValue = (obj: TokenNode, path: string): unknown => {
        const parts = path.split('.');
        let current: unknown = obj;
        for (const part of parts) {
          if (current && typeof current === 'object' && part in (current as TokenNode)) {
            current = (current as TokenNode)[part];
          } else {
            return undefined;
          }
        }
        return current;
      };

      // Set value at new path
      const setValue = (obj: TokenNode, path: string, value: unknown): void => {
        const parts = path.split('.');
        let current = obj;
        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i];
          if (!current[part] || typeof current[part] !== 'object') {
            current[part] = {};
          }
          current = current[part] as TokenNode;
        }
        current[parts[parts.length - 1]] = value;
      };

      // Delete value at old path
      const deleteValue = (obj: TokenNode, path: string): void => {
        const parts = path.split('.');
        let current: unknown = obj;
        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i];
          if (current && typeof current === 'object' && part in (current as TokenNode)) {
            current = (current as TokenNode)[part];
          } else {
            return;
          }
        }
        if (current && typeof current === 'object') {
          delete (current as TokenNode)[parts[parts.length - 1]];
        }
      };

      const clonedNode = cloned as unknown as TokenNode;
      const oldValue = getValue(clonedNode, oldPath);
      if (oldValue === undefined) {
        errors.push(`Token not found at path: ${oldPath}`);
      } else {
        setValue(clonedNode, newPath, oldValue);
        deleteValue(clonedNode, oldPath);
        migrated = 1;
      }

      return {
        success: errors.length === 0,
        migrated,
        errors,
      };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
      return {
        success: false,
        migrated: 0,
        errors,
      };
    }
  }

  static validateVersions(tokens: DesignTokens): VersionValidationResult {
    const deprecated = this.getDeprecatedTokens(tokens);
    const migrations: MigrationResult[] = [];

    // Check for migration paths
    const checkMigrations = (obj: unknown, path = ''): void => {
      if (typeof obj !== 'object' || obj === null) {
        return;
      }

      if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
          checkMigrations(obj[i], `${path}[${i}]`);
        }
        return;
      }

      const node = obj as TokenNode;
      if ('value' in node) {
        const token = node as unknown as TokenValue;
        if (token.version?.migration) {
          migrations.push({
            success: false,
            migrated: 0,
            errors: [`Migration required for ${path}: ${token.version.migration}`],
          });
        }
      } else {
        for (const key of Object.keys(node)) {
          const newPath = path ? `${path}.${key}` : key;
          checkMigrations(node[key], newPath);
        }
      }
    };

    checkMigrations(tokens);

    return {
      valid: deprecated.length === 0 && migrations.length === 0,
      deprecated,
      migrations,
    };
  }
}
