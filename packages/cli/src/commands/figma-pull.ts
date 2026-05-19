import * as fs from 'node:fs';
import * as path from 'path';
import { pullFromFigma } from '@tokiforge/figma';

function resolveDefaultOutput(projectPath: string): string {
  const configPath = path.join(projectPath, 'tokiforge.config.json');
  if (!fs.existsSync(configPath)) {
    return path.join(projectPath, 'tokens.json');
  }

  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    return path.resolve(projectPath, config.input || './tokens.json');
  } catch {
    return path.join(projectPath, 'tokens.json');
  }
}

export async function figmaPullCommand(
  accessToken: string,
  fileKey: string,
  outputPath?: string,
  projectPath: string = process.cwd()
): Promise<void> {
  const resolvedOutput = outputPath
    ? path.resolve(projectPath, outputPath)
    : resolveDefaultOutput(projectPath);

  try {
    console.log('Fetching tokens from Figma...');
    const tokens = await pullFromFigma({
      accessToken,
      fileKey,
    });

    fs.writeFileSync(resolvedOutput, JSON.stringify(tokens, null, 2), 'utf-8');
    console.log(`Saved tokens to: ${resolvedOutput}`);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Figma pull failed:', message);
    process.exit(1);
  }
}
