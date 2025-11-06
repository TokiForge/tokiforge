import * as fs from 'fs';
import * as path from 'path';
import { TokenParser, TokenExporter } from '@tokiforge/core';
import type { TokenExportOptions } from '@tokiforge/core';

interface Config {
  input: string;
  output: {
    css?: string;
    js?: string;
    ts?: string;
    scss?: string;
    json?: string;
  };
  prefix?: string;
  selector?: string;
}

export async function buildCommand(projectPath: string = process.cwd()): Promise<void> {
  const configPath = path.join(projectPath, 'tokiforge.config.json');

  if (!fs.existsSync(configPath)) {
    console.error('❌ tokiforge.config.json not found. Run "tokiforge init" first.');
    process.exit(1);
  }

  const config: Config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  const inputPath = path.resolve(projectPath, config.input);

  if (!fs.existsSync(inputPath)) {
    console.error(`❌ Token file not found: ${inputPath}`);
    process.exit(1);
  }

  console.log('📦 Parsing tokens...');
  const tokens = TokenParser.parse(inputPath, { validate: true, expandReferences: true });

  // Ensure output directory exists
  const outputDir = path.join(projectPath, 'dist');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const formats: Array<{ format: TokenExportOptions['format']; path?: string }> = [
    { format: 'css', path: config.output.css },
    { format: 'js', path: config.output.js },
    { format: 'ts', path: config.output.ts },
    { format: 'scss', path: config.output.scss },
    { format: 'json', path: config.output.json },
  ];

  for (const { format, path: outputPath } of formats) {
    if (!outputPath) continue;

    const fullPath = path.resolve(projectPath, outputPath);
    const outputDir = path.dirname(fullPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const options: TokenExportOptions = {
      format: format!,
      prefix: config.prefix || 'hf',
      selector: config.selector || ':root',
      variables: format === 'js' || format === 'ts',
    };

    const content = TokenExporter.export(tokens, options);
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Generated ${format!.toUpperCase()}: ${outputPath}`);
  }

  console.log('\n🎉 Build complete!');
}

