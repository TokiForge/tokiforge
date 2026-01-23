import * as fs from 'fs';
import * as path from 'path';
import {
  compareTokens,
  formatDiffOutput,
  formatMigrationSuggestions,
  generateMigrationSuggestions,
  detectBreakingChanges,
  type DiffResult,
  type MigrationSuggestion
} from './diff-utils.js';

export interface DiffOptions {
  format?: 'compact' | 'detailed' | 'json';
  showMigrations?: boolean;
  strict?: boolean;
  output?: string;
}

export async function diffCommand(
  oldPath?: string,
  newPath?: string,
  options: DiffOptions = {},
  projectPath: string = process.cwd()
): Promise<void> {
  const configPath = path.join(projectPath, 'tokiforge.config.json');

  if (!fs.existsSync(configPath)) {
    console.error('tokiforge.config.json not found. Run "tokiforge init" first.');
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

  const oldTokenPath = oldPath || path.resolve(projectPath, config.input);
  const newTokenPath = newPath || path.resolve(projectPath, config.input);

  if (!fs.existsSync(oldTokenPath)) {
    console.error(`Old token file not found: ${oldTokenPath}`);
    process.exit(1);
  }

  if (!fs.existsSync(newTokenPath)) {
    console.error(`New token file not found: ${newTokenPath}`);
    process.exit(1);
  }

  const format = options.format || 'detailed';
  const showMigrations = options.showMigrations !== false;
  const strict = options.strict || false;

  console.log('🔍 Comparing tokens...\n');
  console.log(`📁 Old: ${oldTokenPath}`);
  console.log(`📁 New: ${newTokenPath}\n`);

  try {
    const oldTokens = JSON.parse(fs.readFileSync(oldTokenPath, 'utf-8'));
    const newTokens = JSON.parse(fs.readFileSync(newTokenPath, 'utf-8'));

    const diff = compareTokens(oldTokens, newTokens);

    if (diff.stats.totalAdded === 0 && diff.stats.totalRemoved === 0 && diff.stats.totalChanged === 0) {
      console.log('✅ No changes detected\n');
      return;
    }

    // Output based on format
    if (format === 'json') {
      outputJsonDiff(diff);
    } else if (format === 'compact') {
      console.log(formatDiffOutput(diff, 'compact'));
    } else {
      console.log(formatDiffOutput(diff, 'detailed'));
    }

    // Generate and display migration suggestions
    if (showMigrations) {
      const suggestions = generateMigrationSuggestions(diff, oldTokens, newTokens);
      if (suggestions.length > 0) {
        console.log(formatMigrationSuggestions(suggestions));
      }
    }

    // Detect and warn about breaking changes
    const breakingChanges = detectBreakingChanges(diff);
    if (breakingChanges.length > 0) {
      console.log(`\n⚠️  Breaking Changes Detected (${breakingChanges.length}):\n`);
      breakingChanges.forEach((change: string) => {
        console.log(`  • ${change}`);
      });
      console.log('');

      if (strict) {
        console.error('\n❌ Strict mode enabled. Failing due to breaking changes.');
        process.exit(1);
      }
    }

    // Write output to file if specified
    if (options.output) {
      const suggestions: MigrationSuggestion[] = [];
      const report = generateReport(diff, breakingChanges, suggestions);
      fs.writeFileSync(options.output, report);
      console.log(`📝 Report saved to: ${options.output}\n`);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('❌ Diff failed:', message);
    process.exit(1);
  }
}

/**
 * Output diff as JSON
 */
function outputJsonDiff(diff: DiffResult): void {
  console.log(JSON.stringify(diff, null, 2));
}

/**
 * Generate a comprehensive diff report
 */
function generateReport(
  diff: DiffResult,
  breakingChanges: string[],
  suggestions: MigrationSuggestion[]
): string {
  const lines: string[] = [
    '# Token Diff Report',
    `Generated: ${new Date().toISOString()}`,
    '',
    '## Summary',
    `- Added: ${diff.stats.totalAdded}`,
    `- Removed: ${diff.stats.totalRemoved}`,
    `- Changed: ${diff.stats.totalChanged}`,
    `- Breaking Changes: ${diff.stats.breakingChanges}`,
    ''
  ];

  if (diff.added.length > 0) {
    lines.push('## Added Tokens');
    diff.added.forEach((token: string) => lines.push(`- ${token}`));
    lines.push('');
  }

  if (diff.removed.length > 0) {
    lines.push('## Removed Tokens');
    diff.removed.forEach((token: string) => lines.push(`- ${token}`));
    lines.push('');
  }

  if (diff.changed.length > 0) {
    lines.push('## Changed Tokens');
    diff.changed.forEach(({ path: tokenPath, old: oldVal, new: newVal }: { path: string; old: string; new: string }) => {
      lines.push(`- ${tokenPath}: ${oldVal} → ${newVal}`);
    });
    lines.push('');
  }

  if (breakingChanges.length > 0) {
    lines.push('## Breaking Changes');
    breakingChanges.forEach(change => lines.push(`- ⚠️  ${change}`));
    lines.push('');
  }

  if (suggestions.length > 0) {
    lines.push('## Migration Suggestions');
    suggestions.forEach(suggestion => {
      lines.push(`- ${suggestion.type.toUpperCase()}: ${suggestion.oldPath}`);
      if (suggestion.newPath) lines.push(`  → ${suggestion.newPath}`);
      lines.push(`  Action: ${suggestion.action}`);
    });
  }

  return lines.join('\n');
}

