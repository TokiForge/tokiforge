import fs from 'node:fs';
import path from 'path';
import { parse as parseYAML } from 'yaml';
import type { DesignTokens, TokenParserOptions, TokenValue } from './types';
import { ParseError, ValidationError } from './types';

type TokenNode = Record<string, unknown>;

export class TokenParser {
  static parse(filePath: string, options: TokenParserOptions = {}): DesignTokens {
    const { validate = true, expandReferences = true } = options;

    try {
      if (!fs.existsSync(filePath)) {
        throw new ParseError(`Token file not found: ${filePath}`, filePath);
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      const ext = path.extname(filePath).toLowerCase();

      let tokens: DesignTokens;

      if (ext === '.yaml' || ext === '.yml') {
        tokens = parseYAML(content) as DesignTokens;
      } else {
        tokens = JSON.parse(content) as DesignTokens;
      }

      if (validate) {
        this.validate(tokens);
      }

      if (expandReferences) {
        tokens = this.expandReferences(tokens);
      }

      return tokens;
    } catch (error) {
      if (error instanceof ParseError || error instanceof ValidationError) {
        throw error;
      }
      throw new ParseError(
        `Failed to parse token file: ${error instanceof Error ? error.message : String(error)}`,
        filePath
      );
    }
  }

  static validate(tokens: DesignTokens): void {
    const validateToken = (obj: TokenNode | unknown, tokenPath: string = ''): void => {
      if (typeof obj !== 'object' || obj === null) return;

      if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
          validateToken(obj[i] as TokenNode, `${tokenPath}[${i}]`);
        }
        return;
      }

      const node = obj as TokenNode;
      if ('value' in node) {
        const token = node as unknown as TokenValue;
        if (token.value === undefined || token.value === null) {
          throw new ValidationError(`Token value is required at path: ${tokenPath}`, tokenPath);
        }
      } else {
        for (const key of Object.keys(node)) {
          const newPath = tokenPath ? `${tokenPath}.${key}` : key;
          validateToken(node[key], newPath);
        }
      }
    };

    try {
      validateToken(tokens as TokenNode);
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      throw new ValidationError(
        `Token validation failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  static expandReferences(tokens: DesignTokens): DesignTokens {
    const expanded: TokenNode = JSON.parse(JSON.stringify(tokens)) as TokenNode;

    const getValue = (obj: TokenNode, refPath: string): unknown => {
      const parts = refPath.split('.');
      let current: unknown = obj;
      for (const part of parts) {
        if (current && typeof current === 'object' && part in (current as TokenNode)) {
          current = (current as TokenNode)[part];
        } else {
          return undefined;
        }
      }
      const node = current as TokenNode | undefined;
      return node && typeof node === 'object' && 'value' in node ? node.value : current;
    };

    const expandValue = (value: unknown): unknown => {
      if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
        const refPath = value.slice(1, -1);
        const refValue = getValue(expanded, refPath);
        if (refValue !== undefined) return refValue;
      }
      if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) return value.map(expandValue);
        const result: TokenNode = {};
        for (const key of Object.keys(value as TokenNode)) {
          result[key] = expandValue((value as TokenNode)[key]);
        }
        return result;
      }
      return value;
    };

    const expandTokens = (obj: unknown): unknown => {
      if (typeof obj !== 'object' || obj === null) return obj;
      if (Array.isArray(obj)) return obj.map(expandTokens);

      const node = obj as TokenNode;
      if ('value' in node) {
        return { ...node, value: expandValue(node.value) };
      }

      const result: TokenNode = {};
      for (const key of Object.keys(node)) {
        result[key] = expandTokens(node[key]);
      }
      return result;
    };

    return expandTokens(expanded) as DesignTokens;
  }

  static validateAliases(tokens: DesignTokens): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const allPaths = new Set<string>();

    const collectPaths = (obj: TokenNode | unknown, tokenPath: string = ''): void => {
      if (typeof obj !== 'object' || obj === null) return;

      if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
          collectPaths(obj[i] as TokenNode, `${tokenPath}[${i}]`);
        }
        return;
      }

      const node = obj as TokenNode;
      if ('value' in node) {
        if (tokenPath) allPaths.add(tokenPath);
      } else {
        for (const key of Object.keys(node)) {
          const newPath = tokenPath ? `${tokenPath}.${key}` : key;
          collectPaths(node[key], newPath);
        }
      }
    };

    const validateAlias = (obj: TokenNode | unknown, tokenPath: string = ''): void => {
      if (typeof obj !== 'object' || obj === null) return;

      if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
          validateAlias(obj[i] as TokenNode, `${tokenPath}[${i}]`);
        }
        return;
      }

      const node = obj as TokenNode;
      if ('$alias' in node) {
        const aliasPath = node.$alias as string;
        if (!allPaths.has(aliasPath)) {
          errors.push(`Invalid alias at ${tokenPath}: ${aliasPath} not found`);
        }
      } else if (!('value' in node)) {
        for (const key of Object.keys(node)) {
          const newPath = tokenPath ? `${tokenPath}.${key}` : key;
          validateAlias(node[key], newPath);
        }
      }
    };

    collectPaths(tokens as TokenNode);
    validateAlias(tokens as TokenNode);

    return { valid: errors.length === 0, errors };
  }
}
