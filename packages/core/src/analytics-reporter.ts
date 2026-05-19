import type { DesignTokens } from './types';
import { TokenAnalytics } from './token-analytics';

type TokenNode = Record<string, unknown>;

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
    let coverageColor = '#EF4444';
    if (report.coverage >= 80) {
      coverageColor = '#10B981';
    } else if (report.coverage >= 50) {
      coverageColor = '#F59E0B';
    }

    let unusedSection = '';
    if (report.unused.length > 0) {
      const unusedItems = report.unused.map(token => `<div class="token-item">${token}</div>`).join('\n        ');
      unusedSection = `
    <div class="section">
      <h2>⚠️ Unused Tokens (${report.unused.length})</h2>
      <div class="token-list">
        ${unusedItems}
      </div>
    </div>
      `;
    }

    let usedSection = '';
    if (report.used.length > 0) {
      const extraCountMsg = report.used.length > 50 ? `<div class="token-item" style="opacity: 0.6;">... and ${report.used.length - 50} more</div>` : '';
      const usedItems = report.used.slice(0, 50).map(token => `<div class="token-item">${token}</div>`).join('\n        ');
      usedSection = `
    <div class="section">
      <h2>✅ Used Tokens (${report.used.length})</h2>
      <div class="token-list">
        ${usedItems}
        ${extraCountMsg}
      </div>
    </div>
      `;
    }

    const estimatedBytes = this.formatBytes(report.bundleSize.estimated);
    const totalTokens = report.total;
    const usedCount = report.used.length;
    const unusedCount = report.unused.length;
    const coveragePercent = report.coverage.toFixed(1);
    
    const colorBarHeight = (report.byType.color / report.total) * 100;
    const spacingBarHeight = (report.byType.spacing / report.total) * 100;
    const typographyBarHeight = (report.byType.typography / report.total) * 100;
    const otherBarHeight = (report.byType.other / report.total) * 100;

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
        ${coveragePercent}%
      </div>
    </div>

    <div class="metrics">
      <div class="metric-card">
        <div class="metric-value">${totalTokens}</div>
        <div class="metric-label">Total Tokens</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${usedCount}</div>
        <div class="metric-label">Used Tokens</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${unusedCount}</div>
        <div class="metric-label">Unused Tokens</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${coveragePercent}%</div>
        <div class="metric-label">Coverage</div>
      </div>
    </div>

    <div class="section">
      <h2>📦 Estimated Bundle Size</h2>
      <div class="bundle-size">
        <div class="bundle-size-icon">📦</div>
        <div class="bundle-size-text">
          <div class="bundle-size-value">${estimatedBytes}</div>
          <div class="bundle-size-label">Estimated CSS bundle size</div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>🎨 Tokens by Type</h2>
      <div class="chart">
        <div class="chart-item">
          <div class="chart-bar">
            <div class="chart-bar-fill" style="height: ${colorBarHeight}%"></div>
          </div>
          <div class="chart-label">Colors</div>
          <div class="chart-value">${report.byType.color} tokens</div>
        </div>
        <div class="chart-item">
          <div class="chart-bar">
            <div class="chart-bar-fill" style="height: ${spacingBarHeight}%"></div>
          </div>
          <div class="chart-label">Spacing</div>
          <div class="chart-value">${report.byType.spacing} tokens</div>
        </div>
        <div class="chart-item">
          <div class="chart-bar">
            <div class="chart-bar-fill" style="height: ${typographyBarHeight}%"></div>
          </div>
          <div class="chart-label">Typography</div>
          <div class="chart-value">${report.byType.typography} tokens</div>
        </div>
        <div class="chart-item">
          <div class="chart-bar">
            <div class="chart-bar-fill" style="height: ${otherBarHeight}%"></div>
          </div>
          <div class="chart-label">Other</div>
          <div class="chart-value">${report.byType.other} tokens</div>
        </div>
      </div>
    </div>

    ${unusedSection}

    ${usedSection}
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
    lines.push(
      '# Token Analytics Summary',
      `Timestamp,${report.timestamp}`,
      `Total Tokens,${report.total}`,
      `Used Tokens,${report.used.length}`,
      `Unused Tokens,${report.unused.length}`,
      `Coverage,${report.coverage.toFixed(2)}%`,
      `Bundle Size,${report.bundleSize.estimated}`,
      ''
    );

    // Tokens by type
    lines.push(
      '# Tokens by Type',
      'Type,Count,Percentage',
      `Color,${report.byType.color},${((report.byType.color / report.total) * 100).toFixed(2)}%`,
      `Spacing,${report.byType.spacing},${((report.byType.spacing / report.total) * 100).toFixed(2)}%`,
      `Typography,${report.byType.typography},${((report.byType.typography / report.total) * 100).toFixed(2)}%`,
      `Other,${report.byType.other},${((report.byType.other / report.total) * 100).toFixed(2)}%`,
      ''
    );

    // Unused tokens
    if (report.unused.length > 0) {
      lines.push('# Unused Tokens', 'Token Path');
      for (const token of report.unused) {
        lines.push(`"${token}"`);
      }
      lines.push('');
    }

    // Used tokens
    if (report.used.length > 0) {
      lines.push('# Used Tokens', 'Token Path');
      for (const token of report.used) {
        lines.push(`"${token}"`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Generate Markdown report for documentation
   */
  private generateMarkdownReport(report: AnalyticsReport): string {
    const date = new Date(report.timestamp).toLocaleString();
    const lines: string[] = [];

    lines.push(
      '# 📊 Token Analytics Report',
      '',
      `**Generated:** ${date}`,
      '',
      '---',
      ''
    );

    // Summary section
    lines.push(
      '## Summary',
      '',
      '| Metric | Value |',
      '|--------|-------|',
      `| Total Tokens | ${report.total} |`,
      `| Used Tokens | ${report.used.length} |`,
      `| Unused Tokens | ${report.unused.length} |`,
      `| Coverage | ${report.coverage.toFixed(2)}% |`,
      `| Estimated Bundle Size | ${this.formatBytes(report.bundleSize.estimated)} |`,
      ''
    );

    // Coverage indicator
    let coverageEmoji = '🔴';
    if (report.coverage >= 80) {
      coverageEmoji = '🟢';
    } else if (report.coverage >= 50) {
      coverageEmoji = '🟡';
    }
    lines.push(`**Coverage Status:** ${coverageEmoji} ${report.coverage.toFixed(1)}%`);
    lines.push('');
    lines.push('---');
    lines.push('');

    // Tokens by type
    lines.push(
      '## 🎨 Tokens by Type',
      '',
      '| Type | Count | Percentage |',
      '|------|-------|------------|',
      `| Colors | ${report.byType.color} | ${((report.byType.color / report.total) * 100).toFixed(1)}% |`,
      `| Spacing | ${report.byType.spacing} | ${((report.byType.spacing / report.total) * 100).toFixed(1)}% |`,
      `| Typography | ${report.byType.typography} | ${((report.byType.typography / report.total) * 100).toFixed(1)}% |`,
      `| Other | ${report.byType.other} | ${((report.byType.other / report.total) * 100).toFixed(1)}% |`,
      '',
      '---',
      ''
    );

    // Bundle size breakdown
    lines.push(
      '## 📦 Bundle Size Breakdown',
      '',
      '| Category | Size |',
      '|----------|------|'
    );
    for (const [type, size] of Object.entries(report.bundleSize.byType)) {
      lines.push(`| ${type} | ${this.formatBytes(size)} |`);
    }
    lines.push('', '---', '');

    // Unused tokens
    if (report.unused.length > 0) {
      lines.push(`## ⚠️ Unused Tokens (${report.unused.length})`, '', 'The following tokens are defined but not currently used:', '');
      for (const token of report.unused.slice(0, 20)) {
        lines.push(`- \`${token}\``);
      }
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

    const analyze = (obj: unknown, path: string = ''): void => {
      if (!obj || typeof obj !== 'object') return;

      const node = obj as TokenNode;
      if ('value' in node || '$value' in node) {
        const type = typeof node.type === 'string' ? node.type : '';
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
        for (const key of Object.keys(node)) {
          analyze(node[key], path ? `${path}.${key}` : key);
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
    const byType: Record<string, number> = { color: 0, spacing: 0, typography: 0, other: 0 };

    const estimateSize = (obj: unknown, path: string = ''): void => {
      if (!obj || typeof obj !== 'object') return;

      const node = obj as TokenNode;
      if ('value' in node || '$value' in node) {
        const value = node.value ?? node.$value;
        const type = typeof node.type === 'string' ? node.type : '';
        const pathLower = path.toLowerCase();

        const nameSize = path.length + 8;
        const valueStr = typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' ? String(value) : '';
        const valueSize = valueStr.length;
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
        for (const key of Object.keys(node)) {
          estimateSize(node[key], path ? `${path}.${key}` : key);
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
    return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }
}
