import type { DesignTokens } from './types';
import { TokenAnalytics } from './token-analytics';

export interface AnalyticsReport {
  timestamp: string;
  coverage: number;
  unused: string[];
  used: string[];
  total: number;
  byType: {
    color: number;
    spacing: number;
    typography: number;
    other: number;
  };
  byFormat: Map<string, number>;
  bundleSize: {
    estimated: number;
    byType: Record<string, number>;
  };
}

export interface TrendDataPoint {
  timestamp: string;
  coverage: number;
  totalTokens: number;
  usedTokens: number;
  bundleSize: number;
}

export interface ComparisonReport {
  baseline: AnalyticsReport;
  current: AnalyticsReport;
  changes: {
    coverageChange: number;
    tokenCountChange: number;
    newTokens: string[];
    removedTokens: string[];
    bundleSizeChange: number;
  };
}

export type ExportFormat = 'html' | 'csv' | 'markdown' | 'json';

export class AnalyticsReporter {
  private trends: TrendDataPoint[] = [];

  /**
   * Generate a comprehensive analytics report
   */
  generateReport(tokens: DesignTokens, analytics: TokenAnalytics): AnalyticsReport {
    const baseReport = analytics.getUsageReport(tokens);
    const byType = this.analyzeTokensByType(tokens);
    const byFormat = this.analyzeTokensByFormat(analytics);
    const bundleSize = this.estimateBundleSize(tokens);

    return {
      timestamp: new Date().toISOString(),
      coverage: baseReport.coverage,
      unused: baseReport.unused,
      used: baseReport.used,
      total: baseReport.total,
      byType,
      byFormat,
      bundleSize,
    };
  }

  /**
   * Track analytics over time for trend analysis
   */
  trackTrend(report: AnalyticsReport): void {
    this.trends.push({
      timestamp: report.timestamp,
      coverage: report.coverage,
      totalTokens: report.total,
      usedTokens: report.used.length,
      bundleSize: report.bundleSize.estimated,
    });

    // Keep only last 30 data points
    if (this.trends.length > 30) {
      this.trends = this.trends.slice(-30);
    }
  }

  /**
   * Get trend data for visualization
   */
  getTrends(): TrendDataPoint[] {
    return [...this.trends];
  }

  /**
   * Compare two analytics reports
   */
  compareReports(baseline: AnalyticsReport, current: AnalyticsReport): ComparisonReport {
    const coverageChange = current.coverage - baseline.coverage;
    const tokenCountChange = current.total - baseline.total;
    const bundleSizeChange = current.bundleSize.estimated - baseline.bundleSize.estimated;

    const baselineSet = new Set(baseline.used);
    const currentSet = new Set(current.used);

    const newTokens = current.used.filter((token) => !baselineSet.has(token));
    const removedTokens = baseline.used.filter((token) => !currentSet.has(token));

    return {
      baseline,
      current,
      changes: {
        coverageChange,
        tokenCountChange,
        newTokens,
        removedTokens,
        bundleSizeChange,
      },
    };
  }

  /**
   * Export report in various formats
   */
  export(report: AnalyticsReport, format: ExportFormat): string {
    switch (format) {
      case 'html':
        return this.generateHTMLReport(report);
      case 'csv':
        return this.generateCSVReport(report);
      case 'markdown':
        return this.generateMarkdownReport(report);
      case 'json':
        return this.generateJSONReport(report);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Generate HTML report with styling and charts
   */
  private generateHTMLReport(report: AnalyticsReport): string {
    const date = new Date(report.timestamp).toLocaleString();
    const coverageColor = report.coverage >= 80 ? '#10B981' : report.coverage >= 50 ? '#F59E0B' : '#EF4444';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Token Analytics Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #F9FAFB;
      padding: 40px 20px;
      color: #1F2937;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%);
      color: white;
      padding: 40px;
    }
    .header h1 { font-size: 32px; margin-bottom: 8px; }
    .header .date { opacity: 0.9; font-size: 14px; }
    .metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      padding: 40px;
    }
    .metric-card {
      background: #F9FAFB;
      border-radius: 12px;
      padding: 24px;
      border-left: 4px solid #7C3AED;
    }
    .metric-value {
      font-size: 36px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .metric-label {
      font-size: 14px;
      color: #6B7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .coverage-bar {
      height: 40px;
      background: #E5E7EB;
      border-radius: 20px;
      overflow: hidden;
      margin: 20px 40px;
      position: relative;
    }
    .coverage-fill {
      height: 100%;
      background: ${coverageColor};
      transition: width 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 16px;
      color: white;
      font-weight: 600;
    }
    .section {
      padding: 40px;
      border-top: 1px solid #E5E7EB;
    }
    .section h2 {
      font-size: 24px;
      margin-bottom: 24px;
      color: #1F2937;
    }
    .chart {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .chart-item {
      background: #F9FAFB;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
    }
    .chart-bar {
      height: 100px;
      background: #E5E7EB;
      border-radius: 8px;
      margin-bottom: 12px;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      overflow: hidden;
    }
    .chart-bar-fill {
      width: 60%;
      background: #7C3AED;
      border-radius: 4px 4px 0 0;
      transition: height 0.3s ease;
    }
    .chart-label {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 4px;
    }
    .chart-value {
      font-size: 12px;
      color: #6B7280;
    }
    .token-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 12px;
      max-height: 400px;
      overflow-y: auto;
    }
    .token-item {
      background: #F3F4F6;
      padding: 12px 16px;
      border-radius: 6px;
      font-family: 'Monaco', 'Consolas', monospace;
      font-size: 13px;
      color: #374151;
    }
    .bundle-size {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px;
      background: #FEF3C7;
      border-radius: 8px;
      border-left: 4px solid #F59E0B;
    }
    .bundle-size-icon {
      font-size: 32px;
    }
    .bundle-size-text {
      flex: 1;
    }
    .bundle-size-value {
      font-size: 24px;
      font-weight: 700;
      color: #92400E;
    }
    .bundle-size-label {
      font-size: 14px;
      color: #78350F;
    }
    @media print {
      body { background: white; padding: 0; }
      .container { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Token Analytics Report</h1>
      <div class="date">Generated on ${date}</div>
    </div>

    <div class="coverage-bar">
      <div class="coverage-fill" style="width: ${report.coverage}%">
        ${report.coverage.toFixed(1)}%
      </div>
    </div>

    <div class="metrics">
      <div class="metric-card">
        <div class="metric-value">${report.total}</div>
        <div class="metric-label">Total Tokens</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${report.used.length}</div>
        <div class="metric-label">Used Tokens</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${report.unused.length}</div>
        <div class="metric-label">Unused Tokens</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${report.coverage.toFixed(1)}%</div>
        <div class="metric-label">Coverage</div>
      </div>
    </div>

    <div class="section">
      <h2>📦 Estimated Bundle Size</h2>
      <div class="bundle-size">
        <div class="bundle-size-icon">📦</div>
        <div class="bundle-size-text">
          <div class="bundle-size-value">${this.formatBytes(report.bundleSize.estimated)}</div>
          <div class="bundle-size-label">Estimated CSS bundle size</div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>🎨 Tokens by Type</h2>
      <div class="chart">
        <div class="chart-item">
          <div class="chart-bar">
            <div class="chart-bar-fill" style="height: ${(report.byType.color / report.total) * 100}%"></div>
          </div>
          <div class="chart-label">Colors</div>
          <div class="chart-value">${report.byType.color} tokens</div>
        </div>
        <div class="chart-item">
          <div class="chart-bar">
            <div class="chart-bar-fill" style="height: ${(report.byType.spacing / report.total) * 100}%"></div>
          </div>
          <div class="chart-label">Spacing</div>
          <div class="chart-value">${report.byType.spacing} tokens</div>
        </div>
        <div class="chart-item">
          <div class="chart-bar">
            <div class="chart-bar-fill" style="height: ${(report.byType.typography / report.total) * 100}%"></div>
          </div>
          <div class="chart-label">Typography</div>
          <div class="chart-value">${report.byType.typography} tokens</div>
        </div>
        <div class="chart-item">
          <div class="chart-bar">
            <div class="chart-bar-fill" style="height: ${(report.byType.other / report.total) * 100}%"></div>
          </div>
          <div class="chart-label">Other</div>
          <div class="chart-value">${report.byType.other} tokens</div>
        </div>
      </div>
    </div>

    ${report.unused.length > 0 ? `
    <div class="section">
      <h2>⚠️ Unused Tokens (${report.unused.length})</h2>
      <div class="token-list">
        ${report.unused.map(token => `<div class="token-item">${token}</div>`).join('\n        ')}
      </div>
    </div>
    ` : ''}

    ${report.used.length > 0 ? `
    <div class="section">
      <h2>✅ Used Tokens (${report.used.length})</h2>
      <div class="token-list">
        ${report.used.slice(0, 50).map(token => `<div class="token-item">${token}</div>`).join('\n        ')}
        ${report.used.length > 50 ? `<div class="token-item" style="opacity: 0.6;">... and ${report.used.length - 50} more</div>` : ''}
      </div>
    </div>
    ` : ''}
  </div>
</body>
</html>`;
  }

  /**
   * Generate CSV report for data analysis
   */
  private generateCSVReport(report: AnalyticsReport): string {
    const lines: string[] = [];
    
    // Summary section
    lines.push('# Token Analytics Summary');
    lines.push(`Timestamp,${report.timestamp}`);
    lines.push(`Total Tokens,${report.total}`);
    lines.push(`Used Tokens,${report.used.length}`);
    lines.push(`Unused Tokens,${report.unused.length}`);
    lines.push(`Coverage,${report.coverage.toFixed(2)}%`);
    lines.push(`Bundle Size,${report.bundleSize.estimated}`);
    lines.push('');

    // Tokens by type
    lines.push('# Tokens by Type');
    lines.push('Type,Count,Percentage');
    lines.push(`Color,${report.byType.color},${((report.byType.color / report.total) * 100).toFixed(2)}%`);
    lines.push(`Spacing,${report.byType.spacing},${((report.byType.spacing / report.total) * 100).toFixed(2)}%`);
    lines.push(`Typography,${report.byType.typography},${((report.byType.typography / report.total) * 100).toFixed(2)}%`);
    lines.push(`Other,${report.byType.other},${((report.byType.other / report.total) * 100).toFixed(2)}%`);
    lines.push('');

    // Unused tokens
    if (report.unused.length > 0) {
      lines.push('# Unused Tokens');
      lines.push('Token Path');
      report.unused.forEach(token => {
        lines.push(`"${token}"`);
      });
      lines.push('');
    }

    // Used tokens
    if (report.used.length > 0) {
      lines.push('# Used Tokens');
      lines.push('Token Path');
      report.used.forEach(token => {
        lines.push(`"${token}"`);
      });
    }

    return lines.join('\n');
  }

  /**
   * Generate Markdown report for documentation
   */
  private generateMarkdownReport(report: AnalyticsReport): string {
    const date = new Date(report.timestamp).toLocaleString();
    const lines: string[] = [];

    lines.push('# 📊 Token Analytics Report');
    lines.push('');
    lines.push(`**Generated:** ${date}`);
    lines.push('');
    lines.push('---');
    lines.push('');

    // Summary section
    lines.push('## Summary');
    lines.push('');
    lines.push('| Metric | Value |');
    lines.push('|--------|-------|');
    lines.push(`| Total Tokens | ${report.total} |`);
    lines.push(`| Used Tokens | ${report.used.length} |`);
    lines.push(`| Unused Tokens | ${report.unused.length} |`);
    lines.push(`| Coverage | ${report.coverage.toFixed(2)}% |`);
    lines.push(`| Estimated Bundle Size | ${this.formatBytes(report.bundleSize.estimated)} |`);
    lines.push('');

    // Coverage indicator
    const coverageEmoji = report.coverage >= 80 ? '🟢' : report.coverage >= 50 ? '🟡' : '🔴';
    lines.push(`**Coverage Status:** ${coverageEmoji} ${report.coverage.toFixed(1)}%`);
    lines.push('');
    lines.push('---');
    lines.push('');

    // Tokens by type
    lines.push('## 🎨 Tokens by Type');
    lines.push('');
    lines.push('| Type | Count | Percentage |');
    lines.push('|------|-------|------------|');
    lines.push(`| Colors | ${report.byType.color} | ${((report.byType.color / report.total) * 100).toFixed(1)}% |`);
    lines.push(`| Spacing | ${report.byType.spacing} | ${((report.byType.spacing / report.total) * 100).toFixed(1)}% |`);
    lines.push(`| Typography | ${report.byType.typography} | ${((report.byType.typography / report.total) * 100).toFixed(1)}% |`);
    lines.push(`| Other | ${report.byType.other} | ${((report.byType.other / report.total) * 100).toFixed(1)}% |`);
    lines.push('');
    lines.push('---');
    lines.push('');

    // Bundle size breakdown
    lines.push('## 📦 Bundle Size Breakdown');
    lines.push('');
    lines.push('| Category | Size |');
    lines.push('|----------|------|');
    Object.entries(report.bundleSize.byType).forEach(([type, size]) => {
      lines.push(`| ${type} | ${this.formatBytes(size)} |`);
    });
    lines.push('');
    lines.push('---');
    lines.push('');

    // Unused tokens
    if (report.unused.length > 0) {
      lines.push(`## ⚠️ Unused Tokens (${report.unused.length})`);
      lines.push('');
      lines.push('The following tokens are defined but not currently used:');
      lines.push('');
      report.unused.slice(0, 20).forEach(token => {
        lines.push(`- \`${token}\``);
      });
      if (report.unused.length > 20) {
        lines.push(`- *... and ${report.unused.length - 20} more*`);
      }
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Generate JSON report for programmatic access
   */
  private generateJSONReport(report: AnalyticsReport): string {
    return JSON.stringify({
      ...report,
      byFormat: Object.fromEntries(report.byFormat),
    }, null, 2);
  }

  /**
   * Analyze tokens by type
   */
  private analyzeTokensByType(tokens: DesignTokens): {
    color: number;
    spacing: number;
    typography: number;
    other: number;
  } {
    let color = 0;
    let spacing = 0;
    let typography = 0;
    let other = 0;

    const analyze = (obj: any, path: string = ''): void => {
      if (!obj || typeof obj !== 'object') return;

      if ('value' in obj || '$value' in obj) {
        const type = obj.type || '';
        const pathLower = path.toLowerCase();

        if (type === 'color' || pathLower.includes('color')) {
          color++;
        } else if (type === 'dimension' || pathLower.includes('spacing') || pathLower.includes('size')) {
          spacing++;
        } else if (pathLower.includes('font') || pathLower.includes('typography') || pathLower.includes('text')) {
          typography++;
        } else {
          other++;
        }
      } else {
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            analyze(obj[key], path ? `${path}.${key}` : key);
          }
        }
      }
    };

    analyze(tokens);

    return { color, spacing, typography, other };
  }

  /**
   * Analyze tokens by format usage
   */
  private analyzeTokensByFormat(_analytics: TokenAnalytics): Map<string, number> {
    // This would need access to internal usage data from TokenAnalytics
    // For now, return empty map
    return new Map();
  }

  /**
   * Estimate bundle size for tokens
   */
  private estimateBundleSize(tokens: DesignTokens): {
    estimated: number;
    byType: Record<string, number>;
  } {
    const byType: Record<string, number> = {
      color: 0,
      spacing: 0,
      typography: 0,
      other: 0,
    };

    const estimateSize = (obj: any, path: string = ''): void => {
      if (!obj || typeof obj !== 'object') return;

      if ('value' in obj || '$value' in obj) {
        const value = obj.value || obj.$value;
        const type = obj.type || '';
        const pathLower = path.toLowerCase();

        // Estimate CSS variable size: --token-name: value;
        const nameSize = path.length + 8; // '--' prefix + ': ' + ';'
        const valueSize = String(value).length;
        const totalSize = nameSize + valueSize;

        if (type === 'color' || pathLower.includes('color')) {
          byType.color += totalSize;
        } else if (type === 'dimension' || pathLower.includes('spacing') || pathLower.includes('size')) {
          byType.spacing += totalSize;
        } else if (pathLower.includes('font') || pathLower.includes('typography')) {
          byType.typography += totalSize;
        } else {
          byType.other += totalSize;
        }
      } else {
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            estimateSize(obj[key], path ? `${path}.${key}` : key);
          }
        }
      }
    };

    estimateSize(tokens);

    const estimated = Object.values(byType).reduce((sum, size) => sum + size, 0);

    return { estimated, byType };
  }

  /**
   * Format bytes to human-readable string
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }
}
