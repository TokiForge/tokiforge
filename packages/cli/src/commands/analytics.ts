import * as fs from 'fs';
import * as path from 'path';
import { TokenAnalytics, TokenParser, AnalyticsReporter } from '@tokiforge/core';
import type { ExportFormat } from '@tokiforge/core';

export async function analyticsCommand(
  projectPath: string = process.cwd(),
  options: { format?: ExportFormat; output?: string } = {}
): Promise<void> {
  const configPath = path.join(projectPath, 'tokiforge.config.json');

  if (!fs.existsSync(configPath)) {
    console.error('tokiforge.config.json not found. Run "tokiforge init" first.');
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  const tokenPath = path.resolve(projectPath, config.input || './tokens.json');

  if (!fs.existsSync(tokenPath)) {
    console.error(`Token file not found: ${tokenPath}`);
    process.exit(1);
  }

  console.log('Generating token analytics...\n');

  try {
    const tokens = TokenParser.parse(tokenPath);
    const analytics = new TokenAnalytics();
    const reporter = new AnalyticsReporter();

    // Generate comprehensive report
    const report = reporter.generateReport(tokens, analytics);
    
    // Determine format and output path
    const format = options.format || 'json';
    const defaultOutputName = `token-analytics.${format === 'html' ? 'html' : format === 'csv' ? 'csv' : format === 'markdown' ? 'md' : 'json'}`;
    const outputPath = options.output 
      ? path.resolve(projectPath, options.output)
      : path.join(projectPath, defaultOutputName);

    // Export in the requested format
    const exportedReport = reporter.export(report, format);
    fs.writeFileSync(outputPath, exportedReport);

    // Print summary to console
    console.log('Token Analytics Summary');
    console.log('='.repeat(50));
    console.log(`Total Tokens: ${report.total}`);
    console.log(`Used Tokens: ${report.used.length}`);
    console.log(`Unused Tokens: ${report.unused.length}`);
    console.log(`Coverage: ${report.coverage.toFixed(2)}%`);
    console.log(`Estimated Bundle Size: ${formatBytes(report.bundleSize.estimated)}`);
    console.log('');
    console.log('Tokens by Type:');
    console.log(`  Colors: ${report.byType.color}`);
    console.log(`  Spacing: ${report.byType.spacing}`);
    console.log(`  Typography: ${report.byType.typography}`);
    console.log(`  Other: ${report.byType.other}`);
    console.log('');

    console.log(`✅ Analytics report saved to: ${outputPath}`);
    console.log(`📊 Format: ${format.toUpperCase()}`);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Analytics failed:', message);
    process.exit(1);
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

