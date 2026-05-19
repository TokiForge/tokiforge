import type {
  DesignTokens,
  CICDValidationOptions,
  CICDValidationResult,
} from './types';
import { TokenParser } from './token-parser';
import { AccessibilityUtils } from './accessibility-utils';
import fs from 'node:fs';

type TokenNode = Record<string, unknown>;

export class CICDValidator {
  static validate(tokens: DesignTokens, options: CICDValidationOptions = {}): CICDValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    this.checkBasicValidation(tokens, errors);
    this.checkDeprecatedTokensRule(tokens, options, errors, warnings);
    this.checkAccessibilityRule(tokens, options, errors, warnings);
    this.checkCustomRules(tokens, options, errors);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private static checkBasicValidation(tokens: DesignTokens, errors: string[]): void {
    try {
      TokenParser.validate(tokens);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  private static checkDeprecatedTokensRule(tokens: DesignTokens, options: CICDValidationOptions, errors: string[], warnings: string[]): void {
    if (options.checkDeprecated) {
      const deprecated = this.getDeprecatedTokens(tokens);
      if (deprecated.length > 0) {
        if (options.strict) {
          errors.push(`Deprecated tokens found: ${deprecated.join(', ')}`);
        } else {
          warnings.push(`Deprecated tokens: ${deprecated.join(', ')}`);
        }
      }
    }
  }

  private static checkAccessibilityRule(tokens: DesignTokens, options: CICDValidationOptions, errors: string[], warnings: string[]): void {
    if (options.checkAccessibility) {
      const report = AccessibilityUtils.generateAccessibilityReport(tokens);
      if (report.failing > 0) {
        if (options.strict) {
          errors.push(`${report.failing} accessibility issues found`);
        } else {
          warnings.push(`${report.failing} accessibility issues found`);
        }
      }
    }
  }

  private static checkCustomRules(tokens: DesignTokens, options: CICDValidationOptions, errors: string[]): void {
    if (options.customRules) {
      for (const rule of options.customRules) {
        const result = rule(tokens);
        if (typeof result === 'boolean') {
          if (!result) {
            errors.push('Custom validation rule failed');
          }
        } else {
          if (!result.valid) {
            errors.push(result.error);
          }
        }
      }
    }
  }

  static validateFile(filePath: string, options: CICDValidationOptions = {}): CICDValidationResult {
    if (!fs.existsSync(filePath)) {
      return {
        valid: false,
        errors: [`File not found: ${filePath}`],
        warnings: [],
      };
    }

    try {
      const tokens = TokenParser.parse(filePath, {
        validate: true,
        expandReferences: true,
      });
      return this.validate(tokens, options);
    } catch (error) {
      return {
        valid: false,
        errors: [error instanceof Error ? error.message : String(error)],
        warnings: [],
      };
    }
  }

  static exitCode(result: CICDValidationResult): number {
    return result.valid ? 0 : 1;
  }

  static generateReport(result: CICDValidationResult): string {
    const lines: string[] = [];
    
    lines.push(
      'CI/CD Validation Report',
      '='.repeat(50),
      ''
    );
    
    if (result.valid) {
      lines.push('✅ Validation passed', '');
    } else {
      lines.push('❌ Validation failed', '');
    }
    
    if (result.errors.length > 0) {
      lines.push(`Errors (${result.errors.length}):`);
      for (const error of result.errors) {
        lines.push(`  ❌ ${error}`);
      }
      lines.push('');
    }
    
    if (result.warnings.length > 0) {
      lines.push(`Warnings (${result.warnings.length}):`);
      for (const warning of result.warnings) {
        lines.push(`  ⚠️  ${warning}`);
      }
      lines.push('');
    }
    
    return lines.join('\n');
  }

  private static getDeprecatedTokens(tokens: DesignTokens): string[] {
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
      if ('value' in node && node.deprecated === true) {
        deprecated.push(path || 'root');
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
}
