#!/usr/bin/env node

import { Command } from 'commander';
import { initCommand } from './commands/init';
import { buildCommand } from './commands/build';
import { devCommand } from './commands/dev';
import { lintCommand } from './commands/lint';
import { tailwindCommand } from './commands/tailwind';
import { validateCommand } from './commands/validate';
import { figmaDiffCommand } from './commands/figma-diff';
import { figmaPullCommand } from './commands/figma-pull';
import { figmaPushCommand } from './commands/figma-push';
import { analyticsCommand } from './commands/analytics';
import { generateTypesCommand } from './commands/generate-types';
import { watchCommand } from './commands/watch';
import { migrateCommand } from './commands/migrate';
import { diffCommand as diffCommandEnhanced } from './commands/diff';
import { generateChangelogCommand } from './commands/changelog';
import { showSplash, showCompactSplash, getVersion } from './splash';

const program = new Command();

program
  .name('tokiforge')
  .description('Modern Design Token & Theme Engine CLI')
  .version(getVersion())
  .hook('preAction', (_thisCommand, actionCommand) => {
    if (!process.argv.includes('--help') && !process.argv.includes('-h') && actionCommand) {
      showCompactSplash();
    }
  });

if (process.argv.length === 2) {
  showSplash();
  program.help();
}

program
  .command('init')
  .description('Initialize TokiForge in your project')
  .action(() => initCommand());

program
  .command('build')
  .description('Build and export tokens to various formats')
  .action(() => buildCommand());

program
  .command('dev')
  .description('Start development server with theme preview')
  .action(() => devCommand());

program
  .command('lint')
  .description('Validate token consistency and accessibility')
  .action(() => lintCommand());

program
  .command('tailwind')
  .description('Generate Tailwind CSS config from tokens')
  .action(() => tailwindCommand());

program
  .command('diff')
  .description('Compare two token files with visual diff, change summary, and migration suggestions')
  .argument('[old]', 'Path to old token file')
  .argument('[new]', 'Path to new token file')
  .option('--format <type>', 'Output format (compact, detailed, json)', 'detailed')
  .option('--no-migrations', 'Skip migration suggestions')
  .option('--strict', 'Fail on breaking changes')
  .option('--output <file>', 'Write report to file')
  .action((old, new_, options) => diffCommandEnhanced(old, new_, {
    format: options.format,
    showMigrations: options.migrations,
    strict: options.strict,
    output: options.output
  }));

program
  .command('validate')
  .description('Validate tokens for CI/CD (checks syntax, accessibility, deprecations)')
  .option('--strict', 'Treat warnings as errors')
  .option('--no-accessibility', 'Skip accessibility checks')
  .option('--no-deprecated', 'Skip deprecation checks')
  .option('--figma', 'Check against Figma tokens')
  .option('--figma-token <token>', 'Figma access token')
  .option('--figma-file-key <key>', 'Figma file key')
  .option('--min-accessibility <level>', 'Minimum accessibility level (AA or AAA)', 'AA')
  .action((options) => validateCommand(process.cwd(), options));

program
  .command('figma:diff')
  .description('Compare Figma tokens with code tokens')
  .requiredOption('--token <token>', 'Figma access token')
  .requiredOption('--file-key <key>', 'Figma file key')
  .action((options) => figmaDiffCommand(options.token, options.fileKey));

program
  .command('figma:pull')
  .description('Pull tokens from Figma and save to a local file')
  .requiredOption('--token <token>', 'Figma access token')
  .requiredOption('--file-key <key>', 'Figma file key')
  .option('--output <file>', 'Output tokens file (defaults to tokiforge config input path)')
  .action((options) => figmaPullCommand(options.token, options.fileKey, options.output));

program
  .command('figma:push')
  .description('Push local tokens to Figma')
  .requiredOption('--token <token>', 'Figma access token')
  .requiredOption('--file-key <key>', 'Figma file key')
  .option('--input <file>', 'Input tokens file (defaults to tokiforge config input path)')
  .action((options) => figmaPushCommand(options.token, options.fileKey, options.input));

program
  .command('analytics')
  .description('Generate token usage analytics and bundle impact report')
  .option('--format <format>', 'Export format: json, html, csv, markdown', 'json')
  .option('--output <file>', 'Output file path')
  .action((options) => analyticsCommand(process.cwd(), { format: options.format as any, output: options.output }));

program
  .command('generate:types')
  .description('Generate TypeScript type definitions for tokens')
  .argument('[input]', 'Input tokens file', 'tokens.json')
  .argument('[output]', 'Output TypeScript file', 'tokens.d.ts')
  .action((input, output) => generateTypesCommand(input, output));

program
  .command('watch')
  .description('Watch token files for changes and regenerate exports')
  .argument('[input]', 'Input tokens file to watch', 'tokens.json')
  .argument('[output]', 'Output directory for generated files', 'tokens.generated')
  .option('--debounce <ms>', 'Debounce time in milliseconds', '300')
  .action((input, output, options) => watchCommand(input, output, parseInt(options.debounce)));

program
  .command('migrate')
  .description('Migrate tokens from another format (style-dictionary, figma-tokens, theo)')
  .argument('[input]', 'Input tokens file', 'tokens.json')
  .option('--from <format>', 'Source format (style-dictionary, figma-tokens, theo)', 'style-dictionary')
  .option('--to <file>', 'Output file (defaults to input file)')
  .option('--no-backup', 'Skip creating backup file')
  .action((input, options) => migrateCommand(input, {
    from: options.from,
    to: options.to,
    backup: options.backup,
  }));

program
  .command('generate:changelog')
  .description('Generate token changelog with version comparison and breaking changes detection')
  .argument('[input]', 'Input tokens directory with version history', 'tokens')
  .option('--format <type>', 'Output format (markdown, json, html)', 'markdown')
  .option('--output <file>', 'Write changelog to file')
  .action((input, options) => generateChangelogCommand(input, {
    format: options.format,
    output: options.output
  }));

program.parse();

