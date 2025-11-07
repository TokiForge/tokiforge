import type { DesignTokens, TokenValue } from './types';

export interface TokenUsage {
  path: string;
  count: number;
  size: number;
  format: string;
}

export interface BundleImpact {
  totalSize: number;
  tokenCount: number;
  unusedTokens: string[];
  largestTokens: Array<{ path: string; size: number }>;
}

export interface AnalyticsReport {
  usage: Map<string, TokenUsage>;
  bundle: BundleImpact;
  coverage: number;
}

export class TokenAnalytics {
  private usageMap: Map<string, TokenUsage> = new Map();

  trackUsage(path: string, format: string = 'css'): void {
    const existing = this.usageMap.get(path);
    if (existing) {
      existing.count++;
    } else {
      this.usageMap.set(path, {
        path,
        count: 1,
        size: this.estimateSize(path, format),
        format,
      });
    }
  }

  getUsageReport(tokens: DesignTokens): AnalyticsReport {
    const allTokens = this.getAllTokenPaths(tokens);
    const unusedTokens = allTokens.filter((path) => !this.usageMap.has(path));

    const bundle = this.calculateBundleImpact(tokens, unusedTokens);
    const coverage = allTokens.length > 0 
      ? ((allTokens.length - unusedTokens.length) / allTokens.length) * 100 
      : 0;

    return {
      usage: this.usageMap,
      bundle,
      coverage: Math.round(coverage * 100) / 100,
    };
  }

  generateReport(tokens: DesignTokens): string {
    const report = this.getUsageReport(tokens);
    const lines: string[] = [];

    lines.push('Token Analytics Report');
    lines.push('='.repeat(50));
    lines.push('');

    lines.push('Usage Statistics:');
    lines.push(`  Total Tokens: ${report.usage.size + report.bundle.unusedTokens.length}`);
    lines.push(`  Used Tokens: ${report.usage.size}`);
    lines.push(`  Unused Tokens: ${report.bundle.unusedTokens.length}`);
    lines.push(`  Coverage: ${report.coverage}%`);
    lines.push('');

    if (report.usage.size > 0) {
      lines.push('Most Used Tokens:');
      const sortedUsage = Array.from(report.usage.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      for (const usage of sortedUsage) {
        lines.push(`  ${usage.path}: ${usage.count} uses (${usage.size} bytes)`);
      }
      lines.push('');
    }

    lines.push('Bundle Impact:');
    lines.push(`  Total Size: ${report.bundle.totalSize} bytes`);
    lines.push(`  Token Count: ${report.bundle.tokenCount}`);
    lines.push('');

    if (report.bundle.largestTokens.length > 0) {
      lines.push('Largest Tokens:');
      for (const token of report.bundle.largestTokens.slice(0, 10)) {
        lines.push(`  ${token.path}: ${token.size} bytes`);
      }
      lines.push('');
    }

    if (report.bundle.unusedTokens.length > 0) {
      lines.push('Unused Tokens:');
      for (const token of report.bundle.unusedTokens.slice(0, 20)) {
        lines.push(`  - ${token}`);
      }
      if (report.bundle.unusedTokens.length > 20) {
        lines.push(`  ... and ${report.bundle.unusedTokens.length - 20} more`);
      }
    }

    return lines.join('\n');
  }

  reset(): void {
    this.usageMap.clear();
  }

  private getAllTokenPaths(tokens: DesignTokens, prefix: string = ''): string[] {
    const paths: string[] = [];

    for (const key in tokens) {
      const value = tokens[key];
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

  private calculateBundleImpact(tokens: DesignTokens, unusedTokens: string[]): BundleImpact {
    const allTokens = this.getAllTokenPaths(tokens);
    const tokenSizes = new Map<string, number>();

    for (const path of allTokens) {
      const token = this.getTokenByPath(tokens, path);
      if (token) {
        const value = this.getTokenValue(token);
        const size = this.estimateTokenSize(path, value);
        tokenSizes.set(path, size);
      }
    }

    const totalSize = Array.from(tokenSizes.values()).reduce((sum, size) => sum + size, 0);
    const largestTokens = Array.from(tokenSizes.entries())
      .map(([path, size]) => ({ path, size }))
      .sort((a, b) => b.size - a.size);

    return {
      totalSize,
      tokenCount: allTokens.length,
      unusedTokens,
      largestTokens,
    };
  }

  private getTokenByPath(tokens: DesignTokens, path: string): TokenValue | null {
    const parts = path.split('.');
    let current: any = tokens;

    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return null;
      }
    }

    if (current && typeof current === 'object' && ('value' in current || '$value' in current || '$alias' in current)) {
      return current as TokenValue;
    }

    return null;
  }

  private getTokenValue(token: TokenValue): string | number {
    if (typeof token.value === 'string' || typeof token.value === 'number') {
      return token.value;
    }
    if (token.$value && (typeof token.$value === 'string' || typeof token.$value === 'number')) {
      return token.$value;
    }
    return '';
  }

  private estimateSize(path: string, format: string): number {
    const baseSize = path.length + 20;
    switch (format) {
      case 'css':
        return baseSize + 15;
      case 'js':
        return baseSize + 25;
      case 'ts':
        return baseSize + 30;
      default:
        return baseSize;
    }
  }

  private estimateTokenSize(path: string, value: string | number): number {
    const pathSize = path.length;
    const valueSize = String(value).length;
    const cssVarSize = `--hf-${path.replace(/\./g, '-')}: ${value};`.length;
    return pathSize + valueSize + cssVarSize + 50;
  }
}

