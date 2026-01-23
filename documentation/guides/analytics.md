# Enhanced Usage Analytics Guide

## Overview

Phase 3.3 introduces comprehensive analytics capabilities to TokiForge, enabling detailed tracking, reporting, and visualization of token usage and bundle impact. This guide covers all new analytics features.

## Features

### 1. AnalyticsReporter Class

The `AnalyticsReporter` is the core engine for generating comprehensive analytics reports.

```typescript
import {
  AnalyticsReporter,
  TokenAnalytics,
  TokenParser,
} from "@tokiforge/core";

const tokens = TokenParser.parse("./tokens.json");
const analytics = new TokenAnalytics();
const reporter = new AnalyticsReporter();

// Generate comprehensive report
const report = reporter.generateReport(tokens, analytics);
```

### 2. Report Types

#### Generated Report

```typescript
interface AnalyticsReport {
  timestamp: string; // ISO timestamp
  coverage: number; // 0-100 percentage
  unused: string[]; // Unused token paths
  used: string[]; // Used token paths
  total: number; // Total token count
  byType: {
    color: number;
    spacing: number;
    typography: number;
    other: number;
  };
  byFormat: Map<string, number>; // Usage by export format
  bundleSize: {
    estimated: number; // Total estimated bytes
    byType: Record<string, number>;
  };
}
```

#### Trend Data

```typescript
interface TrendDataPoint {
  timestamp: string;
  coverage: number;
  totalTokens: number;
  usedTokens: number;
  bundleSize: number;
}
```

#### Comparison Report

```typescript
interface ComparisonReport {
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
```

### 3. Export Formats

#### HTML Reports

Generate beautifully formatted HTML reports with charts and visualizations.

```typescript
const report = reporter.generateReport(tokens, analytics);
const html = reporter.export(report, "html");
fs.writeFileSync("analytics-report.html", html);
```

**Features:**

- Responsive design (mobile-friendly)
- Interactive charts
- Color-coded metrics
- Print-friendly styling
- Statistics summary
- Token breakdown tables

#### CSV Export

Export analytics data in CSV format for spreadsheet analysis.

```typescript
const csv = reporter.export(report, "csv");
fs.writeFileSync("analytics.csv", csv);
```

**Contains:**

- Summary metrics
- Token breakdown by type
- Unused token list
- Used token list

#### Markdown Export

Generate documentation-friendly Markdown reports.

```typescript
const markdown = reporter.export(report, "markdown");
fs.writeFileSync("ANALYTICS.md", markdown);
```

**Features:**

- GitHub-compatible formatting
- Embedded tables
- Coverage indicators
- Token type breakdown

#### JSON Export

Export programmatically accessible JSON data.

```typescript
const json = reporter.export(report, "json");
const data = JSON.parse(json);
```

**Use Cases:**

- Programmatic access
- API integration
- Dashboard display
- Version control

### 4. Trend Tracking

Track analytics metrics over time for pattern analysis.

```typescript
const reporter = new AnalyticsReporter();

// Add report to trends (automatically maintains last 30 points)
reporter.trackTrend(report);

// Retrieve trend data
const trends = reporter.getTrends();
trends.forEach((point) => {
  console.log(`${point.timestamp}: ${point.coverage}% coverage`);
});
```

**Tracked Metrics:**

- Token coverage percentage
- Total token count
- Used token count
- Bundle size changes

### 5. Report Comparison

Compare two analytics reports to identify changes.

```typescript
const baselineReport = reporter.generateReport(oldTokens, analytics1);
const currentReport = reporter.generateReport(newTokens, analytics2);

const comparison = reporter.compareReports(baselineReport, currentReport);

console.log(`Coverage change: ${comparison.changes.coverageChange}%`);
console.log(`New tokens: ${comparison.changes.newTokens.join(", ")}`);
console.log(`Removed tokens: ${comparison.changes.removedTokens.join(", ")}`);
console.log(`Bundle size change: ${comparison.changes.bundleSizeChange} bytes`);
```

### 6. Bundle Size Estimation

Automatic estimation of CSS bundle size based on tokens.

```typescript
const report = reporter.generateReport(tokens, analytics);

console.log(`Total size: ${formatBytes(report.bundleSize.estimated)}`);
console.log(`Colors: ${formatBytes(report.bundleSize.byType.color)}`);
console.log(`Spacing: ${formatBytes(report.bundleSize.byType.spacing)}`);
console.log(`Typography: ${formatBytes(report.bundleSize.byType.typography)}`);
```

**Calculation:**

- Estimates CSS variable declarations
- Includes token names + values
- Accounts for all metadata
- Provides type-based breakdown

## Interactive Dashboard

The playground includes a new Analytics Dashboard with real-time insights.

### Access

Navigate to the **📊 Analytics** tab in the playground to view the dashboard.

### Views

#### Overview Tab

- Total token count
- Estimated bundle size
- Token type distribution
- Breakdown percentages
- Distribution visualization

#### Trends Tab

- 7-day token count trend
- 7-day bundle size trend
- Interactive charts
- Date-based tracking

#### Bundle Analysis Tab

- Total bundle size
- Size breakdown by type
- Percentage distribution
- Color-coded visualization

### Features

- Real-time calculations
- Responsive design
- Interactive charts
- Copy-friendly data
- Print-friendly layout

## CLI Enhancement

### New Command Options

```bash
# Generate JSON report (default)
tokiforge analytics

# Generate HTML report
tokiforge analytics --format html

# Generate CSV report
tokiforge analytics --format csv

# Generate Markdown report
tokiforge analytics --format markdown

# Custom output path
tokiforge analytics --format html --output dist/report.html
```

### Output Example

```
Generating token analytics...

Token Analytics Summary
==================================================
Total Tokens: 47
Used Tokens: 43
Unused Tokens: 4
Coverage: 91.49%
Estimated Bundle Size: 2.15 KB

Tokens by Type:
  Colors: 18
  Spacing: 15
  Typography: 10
  Other: 4

✅ Analytics report saved to: token-analytics.json
📊 Format: JSON
```

## Usage Scenarios

### Scenario 1: Monitoring Token Coverage

Track coverage over time to ensure tokens are being used effectively.

```typescript
const reporter = new AnalyticsReporter();
const baseAnalytics = new TokenAnalytics();

const baseReport = reporter.generateReport(tokens, baseAnalytics);
reporter.trackTrend(baseReport);

// Later...
const newAnalytics = new TokenAnalytics();
const newReport = reporter.generateReport(tokens, newAnalytics);
reporter.trackTrend(newReport);

const comparison = reporter.compareReports(baseReport, newReport);
if (comparison.changes.coverageChange < 0) {
  console.warn("Coverage decreased!");
}
```

### Scenario 2: Identifying Unused Tokens

Find and remove unused tokens to clean up your design system.

```typescript
const report = reporter.generateReport(tokens, analytics);

console.log(`Unused tokens (${report.unused.length}):`);
report.unused.forEach((token) => {
  console.log(`  - ${token}`);
});

// Consider deprecating or removing these tokens
```

### Scenario 3: Bundle Size Analysis

Identify which token types contribute most to bundle size.

```typescript
const report = reporter.generateReport(tokens, analytics);

const breakdown = Object.entries(report.bundleSize.byType).sort(
  ([, a], [, b]) => b - a
);

breakdown.forEach(([type, size]) => {
  const percent = ((size / report.bundleSize.estimated) * 100).toFixed(1);
  console.log(`${type}: ${formatBytes(size)} (${percent}%)`);
});
```

### Scenario 4: Generating Team Reports

Create HTML reports to share with the design and engineering teams.

```typescript
const report = reporter.generateReport(tokens, analytics);
const html = reporter.export(report, "html");

// Generate timestamped report
const timestamp = new Date().toISOString().split("T")[0];
const filename = `reports/token-analytics-${timestamp}.html`;

fs.writeFileSync(filename, html);
console.log(`Report generated: ${filename}`);
```

### Scenario 5: CI/CD Integration

Integrate analytics into your CI/CD pipeline.

```bash
#!/bin/bash
# Check coverage threshold
tokiforge analytics --format json --output analytics.json

COVERAGE=$(jq '.coverage' analytics.json)
THRESHOLD=80

if (( $(echo "$COVERAGE < $THRESHOLD" | bc -l) )); then
  echo "Token coverage ${COVERAGE}% is below threshold ${THRESHOLD}%"
  exit 1
fi

echo "Token coverage ${COVERAGE}% meets threshold"
```

## Performance Considerations

### Bundle Size Impact

The analytics reporter itself has minimal impact:

- `AnalyticsReporter`: ~5 KB (minified)
- Report data: Varies based on token count
- Dashboard component: ~12 KB (included in playground)

### Calculation Time

- HTML report generation: < 100ms
- CSV/Markdown export: < 50ms
- Report comparison: < 10ms
- Trend tracking: < 5ms

All calculations run synchronously and don't block the main thread for typical token sets.

## API Reference

### AnalyticsReporter Methods

#### `generateReport(tokens, analytics): AnalyticsReport`

Generate a comprehensive analytics report.

**Parameters:**

- `tokens`: DesignTokens - Token object to analyze
- `analytics`: TokenAnalytics - Initialized analytics instance

**Returns:** AnalyticsReport with complete metrics

#### `trackTrend(report): void`

Add a report to the trend history (max 30 points).

**Parameters:**

- `report`: AnalyticsReport - Report to track

#### `getTrends(): TrendDataPoint[]`

Get all tracked trend data points.

**Returns:** Array of trend points

#### `compareReports(baseline, current): ComparisonReport`

Compare two reports to identify changes.

**Parameters:**

- `baseline`: AnalyticsReport - Previous report
- `current`: AnalyticsReport - Current report

**Returns:** ComparisonReport with change details

#### `export(report, format): string`

Export report in specified format.

**Parameters:**

- `report`: AnalyticsReport - Report to export
- `format`: ExportFormat - 'html' | 'csv' | 'markdown' | 'json'

**Returns:** Formatted report string

## Troubleshooting

### Issue: Bundle size seems incorrect

**Solution:** Bundle size is estimated based on CSS variable declarations. Actual bundle size depends on:

- Minification settings
- Compression algorithm
- Build tool configuration
- Post-processing

For accurate measurements, compare estimates against actual build output.

### Issue: Coverage percentage not updating

**Solution:** Coverage is calculated from the `TokenAnalytics` instance. Ensure tokens are being tracked:

```typescript
const analytics = new TokenAnalytics();
// Track token usage
analytics.trackUsage("color.primary", "css");

// Then generate report
const report = reporter.generateReport(tokens, analytics);
```

### Issue: Dashboard not showing trends

**Solution:** Trends require at least one tracked report. Try:

```typescript
const reporter = new AnalyticsReporter();
const report = reporter.generateReport(tokens, analytics);
reporter.trackTrend(report); // Add to trends

const trends = reporter.getTrends(); // Should now have data
```

## Best Practices

1. **Regular Monitoring**: Track analytics weekly or monthly to identify trends
2. **Team Reviews**: Share HTML reports with design and engineering teams
3. **CI Integration**: Add analytics checks to your build pipeline
4. **Documentation**: Include analytics reports in release notes
5. **Cleanup**: Regularly review and remove unused tokens
6. **Benchmarking**: Set baseline metrics and track improvements
7. **Format Exports**: Use markdown for documentation, CSV for analysis

## Next Steps

- Monitor token coverage trends over time
- Set coverage targets (e.g., 80% minimum)
- Integrate with CI/CD pipelines
- Share analytics reports with your team
- Use insights to refine token structure
- Plan token deprecations based on usage data

## Additional Resources

- [CLI Commands Documentation](../cli/commands.md)
- [Analytics API Reference](../api/advanced/token-analytics.md)
- [API Playground](/api/playground)
- [Core API Reference](/api/core)
