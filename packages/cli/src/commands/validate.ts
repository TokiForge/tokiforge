import * as fs from 'fs';
import * as path from 'path';
import { CICDValidator } from '@tokiforge/core';
import { pullFromFigma } from '@tokiforge/figma';

export interface ValidateOptions {
  strict?: boolean;
  checkAccessibility?: boolean;
  checkDeprecated?: boolean;
  checkFigma?: boolean;
  figmaToken?: string;
  figmaFileKey?: string;
  minAccessibility?: 'AA' | 'AAA';
}

export async function validateCommand(
  projectPath: string = process.cwd(),
  options: ValidateOptions = {}
): Promise<void> {
  const configPath = path.join(projectPath, 'tokiforge.config.json');

  if (!fs.existsSync(configPath)) {
    console.error('tokiforge.config.json not found. Run "tokiforge init" first.');
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  const tokenPath = path.resolve(projectPath, config.input || './tokens.json');

  if (!fs.existsSync(tokenPath)) {
    console.error(`Token file not found: ${tokenPath}`);
    process.exit(1);
  }

  console.log('Validating tokens...\n');

  try {
    const validationOptions: any = {
      strict: options.strict !== false,
      checkAccessibility: options.checkAccessibility !== false,
      checkDeprecated: options.checkDeprecated !== false,
      checkFigma: options.checkFigma || false,
      minAccessibility: options.minAccessibility || 'AA',
    };

    if (options.checkFigma && options.figmaToken && options.figmaFileKey) {
      console.log('Fetching tokens from Figma...');
      try {
        const figmaTokens = await pullFromFigma({
          accessToken: options.figmaToken,
          fileKey: options.figmaFileKey,
        });
        validationOptions.figmaTokens = figmaTokens;
      } catch (error: any) {
        console.warn(`Failed to fetch Figma tokens: ${error.message}`);
        validationOptions.checkFigma = false;
      }
    }

    const result = CICDValidator.validateFile(tokenPath, validationOptions);
    const report = CICDValidator.generateReport(result);

    console.log(report);
    console.log('');

    const exitCode = CICDValidator.exitCode(result);
    if (exitCode !== 0) {
      console.error('Validation failed');
      process.exit(exitCode);
    } else {
      console.log('Validation passed');
    }
  } catch (error: any) {
    console.error('Validation error:', error.message);
    process.exit(1);
  }
}

