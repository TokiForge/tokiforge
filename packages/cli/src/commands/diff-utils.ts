/**
 * Utilities for enhanced token diff visualization and analysis
 */

import * as fs from 'fs';

export interface DiffResult {
  added: string[];
  removed: string[];
  changed: Array<{ path: string; old: string; new: string }>;
  modified: Array<{ path: string; changes: Record<string, { old: any; new: any }> }>;
  stats: {
    totalAdded: number;
    totalRemoved: number;
    totalChanged: number;
    breakingChanges: number;
  };
}

export interface MigrationSuggestion {
  type: 'renamed' | 'replaced' | 'deprecated' | 'removed' | 'restructured';
  oldPath: string;
  newPath?: string;
  reason: string;
  action: string;
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
  };
}

/**
 * Detect breaking changes based on diff analysis
 */
export function detectBreakingChanges(diff: DiffResult): string[] {
  const breakingChanges: string[] = [];

  // Removals are breaking changes
  diff.removed.forEach(path => {
    breakingChanges.push(`Removed token: ${path}`);
  });

  // Type changes in color tokens are breaking
  diff.modified.forEach(({ path, changes }) => {
    if (path.includes('color') && changes.type) {
      breakingChanges.push(`Breaking type change in ${path}: ${changes.type.old} → ${changes.type.new}`);
    }
    if (path.includes('spacing') && changes.value) {
      const oldVal = parseFloat(String(changes.value.old));
      const newVal = parseFloat(String(changes.value.new));
      if (Math.abs(oldVal - newVal) > oldVal * 0.2) {
        breakingChanges.push(`Significant value change in ${path}: ${changes.value.old} → ${changes.value.new}`);
      }
    }
  });

  return breakingChanges;
}

/**
 * Generate migration suggestions based on diff
 */
export function generateMigrationSuggestions(diff: DiffResult, oldTokens: Record<string, any>, newTokens: Record<string, any>): MigrationSuggestion[] {
  const suggestions: MigrationSuggestion[] = [];
  const usedOldTokens = new Set(Object.keys(oldTokens));

  // Find renamed tokens by similar structure/values
  diff.removed.forEach(oldPath => {
    const oldToken = getNestedValue(oldTokens, oldPath);
    
    diff.added.forEach(newPath => {
      const newToken = getNestedValue(newTokens, newPath);
      
      // Check if it's likely a rename (similar value)
      if (oldToken === newToken) {
        suggestions.push({
          type: 'renamed',
          oldPath,
          newPath,
          reason: `Token appears to be renamed from ${oldPath} to ${newPath}`,
          action: `Update references: ${oldPath} → ${newPath}`
        });
      }
    });
  });

  // Find replacements (e.g., color.primary → color.brand.primary)
  diff.removed.forEach(oldPath => {
    const oldToken = getNestedValue(oldTokens, oldPath);
    
    diff.added.forEach(newPath => {
      if (newPath.includes(oldPath.split('.').pop()!) && 
          JSON.stringify(oldToken) === JSON.stringify(getNestedValue(newTokens, newPath))) {
        suggestions.push({
          type: 'replaced',
          oldPath,
          newPath,
          reason: `Token structure reorganized`,
          action: `Replace: ${oldPath} → ${newPath}`
        });
      }
    });
  });

  // Suggest deprecations for changed but still functional tokens
  diff.changed.forEach(({ path }) => {
    if (diff.added.some(addedPath => addedPath.includes(path.split('.')[0]))) {
      suggestions.push({
        type: 'deprecated',
        oldPath: path,
        reason: 'Token exists but newer version available',
        action: `Consider using the new token structure`
      });
    }
  });

  return suggestions;
}

/**
 * Format diff for visual console output
 */
export function formatDiffOutput(diff: DiffResult, format: 'compact' | 'detailed' = 'detailed'): string {
  let output = '';

  if (format === 'compact') {
    output += `\n📊 Token Diff Summary:\n`;
    output += `  ➕ Added: ${diff.stats.totalAdded}\n`;
    output += `  ➖ Removed: ${diff.stats.totalRemoved}\n`;
    output += `  ✏️  Changed: ${diff.stats.totalChanged}\n`;
    output += `  ⚠️  Breaking Changes: ${diff.stats.breakingChanges}\n`;
  } else {
    output += `\n${'='.repeat(60)}\n`;
    output += `  📊 Token Diff Report\n`;
    output += `${'='.repeat(60)}\n\n`;

    // Added section
    if (diff.added.length > 0) {
      output += `✨ Added Tokens (${diff.added.length}):\n`;
      diff.added.slice(0, 10).forEach(path => {
        output += `   ✅ ${path}\n`;
      });
      if (diff.added.length > 10) {
        output += `   ... and ${diff.added.length - 10} more\n`;
      }
      output += '\n';
    }

    // Removed section
    if (diff.removed.length > 0) {
      output += `🗑️  Removed Tokens (${diff.removed.length}):\n`;
      diff.removed.slice(0, 10).forEach(path => {
        output += `   ❌ ${path}\n`;
      });
      if (diff.removed.length > 10) {
        output += `   ... and ${diff.removed.length - 10} more\n`;
      }
      output += '\n';
    }

    // Changed section
    if (diff.changed.length > 0) {
      output += `📝 Changed Tokens (${diff.changed.length}):\n`;
      diff.changed.slice(0, 10).forEach(({ path, old: oldVal, new: newVal }) => {
        output += `   🔄 ${path}\n`;
        output += `      ${oldVal} → ${newVal}\n`;
      });
      if (diff.changed.length > 10) {
        output += `   ... and ${diff.changed.length - 10} more\n`;
      }
      output += '\n';
    }

    // Summary statistics
    output += `${'─'.repeat(60)}\n`;
    output += `Summary:\n`;
    output += `  Total Changes: ${diff.stats.totalAdded + diff.stats.totalRemoved + diff.stats.totalChanged}\n`;
    output += `  Breaking Changes: ${diff.stats.breakingChanges}\n`;
    output += `${'='.repeat(60)}\n`;
  }

  return output;
}

/**
 * Format migration suggestions for console output
 */
export function formatMigrationSuggestions(suggestions: MigrationSuggestion[]): string {
  if (suggestions.length === 0) {
    return '✅ No migration suggestions needed.\n';
  }

  let output = `\n🔄 Migration Suggestions (${suggestions.length}):\n`;
  output += `${'─'.repeat(60)}\n`;

  suggestions.forEach((suggestion, index) => {
    const icons: Record<string, string> = {
      renamed: '↪️',
      replaced: '🔀',
      deprecated: '⚠️',
      removed: '❌',
      restructured: '🔧'
    };

    output += `\n${index + 1}. ${icons[suggestion.type]} ${suggestion.type.toUpperCase()}\n`;
    output += `   Path: ${suggestion.oldPath}`;
    if (suggestion.newPath) {
      output += ` → ${suggestion.newPath}`;
    }
    output += '\n';
    output += `   Reason: ${suggestion.reason}\n`;
    output += `   Action: ${suggestion.action}\n`;
  });

  output += `\n${'─'.repeat(60)}\n`;
  return output;
}

/**
 * Generate color-coded diff visualization
 */
export function formatColorDiff(path: string, oldValue: string, newValue: string): string {
  const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    dim: '\x1b[2m'
  };

  return `${colors.blue}${path}${colors.reset}\n` +
    `  ${colors.red}─ ${oldValue}${colors.reset}\n` +
    `  ${colors.green}+ ${newValue}${colors.reset}`;
}

/**
 * Get nested value from object using dot notation
 */
export function getNestedValue(obj: Record<string, any>, path: string): any {
  return path.split('.').reduce((current, prop) => current?.[prop], obj);
}

/**
 * Set nested value in object using dot notation
 */
export function setNestedValue(obj: Record<string, any>, path: string, value: any): void {
  const parts = path.split('.');
  const last = parts.pop()!;
  const target = parts.reduce((current, prop) => {
    if (!current[prop]) current[prop] = {};
    return current[prop];
  }, obj);
  target[last] = value;
}

/**
 * Compare two token objects and generate detailed diff
 */
export function compareTokens(oldTokens: Record<string, any>, newTokens: Record<string, any>): DiffResult {
  const added: string[] = [];
  const removed: string[] = [];
  const changed: Array<{ path: string; old: string; new: string }> = [];
  const modified: Array<{ path: string; changes: Record<string, { old: any; new: any }> }> = [];

  const oldPaths = new Set(flattenKeys(oldTokens));
  const newPaths = new Set(flattenKeys(newTokens));

  // Find added
  newPaths.forEach(path => {
    if (!oldPaths.has(path)) {
      added.push(path);
    }
  });

  // Find removed
  oldPaths.forEach(path => {
    if (!newPaths.has(path)) {
      removed.push(path);
    }
  });

  // Find changed
  oldPaths.forEach(path => {
    if (newPaths.has(path)) {
      const oldVal = getNestedValue(oldTokens, path);
      const newVal = getNestedValue(newTokens, path);
      
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changed.push({
          path,
          old: JSON.stringify(oldVal),
          new: JSON.stringify(newVal)
        });
      }
    }
  });

  const breakingChanges = detectBreakingChanges({ added, removed, changed, modified, stats: { totalAdded: 0, totalRemoved: 0, totalChanged: 0, breakingChanges: 0 } });

  return {
    added,
    removed,
    changed,
    modified,
    stats: {
      totalAdded: added.length,
      totalRemoved: removed.length,
      totalChanged: changed.length,
      breakingChanges: breakingChanges.length
    }
  };
}

/**
 * Flatten nested object keys to dot notation
 */
export function flattenKeys(obj: Record<string, any>, prefix = ''): string[] {
  const keys: string[] = [];

  Object.entries(obj).forEach(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      keys.push(...flattenKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  });

  return keys;
}
