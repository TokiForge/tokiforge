import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';
import type { DesignTokens, TokenParserOptions, TokenValue } from './types';

export class TokenParser {
  static parse(filePath: string, options: TokenParserOptions = {}): DesignTokens {
    const content = fs.readFileSync(filePath, 'utf-8');
    const ext = path.extname(filePath).toLowerCase();
    let tokens: DesignTokens;

    if (ext === '.yaml' || ext === '.yml') {
      tokens = yaml.parse(content);
    } else {
      tokens = JSON.parse(content);
    }

    if (options.validate !== false) {
      this.validate(tokens);
    }

    if (options.expandReferences !== false) {
      tokens = this.expandReferences(tokens);
    }

    return tokens;
  }

  static validate(tokens: DesignTokens): void {
    const validateRecursive = (obj: DesignTokens, path: string = ''): void => {
      if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
        return;
      }

      const isToken = 'value' in obj || '$value' in obj || '$alias' in obj;
      
      if (isToken) {
        if ('value' in obj && obj.value !== undefined) {
          if (typeof obj.value !== 'string' && typeof obj.value !== 'number') {
            throw new Error(`Invalid token value at ${path}: must be string or number`);
          }
        } else if ('$value' in obj && obj.$value !== undefined) {
          if (typeof obj.$value !== 'string' && typeof obj.$value !== 'number') {
            throw new Error(`Invalid token $value at ${path}: must be string or number`);
          }
        }
        
        if ('$alias' in obj && obj.$alias) {
          const alias = String(obj.$alias);
          if (!alias.startsWith('{') || !alias.endsWith('}')) {
            throw new Error(`Invalid $alias format at ${path}: must be in format "{token.path}"`);
          }
        }
      } else {
        for (const key in obj) {
          validateRecursive(obj[key] as DesignTokens, path ? `${path}.${key}` : key);
        }
      }
    };

    validateRecursive(tokens);
  }
  
  /**
   * Extract all semantic tokens from a token tree
   */
  static extractSemanticTokens(tokens: DesignTokens): Array<{ path: string; token: TokenValue }> {
    const semantic: Array<{ path: string; token: TokenValue }> = [];
    
    const traverse = (obj: DesignTokens, path: string = ''): void => {
      for (const key in obj) {
        const currentPath = path ? `${path}.${key}` : key;
        const value = obj[key];
        
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          if ('value' in value || '$value' in value || '$alias' in value) {
            const token = value as TokenValue;
            if (token.semantic?.category === 'semantic' || token.$alias) {
              semantic.push({ path: currentPath, token });
            }
          } else {
            traverse(value as DesignTokens, currentPath);
          }
        }
      }
    };
    
    traverse(tokens);
    return semantic;
  }
  
  /**
   * Validate all token aliases are valid
   */
  static validateAliases(tokens: DesignTokens): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const allPaths = new Set<string>();
    
    // Collect all token paths
    const collectPaths = (obj: DesignTokens, path: string = ''): void => {
      for (const key in obj) {
        const currentPath = path ? `${path}.${key}` : key;
        const value = obj[key];
        
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          if ('value' in value || '$value' in value || '$alias' in value) {
            allPaths.add(currentPath);
          } else {
            collectPaths(value as DesignTokens, currentPath);
          }
        }
      }
    };
    
    collectPaths(tokens);
    
    // Validate all aliases
    const validateAlias = (obj: DesignTokens, path: string = ''): void => {
      for (const key in obj) {
        const currentPath = path ? `${path}.${key}` : key;
        const value = obj[key];
        
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          if ('$alias' in value && value.$alias) {
            const aliasPath = String(value.$alias).slice(1, -1); // Remove { }
            if (!allPaths.has(aliasPath)) {
              errors.push(`Alias at ${currentPath} references non-existent token: ${aliasPath}`);
            }
          } else {
            validateAlias(value as DesignTokens, currentPath);
          }
        }
      }
    };
    
    validateAlias(tokens);
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  static expandReferences(tokens: DesignTokens): DesignTokens {
    const resolveReference = (ref: string, root: DesignTokens): string | number => {
      if (typeof ref !== 'string' || !ref.startsWith('{') || !ref.endsWith('}')) {
        return ref;
      }

      const path = ref.slice(1, -1);
      const parts = path.split('.');
      let current: any = root;

      for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
          current = current[part];
        } else {
          throw new Error(`Token reference not found: ${path}`);
        }
      }

      if (current && typeof current === 'object') {
        const tokenValue = 'value' in current ? current.value : ('$value' in current ? current.$value : null);
        
        if ('$alias' in current && current.$alias) {
          return resolveReference(current.$alias, root) as string;
        }
        
        if (tokenValue !== null) {
          if (typeof tokenValue === 'string' && tokenValue.startsWith('{')) {
            return resolveReference(tokenValue, root) as string;
          }
          return tokenValue;
        }
      }

      throw new Error(`Invalid token reference: ${path}`);
    };

    const isTokenValue = (obj: any): obj is TokenValue => {
      return obj && typeof obj === 'object' && !Array.isArray(obj) && 
             ('value' in obj || '$value' in obj || '$alias' in obj);
    };

    const expandRecursive = (obj: DesignTokens): DesignTokens => {
      if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
        if (isTokenValue(obj)) {
          if ('$alias' in obj && obj.$alias) {
            const resolvedValue = resolveReference(String(obj.$alias), tokens);
            return {
              ...obj,
              value: resolvedValue,
              $alias: undefined,
            } as unknown as DesignTokens;
          }
          
          if ('$value' in obj && obj.$value) {
            const valueToResolve = typeof obj.$value === 'string' && obj.$value.startsWith('{') 
              ? obj.$value 
              : String(obj.$value);
            const resolvedValue = resolveReference(valueToResolve, tokens);
            return {
              ...obj,
              value: resolvedValue,
              $value: undefined,
            } as unknown as DesignTokens;
          }
          
          if ('value' in obj && obj.value) {
            const valueToResolve = typeof obj.value === 'string' && obj.value.startsWith('{')
              ? obj.value
              : String(obj.value);
            const resolvedValue = resolveReference(valueToResolve, tokens);
            return {
              ...obj,
              value: resolvedValue,
            } as unknown as DesignTokens;
          }
        }

        const expanded: DesignTokens = {};
        for (const key in obj) {
          expanded[key] = expandRecursive(obj[key] as DesignTokens);
        }
        return expanded;
      }

      return obj;
    };

    return expandRecursive(tokens);
  }
}

