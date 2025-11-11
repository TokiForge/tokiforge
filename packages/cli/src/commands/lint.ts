import * as fs from 'fs';
import * as path from 'path';
import { TokenParser, ColorUtils } from '@tokiforge/core';
import type { DesignTokens } from '@tokiforge/core';

interface LintResult {
  errors: string[];
  warnings: string[];
}

interface DiffResult {
  added: string[];
  removed: string[];
  changed: Array<{ path: string; old: any; new: any }>;
}

export async function lintCommand(projectPath: string = process.cwd()): Promise<void> {
  const configPath = path.join(projectPath, 'tokiforge.config.json');

  if (!fs.existsSync(configPath)) {
    console.error('tokiforge.config.json not found. Run "tokiforge init" first.');
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  const inputPath = path.resolve(projectPath, config.input);

  if (!fs.existsSync(inputPath)) {
    console.error(`Token file not found: ${inputPath}`);
    process.exit(1);
  }

  console.log('Linting tokens...\n');

  const result: LintResult = { errors: [], warnings: [] };

  try {
    console.log('Validating schema...');
    TokenParser.parse(inputPath, { validate: true });
    console.log('Schema valid\n');

    const tokens = TokenParser.parse(inputPath, { expandReferences: true });

    console.log('Validating aliases...');
    const aliasValidation = TokenParser.validateAliases(tokens);
    if (!aliasValidation.valid) {
      aliasValidation.errors.forEach(err => result.errors.push(err));
    } else {
      console.log('All aliases valid\n');
    }

    console.log('Checking color contrast...');
    const contrastIssues = checkColorContrast(tokens);
    result.warnings.push(...contrastIssues);
    if (contrastIssues.length === 0) {
      console.log('Color contrast checks passed\n');
    }

    console.log('Checking for duplicates...');
    const duplicates = checkDuplicates(tokens);
    result.warnings.push(...duplicates);
    if (duplicates.length === 0) {
      console.log('No duplicates found\n');
    }

    if (config.themes && Array.isArray(config.themes)) {
      console.log('Validating themes...');
      for (const theme of config.themes) {
        const themeTokens = theme.tokens;
        if (themeTokens) {
          const themeContrast = checkColorContrast(themeTokens);
          result.warnings.push(
            ...themeContrast.map(issue => `Theme "${theme.name}": ${issue}`)
          );
        }
      }
      console.log('Theme validation complete\n');
    }

    if (result.errors.length === 0 && result.warnings.length === 0) {
      console.log('All tokens are valid!\n');
    } else {
      if (result.errors.length > 0) {
        console.error('Errors:\n');
        result.errors.forEach(err => console.error(`   ${err}`));
        console.log('');
      }
      if (result.warnings.length > 0) {
        console.warn('Warnings:\n');
        result.warnings.forEach(warn => console.warn(`   ${warn}`));
        console.log('');
      }
    }

    if (result.errors.length > 0) {
      process.exit(1);
    }
  } catch (error: any) {
    console.error('Validation failed:', error.message);
    process.exit(1);
  }
}

/**
 * Check color contrast for accessibility
 */
function checkColorContrast(tokens: DesignTokens): string[] {
  const issues: string[] = [];
  const colors: Array<{ path: string; value: string }> = [];

  const collectColors = (obj: DesignTokens, path: string = ''): void => {
    for (const key in obj) {
      const currentPath = path ? `${path}.${key}` : key;
      const value = obj[key];

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        if ('value' in value || '$value' in value) {
          const tokenValue = 'value' in value ? value.value : value.$value;
          if (typeof tokenValue === 'string' && tokenValue.startsWith('#')) {
            colors.push({ path: currentPath, value: tokenValue });
          }
        } else {
          collectColors(value as DesignTokens, currentPath);
        }
      }
    }
  };

  collectColors(tokens);

  const textColors = colors.filter(c => c.path.includes('text'));
  const bgColors = colors.filter(c => c.path.includes('background') || c.path.includes('bg'));

  for (const textColor of textColors) {
    for (const bgColor of bgColors) {
      const ratio = ColorUtils.getContrastRatio(textColor.value, bgColor.value);
      const aaPass = ratio >= 4.5;
      const aaaPass = ratio >= 7;

      if (!aaPass) {
        issues.push(
          `Low contrast: ${textColor.path} on ${bgColor.path} (ratio: ${ratio.toFixed(2)}, AA: ${aaPass ? 'PASS' : 'FAIL'}, AAA: ${aaaPass ? 'PASS' : 'FAIL'})`
        );
      } else if (!aaaPass) {
        issues.push(
          `Moderate contrast: ${textColor.path} on ${bgColor.path} (ratio: ${ratio.toFixed(2)}, AA: PASS, AAA: FAIL)`
        );
      }
    }
  }

  return issues;
}

/**
 * Check for duplicate token names
 */
function checkDuplicates(tokens: DesignTokens): string[] {
  const duplicates: string[] = [];
  const seen = new Set<string>();

  const check = (obj: DesignTokens, prefix: string = ''): void => {
    for (const key in obj) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      const value = obj[key];

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        if ('value' in value || '$value' in value || '$alias' in value) {
          if (seen.has(fullKey)) {
            duplicates.push(`Duplicate token name: ${fullKey}`);
          }
          seen.add(fullKey);
        } else {
          check(value as DesignTokens, fullKey);
        }
      }
    }
  };

  check(tokens);
  return duplicates;
}

/**
 * Compare two token files and generate diff
 */
export function diffTokens(
  oldPath: string,
  newPath: string
): DiffResult {
  const oldTokens = TokenParser.parse(oldPath, { expandReferences: true });
  const newTokens = TokenParser.parse(newPath, { expandReferences: true });

  const oldFlat = flattenTokens(oldTokens);
  const newFlat = flattenTokens(newTokens);

  const added: string[] = [];
  const removed: string[] = [];
  const changed: Array<{ path: string; old: any; new: any }> = [];

  for (const path in newFlat) {
    if (!(path in oldFlat)) {
      added.push(path);
    } else if (oldFlat[path] !== newFlat[path]) {
      changed.push({ path, old: oldFlat[path], new: newFlat[path] });
    }
  }

  for (const path in oldFlat) {
    if (!(path in newFlat)) {
      removed.push(path);
    }
  }

  return { added, removed, changed };
}

/**
 * Flatten tokens to a flat object
 */
function flattenTokens(tokens: DesignTokens, prefix: string = '', result: Record<string, any> = {}): Record<string, any> {
  for (const key in tokens) {
    const value = tokens[key];
    const path = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      if ('value' in value || '$value' in value || '$alias' in value) {
        const tokenValue = 'value' in value ? value.value : ('$value' in value ? value.$value : null);
        result[path] = tokenValue;
      } else {
        flattenTokens(value as DesignTokens, path, result);
      }
    }
  }

  return result;
}

