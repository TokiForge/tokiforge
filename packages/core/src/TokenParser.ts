import type { DesignTokens, TokenParserOptions, TokenValue } from './types';
import { TokenParseError, TokenValidationError } from './errors';

export class TokenParser {
  static parse(filePath: string, options: TokenParserOptions = {}): DesignTokens {
    if (typeof window !== 'undefined') {
      throw new Error('TokenParser.parse() is not available in browser environments. Use TokenParser.parseJSON() instead.');
    }

    try {
      const fs = require('fs');
      const path = require('path');
      const yaml = require('yaml');

      const content = fs.readFileSync(filePath, 'utf-8');
      const ext = path.extname(filePath).toLowerCase();

      let tokens: DesignTokens;

      if (ext === '.json') {
        tokens = JSON.parse(content);
      } else if (ext === '.yaml' || ext === '.yml') {
        tokens = yaml.parse(content);
      } else {
        throw new Error(`Unsupported file format: ${ext}. Supported formats: .json, .yaml, .yml`);
      }

      if (options.validate !== false) {
        this.validate(tokens);
      }

      if (options.expandReferences !== false) {
        tokens = this.expandReferences(tokens);
      }

      return tokens;
    } catch (error) {
      throw new TokenParseError(
        `Failed to parse token file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        filePath
      );
    }
  }

  static parseJSON(json: string, options: TokenParserOptions = {}): DesignTokens {
    try {
      const tokens = JSON.parse(json) as DesignTokens;

      if (options.validate !== false) {
        this.validate(tokens);
      }

      if (options.expandReferences !== false) {
        return this.expandReferences(tokens);
      }

      return tokens;
    } catch (error) {
      throw new TokenParseError(
        `Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  static validate(tokens: DesignTokens): void {
    if (!tokens || typeof tokens !== 'object') {
      throw new Error('Tokens must be an object');
    }

    const errors: string[] = [];
    this.validateTokens(tokens, '', errors);

    if (errors.length > 0) {
      throw new TokenValidationError('Token validation failed', errors);
    }
  }

  private static validateTokens(tokens: DesignTokens, path: string, errors: string[]): void {
    for (const [key, value] of Object.entries(tokens)) {
      const currentPath = path ? `${path}.${key}` : key;

      if (value === null || value === undefined) {
        errors.push(`Token at "${currentPath}" is null or undefined`);
        continue;
      }

      if (typeof value === 'object' && !Array.isArray(value)) {
        if ('value' in value || '$value' in value || '$alias' in value) {
          const token = value as TokenValue;
          if ('$alias' in token && token.$alias) {
            if (typeof token.$alias !== 'string') {
              errors.push(`Token alias at "${currentPath}" must be a string`);
            }
          } else if ('value' in token || '$value' in token) {
            const tokenValue = token.value ?? token.$value;
            if (tokenValue === undefined || tokenValue === null) {
              errors.push(`Token value at "${currentPath}" is missing`);
            }
          } else {
            errors.push(`Token at "${currentPath}" must have a value or alias`);
          }
        } else {
          this.validateTokens(value as DesignTokens, currentPath, errors);
        }
      }
    }
  }

  static extractSemanticTokens(tokens: DesignTokens): Array<{ path: string; token: TokenValue }> {
    const result: Array<{ path: string; token: TokenValue }> = [];
    this.extractSemanticTokensRecursive(tokens, '', result);
    return result;
  }

  private static extractSemanticTokensRecursive(
    tokens: DesignTokens,
    path: string,
    result: Array<{ path: string; token: TokenValue }>
  ): void {
    for (const [key, value] of Object.entries(tokens)) {
      const currentPath = path ? `${path}.${key}` : key;

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        if ('value' in value || '$value' in value || '$alias' in value) {
          const token = value as TokenValue;
          if (token.semantic?.category === 'semantic' || token.semantic?.category === 'component') {
            result.push({ path: currentPath, token });
          }
          if (token.$alias) {
            result.push({ path: currentPath, token });
          }
        } else {
          this.extractSemanticTokensRecursive(value as DesignTokens, currentPath, result);
        }
      }
    }
  }

  static validateAliases(tokens: DesignTokens): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const aliasMap = new Map<string, string>();

    this.collectAliases(tokens, '', aliasMap);

    for (const [path, alias] of aliasMap.entries()) {
      if (!this.resolveAlias(tokens, alias)) {
        errors.push(`Alias "${alias}" referenced at "${path}" not found`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  static expandReferences(tokens: DesignTokens): DesignTokens {
    const expanded = JSON.parse(JSON.stringify(tokens)) as DesignTokens;
    this.expandReferencesRecursive(expanded, tokens);
    return expanded;
  }

  private static expandReferencesRecursive(current: DesignTokens, source: DesignTokens): void {
    for (const [key, value] of Object.entries(current)) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        if ('$alias' in value && value.$alias) {
          const resolved = this.resolveAlias(source, value.$alias as string);
          if (resolved !== null) {
            current[key] = { ...value, value: resolved, $alias: undefined } as TokenValue;
          }
        } else {
          this.expandReferencesRecursive(value as DesignTokens, source);
        }
      }
    }
  }

  private static collectAliases(tokens: DesignTokens, path: string, aliasMap: Map<string, string>): void {
    for (const [key, value] of Object.entries(tokens)) {
      const currentPath = path ? `${path}.${key}` : key;

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        if ('$alias' in value && value.$alias) {
          aliasMap.set(currentPath, value.$alias as string);
        } else {
          this.collectAliases(value as DesignTokens, currentPath, aliasMap);
        }
      }
    }
  }

  private static resolveAlias(tokens: DesignTokens, alias: string): string | number | null {
    const parts = alias.replace(/^{|}$/g, '').split('.');
    let current: unknown = tokens;

    for (const part of parts) {
      if (current && typeof current === 'object' && !Array.isArray(current) && part in current) {
        current = (current as DesignTokens)[part];
      } else {
        return null;
      }
    }

    if (current && typeof current === 'object' && !Array.isArray(current)) {
      const token = current as TokenValue;
      const value = token.value ?? token.$value;
      if (value !== undefined && value !== null && (typeof value === 'string' || typeof value === 'number')) {
        return value;
      }
    }

    return null;
  }
}

