#!/usr/bin/env node

import { Command } from 'commander';
import { initCommand } from './commands/init';
import { buildCommand } from './commands/build';
import { devCommand } from './commands/dev';
import { lintCommand } from './commands/lint';
import { showSplash, showCompactSplash } from './splash';

const program = new Command();

program
  .name('tokiforge')
  .description('Modern Design Token & Theme Engine CLI')
  .version('0.1.0')
  .hook('preAction', (_thisCommand, actionCommand) => {
    // Show compact splash for commands (except when showing help)
    if (!process.argv.includes('--help') && !process.argv.includes('-h') && actionCommand) {
      showCompactSplash();
    }
  });

// Show full splash screen when no command is provided
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

program.parse();

