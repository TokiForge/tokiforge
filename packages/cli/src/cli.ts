#!/usr/bin/env node

import { Command } from 'commander';
import { initCommand } from './commands/init';
import { buildCommand } from './commands/build';
import { devCommand } from './commands/dev';
import { lintCommand } from './commands/lint';

const program = new Command();

program
  .name('tokiforge')
  .description('Modern Design Token & Theme Engine CLI')
  .version('1.0.0');

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

