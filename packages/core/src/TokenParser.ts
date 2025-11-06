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

      if ('value' in obj) {
        if (typeof obj.value !== 'string' && typeof obj.value !== 'number') {
          throw new Error(`Invalid token value at ${path}: must be string or number`);
        }
      } else {
        for (const key in obj) {
          validateRecursive(obj[key] as DesignTokens, path ? `${path}.${key}` : key);
        }
      }
    };

    validateRecursive(tokens);
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

      if (current && typeof current === 'object' && 'value' in current) {
        const value = current.value;
        if (typeof value === 'string' && value.startsWith('{')) {
          return resolveReference(value, root) as string;
        }
        return value;
      }

      throw new Error(`Invalid token reference: ${path}`);
    };

    const isTokenValue = (obj: any): obj is TokenValue => {
      return obj && typeof obj === 'object' && !Array.isArray(obj) && 'value' in obj;
    };

    const expandRecursive = (obj: DesignTokens): DesignTokens => {
      if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
        if (isTokenValue(obj)) {
          const resolvedValue = resolveReference(String(obj.value), tokens);
          return {
            ...obj,
            value: resolvedValue,
          } as unknown as DesignTokens;
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

