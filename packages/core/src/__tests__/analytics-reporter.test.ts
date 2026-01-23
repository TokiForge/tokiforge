import { describe, it, expect } from 'vitest';
import { AnalyticsReporter } from '../analytics-reporter';
import { TokenAnalytics } from '../token-analytics';
import type { DesignTokens } from '../types';

describe('AnalyticsReporter', () => {
  const mockTokens: DesignTokens = {
    color: {
      primary: { value: '#7C3AED', type: 'color' },
      secondary: { value: '#06B6D4', type: 'color' },
    },
    spacing: {
      sm: { value: '8px', type: 'dimension' },
      md: { value: '16px', type: 'dimension' },
      lg: { value: '24px', type: 'dimension' },
    },
    typography: {
      heading: { value: 'bold', type: 'fontWeight' },
      body: { value: 'normal', type: 'fontWeight' },
    },
  };

  describe('generateReport', () => {
    it('generates comprehensive analytics report', () => {
      const analytics = new TokenAnalytics();
      const reporter = new AnalyticsReporter();

      const report = reporter.generateReport(mockTokens, analytics);

      expect(report.total).toBe(7);
      expect(report.timestamp).toBeDefined();
      expect(report.bundleSize.estimated).toBeGreaterThan(0);
      expect(report.byType).toEqual({
        color: 2,
        spacing: 3,
        typography: 2,
        other: 0,
      });
    });

    it('tracks coverage percentage', () => {
      const analytics = new TokenAnalytics();
      analytics.trackUsage('color.primary');
      analytics.trackUsage('spacing.sm');

      const reporter = new AnalyticsReporter();
      const report = reporter.generateReport(mockTokens, analytics);

      // 2 used out of 7 total
      expect(report.coverage).toBeCloseTo(28.57, 1);
      expect(report.used.length).toBe(2);
      expect(report.unused.length).toBe(5);
    });
  });

  describe('trends', () => {
    it('tracks trends over time', () => {
      const reporter = new AnalyticsReporter();
      const analytics = new TokenAnalytics();

      const report1 = reporter.generateReport(mockTokens, analytics);
      reporter.trackTrend(report1);

      const trends = reporter.getTrends();
      expect(trends.length).toBeGreaterThan(0);
      expect(trends[0].totalTokens).toBe(7);
    });

    it('maintains max 30 trend points', () => {
      const reporter = new AnalyticsReporter();
      const analytics = new TokenAnalytics();

      for (let i = 0; i < 40; i++) {
        const report = reporter.generateReport(mockTokens, analytics);
        reporter.trackTrend(report);
      }

      const trends = reporter.getTrends();
      expect(trends.length).toBeLessThanOrEqual(30);
    });
  });

  describe('compareReports', () => {
    it('compares two analytics reports', () => {
      const analytics1 = new TokenAnalytics();
      analytics1.trackUsage('color.primary');

      const analytics2 = new TokenAnalytics();
      analytics2.trackUsage('color.primary');
      analytics2.trackUsage('color.secondary');

      const reporter = new AnalyticsReporter();
      const report1 = reporter.generateReport(mockTokens, analytics1);
      const report2 = reporter.generateReport(mockTokens, analytics2);

      const comparison = reporter.compareReports(report1, report2);

      expect(comparison.changes.newTokens).toContain('color.secondary');
      expect(comparison.changes.tokenCountChange).toBe(0);
    });
  });

  describe('export formats', () => {
    it('exports as JSON', () => {
      const analytics = new TokenAnalytics();
      const reporter = new AnalyticsReporter();
      const report = reporter.generateReport(mockTokens, analytics);

      const json = reporter.export(report, 'json');
      const parsed = JSON.parse(json);

      expect(parsed.total).toBe(7);
      expect(parsed.timestamp).toBeDefined();
    });

    it('exports as HTML', () => {
      const analytics = new TokenAnalytics();
      const reporter = new AnalyticsReporter();
      const report = reporter.generateReport(mockTokens, analytics);

      const html = reporter.export(report, 'html');

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('Token Analytics Report');
      expect(html).toContain('7');
    });

    it('exports as CSV', () => {
      const analytics = new TokenAnalytics();
      const reporter = new AnalyticsReporter();
      const report = reporter.generateReport(mockTokens, analytics);

      const csv = reporter.export(report, 'csv');

      expect(csv).toContain('Total Tokens');
      expect(csv).toContain('7');
      expect(csv).toContain('Type,Count');
    });

    it('exports as Markdown', () => {
      const analytics = new TokenAnalytics();
      const reporter = new AnalyticsReporter();
      const report = reporter.generateReport(mockTokens, analytics);

      const md = reporter.export(report, 'markdown');

      expect(md).toContain('# 📊 Token Analytics Report');
      expect(md).toContain('| Total Tokens | 7 |');
      expect(md).toContain('## 🎨 Tokens by Type');
    });
  });

  describe('bundle size estimation', () => {
    it('estimates bundle size correctly', () => {
      const analytics = new TokenAnalytics();
      const reporter = new AnalyticsReporter();
      const report = reporter.generateReport(mockTokens, analytics);

      expect(report.bundleSize.estimated).toBeGreaterThan(0);
      expect(report.bundleSize.byType.color).toBeGreaterThan(0);
      expect(report.bundleSize.byType.spacing).toBeGreaterThan(0);
    });
  });
});
