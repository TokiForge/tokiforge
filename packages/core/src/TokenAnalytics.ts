import type { DesignTokens, TokenValue } from './types';

interface UsageData {
  path: string;
  count: number;
  formats: Set<string>;
  lastUsed?: Date;
}

export class TokenAnalytics {
  private usage: Map<string, UsageData> = new Map();

  trackUsage(path: string, format?: string): void {
    const existing = this.usage.get(path);
    if (existing) {
      existing.count++;
      if (format) {
        existing.formats.add(format);
      }
      existing.lastUsed = new Date();
    } else {
      this.usage.set(path, {
        path,
        count: 1,
        formats: new Set(format ? [format] : []),
        lastUsed: new Date(),
      });
    }
  }

  getUsageReport(tokens: DesignTokens): {
    total: number;
    used: number;
    unused: number;
    usage: Array<{ path: string; count: number; formats: string[]; lastUsed?: Date }>;
    unusedTokens: string[];
  } {
    const allTokens = this.getAllTokenPaths(tokens);
    const usedTokens = Array.from(this.usage.keys());
    const unusedTokens = allTokens.filter(path => !usedTokens.includes(path));

    return {
      total: allTokens.length,
      used: usedTokens.length,
      unused: unusedTokens.length,
      usage: Array.from(this.usage.values()).map(data => ({
        path: data.path,
        count: data.count,
        formats: Array.from(data.formats),
        lastUsed: data.lastUsed,
      })),
      unusedTokens,
    };
  }

  generateReport(tokens: DesignTokens): string {
    const report = this.getUsageReport(tokens);
    const lines: string[] = [];

    lines.push('Token Usage Report');
    lines.push('='.repeat(50));
    lines.push(`Total Tokens: ${report.total}`);
    lines.push(`Used Tokens: ${report.used}`);
    lines.push(`Unused Tokens: ${report.unused}`);
    lines.push('');

    if (report.unusedTokens.length > 0) {
      lines.push('Unused Tokens:');
      report.unusedTokens.forEach(path => {
        lines.push(`  - ${path}`);
      });
      lines.push('');
    }

    if (report.usage.length > 0) {
      lines.push('Usage Statistics:');
      report.usage
        .sort((a, b) => b.count - a.count)
        .slice(0, 20)
        .forEach(usage => {
          lines.push(`  ${usage.path}: ${usage.count} uses (${usage.formats.join(', ')})`);
        });
    }

    return lines.join('\n');
  }

  reset(): void {
    this.usage.clear();
  }

  private getAllTokenPaths(tokens: DesignTokens, prefix: string = ''): string[] {
    const paths: string[] = [];

    for (const [key, value] of Object.entries(tokens)) {
      const path = prefix ? `${prefix}.${key}` : key;

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        if ('value' in value || '$value' in value || '$alias' in value) {
          paths.push(path);
        } else {
          paths.push(...this.getAllTokenPaths(value as DesignTokens, path));
        }
      }
    }

    return paths;
  }
}

