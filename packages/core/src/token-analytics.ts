import type { DesignTokens } from './types';

/** Typed traversal node for token trees */
type TokenNode = Record<string, unknown>;

export class TokenAnalytics {
  private usage: Map<string, Set<string>> = new Map();

  trackUsage(path: string, format?: string): void {
    if (!this.usage.has(path)) {
      this.usage.set(path, new Set());
    }
    if (format) {
      this.usage.get(path)?.add(format);
    }
  }

  getUsageReport(tokens: DesignTokens): {
    coverage: number;
    unused: string[];
    used: string[];
    total: number;
  } {
    const allPaths: string[] = [];

    const getAllPaths = (obj: TokenNode | unknown, path: string = ''): void => {
      if (typeof obj !== 'object' || obj === null) return;

      if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
          getAllPaths(obj[i] as TokenNode, `${path}[${i}]`);
        }
        return;
      }

      const node = obj as TokenNode;
      if ('value' in node) {
        allPaths.push(path || 'root');
      } else {
        for (const key of Object.keys(node)) {
          const newPath = path ? `${path}.${key}` : key;
          getAllPaths(node[key], newPath);
        }
      }
    };

    getAllPaths(tokens as TokenNode);

    const used = allPaths.filter((p) => this.usage.has(p));
    const unused = allPaths.filter((p) => !this.usage.has(p));
    const total = allPaths.length;
    const coverage = total > 0 ? (used.length / total) * 100 : 0;

    return {
      coverage: Math.round(coverage * 100) / 100,
      unused,
      used,
      total,
    };
  }

  reset(): void {
    this.usage.clear();
  }

  generateReport(tokens: DesignTokens): string {
    const report = this.getUsageReport(tokens);
    const lines: string[] = [];

    lines.push('Token Analytics Report');
    lines.push('='.repeat(50));
    lines.push('');
    lines.push(`Total Tokens: ${report.total}`);
    lines.push(`Used Tokens: ${report.used.length}`);
    lines.push(`Unused Tokens: ${report.unused.length}`);
    lines.push(`Coverage: ${report.coverage.toFixed(2)}%`);
    lines.push('');

    if (report.unused.length > 0) {
      lines.push(`Unused Tokens (${report.unused.length}):`);
      for (const p of report.unused) {
        lines.push(`  - ${p}`);
      }
      lines.push('');
    }

    return lines.join('\n');
  }
}
