import * as fs from 'node:fs';
import * as path from 'path';
import { TokenParser, TokenExporter, ResponsiveTokens } from '@tokiforge/core/node';
import type { TokenExportOptions, Breakpoint } from '@tokiforge/core/node';

interface Config {
  input: string;
  output: {
    css?: string;
    js?: string;
    ts?: string;
    scss?: string;
    json?: string;
    /** Extra CSS with @media / @container / state rules */
    responsiveCss?: string;
  };
  prefix?: string;
  selector?: string;
  layer?: string;
  breakpoints?: Breakpoint[];
  /** Emit responsive + state CSS next to the main CSS file (default: true when css output is set) */
  responsive?: boolean;
}

export async function buildCommand(projectPath: string = process.cwd()): Promise<void> {
  const configPath = path.join(projectPath, 'tokiforge.config.json');

  if (!fs.existsSync(configPath)) {
    console.error('tokiforge.config.json not found. Run "tokiforge init" first.');
    process.exit(1);
  }

  const config: Config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  const inputPath = path.resolve(projectPath, config.input);

  if (!fs.existsSync(inputPath)) {
    console.error(`Token file not found: ${inputPath}`);
    process.exit(1);
  }

  console.log('Parsing tokens...');
  const tokens = TokenParser.parse(inputPath, { validate: true, expandReferences: true });

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

  for (const { format, outputPath } of formats.map((f) => ({ format: f.format, outputPath: f.path }))) {
    if (!outputPath) continue;

    const fullPath = path.resolve(projectPath, outputPath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const options: TokenExportOptions = {
      format: format!,
      prefix: config.prefix || 'hf',
      selector: config.selector || ':root',
      variables: format === 'js' || format === 'ts',
      layer: format === 'css' ? config.layer : undefined,
    };

    const content = TokenExporter.export(tokens, options);
    fs.writeFileSync(fullPath, content);
    console.log(`Generated ${format!.toUpperCase()}: ${outputPath}`);
  }

  const shouldResponsive =
    config.responsive !== false && Boolean(config.output.css || config.output.responsiveCss);
  if (shouldResponsive) {
    const prefix = config.prefix || 'hf';
    const responsiveCss = [
      ResponsiveTokens.generateResponsiveCSS(tokens, config.breakpoints ?? [], prefix),
      ResponsiveTokens.generateStateCSS(tokens, prefix),
    ]
      .filter(Boolean)
      .join('\n\n');

    const responsivePath =
      config.output.responsiveCss ||
      (config.output.css
        ? path.join(path.dirname(config.output.css), 'tokens.responsive.css')
        : 'dist/tokens.responsive.css');
    const fullResponsivePath = path.resolve(projectPath, responsivePath);
    fs.mkdirSync(path.dirname(fullResponsivePath), { recursive: true });
    fs.writeFileSync(fullResponsivePath, responsiveCss);
    console.log(`Generated responsive CSS: ${responsivePath}`);
  }

  console.log('\nBuild complete!');
}
