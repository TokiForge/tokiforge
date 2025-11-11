import type { DesignTokens } from './types';
import { TokenParser } from './TokenParser';
import { AccessibilityUtils } from './AccessibilityUtils';
import { TokenVersioning } from './TokenVersioning';

export interface CICDValidationOptions {
  strict?: boolean;
  checkAccessibility?: boolean;
  checkVersioning?: boolean;
  minAccessibilityLevel?: 'AA' | 'AAA';
}

export interface CICDValidationResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
  checks: Array<{ name: string; passed: boolean; message?: string }>;
}

export class CICDValidator {
  static validate(tokens: DesignTokens, options: CICDValidationOptions = {}): CICDValidationResult {
    const {
      strict = false,
      checkAccessibility = true,
      checkVersioning = true,
      minAccessibilityLevel = 'AA',
    } = options;

    const errors: string[] = [];
    const warnings: string[] = [];
    const checks: Array<{ name: string; passed: boolean; message?: string }> = [];

    try {
      TokenParser.validate(tokens);
      checks.push({ name: 'Token Validation', passed: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Token validation failed';
      errors.push(message);
      checks.push({ name: 'Token Validation', passed: false, message });
    }

    const aliasValidation = TokenParser.validateAliases(tokens);
    if (aliasValidation.valid) {
      checks.push({ name: 'Alias Validation', passed: true });
    } else {
      aliasValidation.errors.forEach(err => {
        if (strict) {
          errors.push(err);
        } else {
          warnings.push(err);
        }
      });
      checks.push({
        name: 'Alias Validation',
        passed: !strict && aliasValidation.errors.length === 0,
        message: `${aliasValidation.errors.length} alias errors found`,
      });
    }

    if (checkAccessibility) {
      const accessibilityReport = AccessibilityUtils.generateAccessibilityReport(tokens);
      const failing = accessibilityReport.results.filter(r => {
        return minAccessibilityLevel === 'AA' ? !r.metrics.wcagAA : !r.metrics.wcagAAA;
      });

      if (failing.length === 0) {
        checks.push({ name: 'Accessibility', passed: true });
      } else {
        const message = `${failing.length} tokens fail ${minAccessibilityLevel} accessibility requirements`;
        if (strict) {
          failing.forEach(f => {
            errors.push(`Token "${f.path}" fails accessibility: contrast ratio ${f.metrics.contrastRatio.toFixed(2)}`);
          });
        } else {
          warnings.push(message);
        }
        checks.push({ name: 'Accessibility', passed: false, message });
      }
    }

    if (checkVersioning) {
      const versionValidation = TokenVersioning.validateVersion(tokens);
      versionValidation.errors.forEach(err => errors.push(err));
      versionValidation.warnings.forEach(warn => warnings.push(warn));

      checks.push({
        name: 'Version Validation',
        passed: versionValidation.valid,
        message: versionValidation.errors.length > 0
          ? `${versionValidation.errors.length} errors, ${versionValidation.warnings.length} warnings`
          : undefined,
      });
    }

    return {
      passed: errors.length === 0,
      errors,
      warnings,
      checks,
    };
  }

  static validateFile(filePath: string, options: CICDValidationOptions = {}): CICDValidationResult {
    try {
      const tokens = TokenParser.parse(filePath);
      return this.validate(tokens, options);
    } catch (error) {
      return {
        passed: false,
        errors: [error instanceof Error ? error.message : 'Failed to parse token file'],
        warnings: [],
        checks: [{ name: 'File Parsing', passed: false, message: 'Failed to read or parse file' }],
      };
    }
  }

  static generateReport(result: CICDValidationResult): string {
    const lines: string[] = [];

    lines.push('CI/CD Validation Report');
    lines.push('='.repeat(50));
    lines.push(`Status: ${result.passed ? 'PASSED' : 'FAILED'}`);
    lines.push('');

    if (result.checks.length > 0) {
      lines.push('Checks:');
      result.checks.forEach(check => {
        const status = check.passed ? '✓' : '✗';
        lines.push(`  ${status} ${check.name}${check.message ? `: ${check.message}` : ''}`);
      });
      lines.push('');
    }

    if (result.errors.length > 0) {
      lines.push('Errors:');
      result.errors.forEach(error => {
        lines.push(`  ✗ ${error}`);
      });
      lines.push('');
    }

    if (result.warnings.length > 0) {
      lines.push('Warnings:');
      result.warnings.forEach(warning => {
        lines.push(`  ⚠ ${warning}`);
      });
      lines.push('');
    }

    return lines.join('\n');
  }

  static exitCode(result: CICDValidationResult): number {
    return result.passed ? 0 : 1;
  }
}

