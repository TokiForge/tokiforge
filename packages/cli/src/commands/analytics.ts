import * as fs from 'fs';
import * as path from 'path';
import { TokenAnalytics, TokenParser } from '@tokiforge/core';

export async function analyticsCommand(projectPath: string = process.cwd()): Promise<void> {
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

    const report = analytics.getUsageReport(tokens);
    const reportText = analytics.generateReport(tokens);

    console.log(reportText);

    const outputPath = path.join(projectPath, 'token-analytics.json');
    fs.writeFileSync(
      outputPath,
      JSON.stringify(
        {
          coverage: report.coverage,
          unused: report.unused,
          used: report.used,
          total: report.total,
        },
        null,
        2
      )
    );

    console.log(`\nAnalytics saved to: ${outputPath}`);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Analytics failed:', message);
    process.exit(1);
  }
}

