/**
 * TokiForge CLI: generate:changelog command
 * Generate token changelogs with version comparison and breaking changes detection
 */

import * as fs from 'node:fs';
import * as path from 'path';
import { compareTokens, detectBreakingChanges, type DiffResult } from './diff-utils.js';

export interface ChangelogOptions {
  from?: string;
  to?: string;
  format?: 'markdown' | 'json' | 'html';
  output?: string;
  includeBreaking?: boolean;
}

export interface VersionedTokens {
  version: string;
  date: string;
  tokens: Record<string, any>;
  hash?: string;
}

export interface ChangelogEntry {
  version: string;
  date: string;
  changes: {
    breaking: string[];
    added: string[];
    removed: string[];
    changed: string[];
    deprecated: string[];
  };
  stats: {
    additions: number;
    removals: number;
    modifications: number;
    breakingChanges: number;
  };
}

/**
 * Generate changelog from token versions
 */
export async function generateChangelogCommand(
  tokensDir: string,
  options: ChangelogOptions = {},
  projectPath: string = process.cwd()
): Promise<void> {
  const configPath = path.join(projectPath, 'tokiforge.config.json');

  if (!fs.existsSync(configPath)) {
    console.error('tokiforge.config.json not found. Run "tokiforge init" first.');
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  const tokenPath = path.resolve(projectPath, tokensDir || config.input);

  if (!fs.existsSync(tokenPath)) {
    console.error(`Token directory not found: ${tokenPath}`);
    process.exit(1);
  }

  console.log('📋 Generating changelog...\n');

  try {
    const versions = loadVersionedTokens(tokenPath);

    if (versions.length === 0) {
      console.error('No versioned token files found.');
      process.exit(1);
    }

    console.log(`Found ${versions.length} token versions\n`);

    // Generate changelog entries
    const changelog: ChangelogEntry[] = [];

    for (let i = 1; i < versions.length; i++) {
      const previousVersion = versions[i - 1];
      const currentVersion = versions[i];

      const entry = generateChangelogEntry(previousVersion, currentVersion);
      changelog.push(entry);
    }

    // Output based on format
    const format = options.format || 'markdown';
    let output = '';

    if (format === 'json') {
      output = JSON.stringify(changelog, null, 2);
    } else if (format === 'html') {
      output = generateHtmlChangelog(changelog);
    } else {
      output = generateMarkdownChangelog(changelog);
    }

    // Write to file or stdout
    if (options.output) {
      fs.writeFileSync(options.output, output);
      console.log(`📝 Changelog saved to: ${options.output}\n`);
    } else {
      console.log(output);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('❌ Changelog generation failed:', message);
    process.exit(1);
  }
}

/**
 * Load versioned token files from directory
 */
function loadVersionedTokens(tokensDir: string): VersionedTokens[] {
  const versions: VersionedTokens[] = [];

  // Look for tokens.json or tokens-*.json files
  const files = fs.readdirSync(tokensDir).filter(f => {
    return f === 'tokens.json' || /^tokens-v?\d+(\.\d+)*\.json$/.test(f);
  });

  files.forEach(file => {
    const filePath = path.join(tokensDir, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    // Extract version and date
    let version = content.version || extractVersionFromFilename(file);
    const date = content.date || new Date(fs.statSync(filePath).mtime).toISOString().split('T')[0];

    if (!version) {
      version = `v${versions.length + 1}`;
    }

    versions.push({
      version,
      date,
      tokens: content,
      hash: file
    });
  });

  // Sort by version
  return versions.sort((a, b) => compareVersions(a.version, b.version));
}

/**
 * Extract version number from filename
 */
function extractVersionFromFilename(filename: string): string {
  const match = filename.match(/v?(\d+(?:\.\d+)*)/);
  return match ? `v${match[1]}` : '';
}

/**
 * Compare semantic versions
 */
function compareVersions(a: string, b: string): number {
  const aParts = a.replace(/v/, '').split('.').map(Number);
  const bParts = b.replace(/v/, '').split('.').map(Number);

  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aPart = aParts[i] || 0;
    const bPart = bParts[i] || 0;
    if (aPart !== bPart) return aPart - bPart;
  }

  return 0;
}

/**
 * Generate a changelog entry for a version
 */
function generateChangelogEntry(
  previousVersion: VersionedTokens,
  currentVersion: VersionedTokens
): ChangelogEntry {
  const diff = compareTokens(previousVersion.tokens, currentVersion.tokens);
  const breakingChanges = detectBreakingChanges(diff);

  // Categorize changes
  const changes = categorizeChanges(diff, breakingChanges);

  return {
    version: currentVersion.version,
    date: currentVersion.date,
    changes,
    stats: {
      additions: diff.stats.totalAdded,
      removals: diff.stats.totalRemoved,
      modifications: diff.stats.totalChanged,
      breakingChanges: breakingChanges.length
    }
  };
}

/**
 * Categorize diff results into change types
 */
function categorizeChanges(
  diff: DiffResult,
  breakingChanges: string[]
): ChangelogEntry['changes'] {
  return {
    breaking: breakingChanges,
    added: diff.added,
    removed: diff.removed,
    changed: diff.changed.map((c: { path: string }) => c.path),
    deprecated: [] // Would need additional metadata to populate this
  };
}

/**
 * Generate markdown-formatted changelog
 */
function generateMarkdownChangelog(entries: ChangelogEntry[]): string {
  const lines: string[] = ['# Token Changelog', ''];

  entries.forEach(entry => {
    lines.push(`## ${entry.version} - ${entry.date}`);
    lines.push('');

    if (entry.changes.breaking.length > 0) {
      lines.push('### 🚨 Breaking Changes');
      entry.changes.breaking.forEach(change => {
        lines.push(`- ${change}`);
      });
      lines.push('');
    }

    if (entry.changes.added.length > 0) {
      lines.push('### ✨ Added');
      entry.changes.added.forEach(token => {
        lines.push(`- \`${token}\``);
      });
      lines.push('');
    }

    if (entry.changes.removed.length > 0) {
      lines.push('### 🗑️ Removed');
      entry.changes.removed.forEach(token => {
        lines.push(`- \`${token}\``);
      });
      lines.push('');
    }

    if (entry.changes.changed.length > 0) {
      lines.push('### 📝 Changed');
      entry.changes.changed.forEach(token => {
        lines.push(`- \`${token}\``);
      });
      lines.push('');
    }

    if (entry.changes.deprecated.length > 0) {
      lines.push('### ⚠️ Deprecated');
      entry.changes.deprecated.forEach(token => {
        lines.push(`- \`${token}\``);
      });
      lines.push('');
    }

    lines.push(`**Statistics**: +${entry.stats.additions} ~${entry.stats.modifications} -${entry.stats.removals}`);
    lines.push('');
    lines.push('---');
    lines.push('');
  });

  return lines.join('\n');
}

/**
 * Generate HTML-formatted changelog
 */
function generateHtmlChangelog(entries: ChangelogEntry[]): string {
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Token Changelog</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    h1 { color: #333; }
    h2 { color: #555; border-top: 3px solid #007bff; padding-top: 10px; margin-top: 30px; }
    h3 { color: #666; }
    .breaking { background: #fff3cd; padding: 10px; border-left: 4px solid #ffc107; margin: 10px 0; }
    .added { background: #d4edda; padding: 10px; border-left: 4px solid #28a745; margin: 10px 0; }
    .removed { background: #f8d7da; padding: 10px; border-left: 4px solid #dc3545; margin: 10px 0; }
    .changed { background: #d1ecf1; padding: 10px; border-left: 4px solid #17a2b8; margin: 10px 0; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
    .stats { color: #666; font-size: 0.9em; margin-top: 10px; }
  </style>
</head>
<body>
  <h1>📋 Token Changelog</h1>
`;

  entries.forEach(entry => {
    html += `<h2>${entry.version} - ${entry.date}</h2>`;

    if (entry.changes.breaking.length > 0) {
      html += `<h3>🚨 Breaking Changes</h3>
      <div class="breaking">
        <ul>`;
      entry.changes.breaking.forEach(change => {
        html += `<li>${change}</li>`;
      });
      html += `</ul></div>`;
    }

    if (entry.changes.added.length > 0) {
      html += `<h3>✨ Added</h3>
      <div class="added">
        <ul>`;
      entry.changes.added.forEach(token => {
        html += `<li><code>${token}</code></li>`;
      });
      html += `</ul></div>`;
    }

    if (entry.changes.removed.length > 0) {
      html += `<h3>🗑️ Removed</h3>
      <div class="removed">
        <ul>`;
      entry.changes.removed.forEach(token => {
        html += `<li><code>${token}</code></li>`;
      });
      html += `</ul></div>`;
    }

    if (entry.changes.changed.length > 0) {
      html += `<h3>📝 Changed</h3>
      <div class="changed">
        <ul>`;
      entry.changes.changed.forEach(token => {
        html += `<li><code>${token}</code></li>`;
      });
      html += `</ul></div>`;
    }

    html += `<div class="stats">
      <strong>Statistics:</strong> +${entry.stats.additions} ~${entry.stats.modifications} -${entry.stats.removals}
      ${entry.stats.breakingChanges > 0 ? `| 🚨 ${entry.stats.breakingChanges} breaking change(s)` : ''}
    </div>`;
  });

  html += `
</body>
</html>`;

  return html;
}
