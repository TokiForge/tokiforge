import * as fs from 'fs';
import * as path from 'path';
import { FigmaDiff } from '@tokiforge/core';
import { pullFromFigma } from '@tokiforge/figma';
import { TokenParser } from '@tokiforge/core';

export async function figmaDiffCommand(
  accessToken: string,
  fileKey: string,
  projectPath: string = process.cwd()
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

  console.log('Comparing Figma ↔ Code tokens...\n');

  try {
    console.log('Fetching tokens from Figma...');
    const figmaTokens = await pullFromFigma({
      accessToken,
      fileKey,
    });

    console.log('Loading code tokens...');
    const codeTokens = TokenParser.parse(tokenPath);

    console.log('Comparing tokens...\n');
    const diff = FigmaDiff.compare(figmaTokens, codeTokens);
    const report = FigmaDiff.generateReport(diff);

    console.log(report);

    if (FigmaDiff.hasMismatches(diff)) {
      const outputPath = path.join(projectPath, 'figma-diff.json');
      FigmaDiff.exportJSON(diff, outputPath);
      console.log(`\nDiff saved to: ${outputPath}`);
      process.exit(1);
    } else {
      console.log('\nNo mismatches found!');
    }
  } catch (error: any) {
    console.error('Diff failed:', error.message);
    process.exit(1);
  }
}

