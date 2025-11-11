#!/usr/bin/env node

import { Command } from 'commander';
import { initCommand } from './commands/init';
import { buildCommand } from './commands/build';
import { devCommand } from './commands/dev';
import { lintCommand } from './commands/lint';
import { tailwindCommand } from './commands/tailwind';
import { diffCommand } from './commands/diff';
import { validateCommand } from './commands/validate';
import { figmaDiffCommand } from './commands/figma-diff';
import { analyticsCommand } from './commands/analytics';
import { showSplash, showCompactSplash } from './splash';

const program = new Command();

program
  .name('tokiforge')
  .description('Modern Design Token & Theme Engine CLI')
  .version('1.1.0')
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
  .description('Compare two token files and show differences')
  .argument('[old]', 'Path to old token file')
  .argument('[new]', 'Path to new token file')
  .action((old, new_) => diffCommand(old, new_));

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
  .command('analytics')
  .description('Generate token usage analytics and bundle impact report')
  .action(() => analyticsCommand());

program.parse();

