import { DesignTokens, TokenParserOptions } from './types';
import * as fs from 'fs';
import * as path from 'path';
import YAML from 'yaml';

export class TokenParser {
  static parse(filePath: string, options: TokenParserOptions = {}): DesignTokens {
    const content = fs.readFileSync(filePath, 'utf-8');
    const ext = path.extname(filePath).toLowerCase();

    let tokens: DesignTokens;

    if (ext === '.yaml' || ext === '.yml') {
      tokens = YAML.parse(content);
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
    const validateToken = (obj: any, path: string = ''): void => {
      if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
        if (obj.value !== undefined) {
          // This is a token value
          if (typeof obj.value !== 'string' && typeof obj.value !== 'number') {
            throw new Error(`Invalid token value at ${path}: must be string or number`);
          }
        } else {
          // This is a nested object, validate children
          for (const key in obj) {
            validateToken(obj[key], path ? `${path}.${key}` : key);
          }
        }
      }
    };

    validateToken(tokens);
  }

  static expandReferences(tokens: DesignTokens): DesignTokens {
    const resolveReference = (value: string, tokens: DesignTokens): string | number => {
      if (typeof value !== 'string' || !value.startsWith('{') || !value.endsWith('}')) {
        return value;
      }

      const refPath = value.slice(1, -1);
      const parts = refPath.split('.');
      let current: any = tokens;

      for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
          current = current[part];
        } else {
          throw new Error(`Token reference not found: ${refPath}`);
        }
      }

      if (current && typeof current === 'object' && 'value' in current) {
        const resolved = current.value;
        return typeof resolved === 'string' && resolved.startsWith('{')
          ? resolveReference(resolved, tokens)
          : resolved;
      }

      throw new Error(`Invalid token reference: ${refPath}`);
    };

    const expand = (obj: any): any => {
      if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
        if (obj.value !== undefined) {
          return {
            ...obj,
            value: resolveReference(String(obj.value), tokens),
          };
        }
        const expanded: any = {};
        for (const key in obj) {
          expanded[key] = expand(obj[key]);
        }
        return expanded;
      }
      return obj;
    };

    return expand(tokens);
  }
}

