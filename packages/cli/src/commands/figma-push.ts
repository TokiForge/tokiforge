import * as fs from 'node:fs';
import * as path from 'path';
import { pushToFigma } from '@tokiforge/figma';

function resolveDefaultInput(projectPath: string): string {
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

export async function figmaPushCommand(
  accessToken: string,
  fileKey: string,
  inputPath?: string,
  projectPath: string = process.cwd()
): Promise<void> {
  const resolvedInput = inputPath
    ? path.resolve(projectPath, inputPath)
    : resolveDefaultInput(projectPath);

  if (!fs.existsSync(resolvedInput)) {
    console.error(`Token file not found: ${resolvedInput}`);
    process.exit(1);
  }

  try {
    console.log(`Pushing tokens from: ${resolvedInput}`);
    await pushToFigma(resolvedInput, {
      accessToken,
      fileKey,
    });
    console.log('Push completed.');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Figma push failed:', message);
    process.exit(1);
  }
}
