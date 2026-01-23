import * as fs from 'fs';
import * as path from 'path';
import { generateTailwindConfigFile } from '@tokiforge/tailwind';

export async function tailwindCommand(projectPath: string = process.cwd()): Promise<void> {
  const configPath = path.join(projectPath, 'tokiforge.config.json');

  if (!fs.existsSync(configPath)) {
    console.error('tokiforge.config.json not found. Run "tokiforge init" first.');
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  const inputPath = path.resolve(projectPath, config.input || './tokens.json');

  if (!fs.existsSync(inputPath)) {
    console.error(`Token file not found: ${inputPath}`);
    process.exit(1);
  }

  console.log('Generating Tailwind config...\n');

  try {
    const tailwindConfig = generateTailwindConfigFile({
      tokensPath: inputPath,
      prefix: config.prefix || 'hf',
      useCSSVariables: true,
      content: ['./src/**/*.{js,ts,jsx,tsx}', './app/**/*.{js,ts,jsx,tsx}'],
    });

    const outputPath = path.join(projectPath, 'tailwind.config.js');
    fs.writeFileSync(outputPath, tailwindConfig);

    console.log(`Tailwind config generated: ${outputPath}\n`);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Failed to generate Tailwind config:', message);
    process.exit(1);
  }
}

