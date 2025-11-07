import type { DesignTokens } from './types';
import { TokenParser } from './TokenParser';
import { TokenVersioning } from './TokenVersioning';
import { AccessibilityUtils } from './AccessibilityUtils';
import { FigmaDiff } from './FigmaDiff';

export interface ValidationResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
  checks: Array<{ name: string; passed: boolean; message?: string }>;
}

export interface ValidationOptions {
  strict?: boolean;
  checkAccessibility?: boolean;
  checkDeprecated?: boolean;
  checkFigma?: boolean;
  figmaTokens?: DesignTokens;
  minAccessibility?: 'AA' | 'AAA';
}

export class CICDValidator {
  static validate(tokens: DesignTokens, options: ValidationOptions = {}): ValidationResult {
    const result: ValidationResult = {
      passed: true,
      errors: [],
      warnings: [],
      checks: [],
    };

    const checks = [
      this.checkSyntax(tokens),
      this.checkReferences(tokens),
      this.checkFormat(tokens),
    ];

    if (options.checkDeprecated !== false) {
      checks.push(this.checkDeprecated(tokens));
    }

    if (options.checkAccessibility !== false) {
      checks.push(this.checkAccessibility(tokens, options.minAccessibility));
    }

    if (options.checkFigma && options.figmaTokens) {
      checks.push(this.checkFigmaSync(tokens, options.figmaTokens));
    }

    for (const check of checks) {
      result.checks.push(check);
      if (!check.passed) {
        result.passed = false;
        if (options.strict) {
          result.errors.push(check.message || check.name);
        } else {
          result.warnings.push(check.message || check.name);
        }
      }
    }

    return result;
  }

  static validateFile(filePath: string, options: ValidationOptions = {}): ValidationResult {
    try {
      const tokens = TokenParser.parse(filePath);
      return this.validate(tokens, options);
    } catch (error: any) {
      return {
        passed: false,
        errors: [error.message],
        warnings: [],
        checks: [],
      };
    }
  }

  static generateReport(result: ValidationResult): string {
    const lines: string[] = [];
    lines.push('Token Validation Report');
    lines.push('='.repeat(50));
    lines.push('');

    lines.push(`Status: ${result.passed ? '✅ PASSED' : '❌ FAILED'}`);
    lines.push('');

    if (result.checks.length > 0) {
      lines.push('Checks:');
      for (const check of result.checks) {
        const status = check.passed ? '✅' : '❌';
        lines.push(`  ${status} ${check.name}`);
        if (check.message) {
          lines.push(`     ${check.message}`);
        }
      }
      lines.push('');
    }

    if (result.errors.length > 0) {
      lines.push('Errors:');
      for (const error of result.errors) {
        lines.push(`  ❌ ${error}`);
      }
      lines.push('');
    }

    if (result.warnings.length > 0) {
      lines.push('Warnings:');
      for (const warning of result.warnings) {
        lines.push(`  ⚠️  ${warning}`);
      }
      lines.push('');
    }

    return lines.join('\n');
  }

  static exitCode(result: ValidationResult): number {
    return result.passed ? 0 : 1;
  }

  private static checkSyntax(tokens: DesignTokens): { name: string; passed: boolean; message?: string } {
    try {
      TokenParser.validate(tokens);
      return { name: 'Syntax Validation', passed: true };
    } catch (error: any) {
      return { name: 'Syntax Validation', passed: false, message: error.message };
    }
  }

  private static checkReferences(tokens: DesignTokens): { name: string; passed: boolean; message?: string } {
    try {
      const validation = TokenParser.validateAliases(tokens);
      if (validation.valid) {
        return { name: 'Reference Validation', passed: true };
      }
      return {
        name: 'Reference Validation',
        passed: false,
        message: `Invalid references: ${validation.errors.join(', ')}`,
      };
    } catch (error: any) {
      return { name: 'Reference Validation', passed: false, message: error.message };
    }
  }

  private static checkFormat(tokens: DesignTokens): { name: string; passed: boolean; message?: string } {
    const issues: string[] = [];

    const checkRecursive = (obj: DesignTokens, path: string = ''): void => {
      for (const key in obj) {
        const currentPath = path ? `${path}.${key}` : key;
        const value = obj[key];

        if (value && typeof value === 'object' && !Array.isArray(value)) {
          if ('value' in value || '$value' in value || '$alias' in value) {
            const token = value as any;
            if (!token.value && !token.$value && !token.$alias) {
              issues.push(`${currentPath}: missing value`);
            }
          } else {
            checkRecursive(value as DesignTokens, currentPath);
          }
        }
      }
    };

    checkRecursive(tokens);

    if (issues.length === 0) {
      return { name: 'Format Validation', passed: true };
    }
    return {
      name: 'Format Validation',
      passed: false,
      message: `Format issues: ${issues.slice(0, 5).join(', ')}${issues.length > 5 ? '...' : ''}`,
    };
  }

  private static checkDeprecated(tokens: DesignTokens): { name: string; passed: boolean; message?: string } {
    const warnings = TokenVersioning.getDeprecatedTokens(tokens);
    if (warnings.length === 0) {
      return { name: 'Deprecation Check', passed: true };
    }
    return {
      name: 'Deprecation Check',
      passed: false,
      message: `Found ${warnings.length} deprecated tokens`,
    };
  }

  private static checkAccessibility(
    tokens: DesignTokens,
    minLevel?: 'AA' | 'AAA'
  ): { name: string; passed: boolean; message?: string } {
    const report = AccessibilityUtils.generateAccessibilityReport(tokens);
    const failing = report.failing;

    if (failing === 0) {
      return { name: 'Accessibility Check', passed: true };
    }

    const level = minLevel || 'AA';
    const message = `${failing} tokens fail WCAG ${level} accessibility requirements`;
    return { name: 'Accessibility Check', passed: false, message };
  }

  private static checkFigmaSync(
    tokens: DesignTokens,
    figmaTokens: DesignTokens
  ): { name: string; passed: boolean; message?: string } {
    const diff = FigmaDiff.compare(figmaTokens, tokens);
    const hasMismatches = FigmaDiff.hasMismatches(diff);

    if (!hasMismatches) {
      return { name: 'Figma Sync Check', passed: true };
    }

    const issues = diff.added.length + diff.removed.length + diff.changed.length;
    return {
      name: 'Figma Sync Check',
      passed: false,
      message: `Found ${issues} mismatches with Figma`,
    };
  }
}

