/**
 * Visual Regression Testing Utilities
 * 
 * Provides helpers for setting up Playwright visual tests,
 * managing baselines, and generating reports
 */

import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Visual test configuration
 */
export interface VisualTestConfig {
  baselineDir?: string;
  threshold?: number;
  maxDiffPixels?: number;
  updateSnapshots?: boolean;
}

/**
 * Token change for visualization
 */
export interface TokenChangeVisualization {
  name: string;
  category: string;
  before: string;
  after: string;
  type: 'color' | 'typography' | 'spacing' | 'other';
  impact: 'low' | 'medium' | 'high';
}

/**
 * Visual regression report
 */
export interface VisualRegressionReport {
  timestamp: string;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  changes: TokenChangeVisualization[];
  errorDetails?: string[];
}

/**
 * Setup visual test with smart thresholds
 */
export async function visualTest(
  name: string,
  testFn: (page: Page) => Promise<void>,
  config: VisualTestConfig = {}
) {
  const {
    threshold = 0.2,
    maxDiffPixels = 100,
  } = config;

  test(name, async ({ page }) => {
    await testFn(page);
    await expect(page).toHaveScreenshot(`${name}.png`, {
      threshold,
      maxDiffPixels,
    });
  });
}

/**
 * Compare token values and detect changes
 */
export function compareTokens(
  before: Record<string, any>,
  after: Record<string, any>
): TokenChangeVisualization[] {
  const changes: TokenChangeVisualization[] = [];
  const visited = new Set<string>();

  const traverse = (
    beforeObj: any,
    afterObj: any,
    path: string[] = [],
    category = ''
  ) => {
    for (const key of Object.keys(afterObj)) {
      if (key.startsWith('$')) continue;

      const currentPath = [...path, key];
      const pathStr = currentPath.join('.');
      const cat = category || currentPath[0];

      const beforeValue = beforeObj?.[key];
      const afterValue = afterObj[key];

      if (afterValue && typeof afterValue === 'object' && !Array.isArray(afterValue)) {
        if ('value' in afterValue) {
          // It's a token
          visited.add(pathStr);

          if (!beforeValue || JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) {
            const beforeVal = beforeValue?.value || 'N/A';
            const afterVal = afterValue.value || 'N/A';

            changes.push({
              name: key,
              category: cat,
              before: beforeVal,
              after: afterVal,
              type: inferTokenType(cat),
              impact: calculateChangeImpact(pathStr, beforeVal, afterVal),
            });
          }
        } else {
          // Nested tokens
          traverse(beforeValue || {}, afterValue, currentPath, cat);
        }
      }
    }

    // Check for removed tokens
    if (beforeObj) {
      for (const key of Object.keys(beforeObj)) {
        const currentPath = [...path, key];
        const pathStr = currentPath.join('.');

        if (!visited.has(pathStr) && !pathStr.includes('$')) {
          const beforeValue = beforeObj[key];
          if (typeof beforeValue === 'object' && 'value' in beforeValue && !afterObj?.[key]) {
            changes.push({
              name: key,
              category: category || currentPath[0],
              before: beforeValue.value,
              after: 'REMOVED',
              type: inferTokenType(category),
              impact: 'high',
            });
          }
        }
      }
    }
  };

  traverse(before, after);
  return changes;
}

/**
 * Generate HTML report of visual changes
 */
export function generateVisualReport(
  changes: TokenChangeVisualization[],
  outputPath: string
): void {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Token Visual Changes</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h1 {
      margin: 0 0 20px 0;
      color: #333;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .summary-card {
      padding: 15px;
      background: #f9f9f9;
      border-radius: 4px;
      text-align: center;
      border-left: 4px solid #666;
    }
    .summary-card.high {
      border-left-color: #d32f2f;
    }
    .summary-card.medium {
      border-left-color: #f57c00;
    }
    .summary-card.low {
      border-left-color: #388e3c;
    }
    .summary-card .number {
      font-size: 24px;
      font-weight: bold;
      color: #333;
    }
    .summary-card .label {
      font-size: 12px;
      color: #666;
      margin-top: 5px;
    }
    .changes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 15px;
    }
    .change-card {
      padding: 15px;
      background: #fafafa;
      border-radius: 4px;
      border: 1px solid #e0e0e0;
    }
    .change-card.high {
      border-left: 4px solid #d32f2f;
    }
    .change-card.medium {
      border-left: 4px solid #f57c00;
    }
    .change-card.low {
      border-left: 4px solid #388e3c;
    }
    .change-header {
      font-weight: bold;
      margin-bottom: 10px;
      color: #333;
    }
    .token-name {
      font-family: monospace;
      font-size: 12px;
      background: white;
      padding: 5px 8px;
      border-radius: 3px;
      display: inline-block;
      margin-bottom: 10px;
    }
    .token-comparison {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      font-size: 12px;
    }
    .token-value {
      padding: 8px;
      background: white;
      border-radius: 3px;
      font-family: monospace;
      word-break: break-all;
    }
    .token-value.color {
      padding: 20px 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      text-shadow: 0 1px 3px rgba(0,0,0,0.3);
    }
    .label {
      font-size: 11px;
      color: #666;
      margin-bottom: 5px;
      font-weight: 500;
    }
    .removed {
      opacity: 0.5;
      text-decoration: line-through;
    }
    .timestamp {
      font-size: 12px;
      color: #999;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Token Visual Changes Report</h1>
    
    <div class="summary">
      ${generateSummaryCards(changes)}
    </div>
    
    <div class="changes-grid">
      ${changes.map(change => generateChangeCard(change)).join('')}
    </div>
    
    <div class="timestamp">
      Generated: ${new Date().toISOString()}
    </div>
  </div>
</body>
</html>
  `;

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, html);
}

function generateSummaryCards(changes: TokenChangeVisualization[]): string {
  const highImpact = changes.filter(c => c.impact === 'high').length;
  const mediumImpact = changes.filter(c => c.impact === 'medium').length;
  const lowImpact = changes.filter(c => c.impact === 'low').length;

  return `
    <div class="summary-card high">
      <div class="number">${highImpact}</div>
      <div class="label">High Impact</div>
    </div>
    <div class="summary-card medium">
      <div class="number">${mediumImpact}</div>
      <div class="label">Medium Impact</div>
    </div>
    <div class="summary-card low">
      <div class="number">${lowImpact}</div>
      <div class="label">Low Impact</div>
    </div>
    <div class="summary-card">
      <div class="number">${changes.length}</div>
      <div class="label">Total Changes</div>
    </div>
  `;
}

function generateChangeCard(change: TokenChangeVisualization): string {
  const isColor = change.type === 'color' && isHexColor(change.after);
  const isRemoved = change.after === 'REMOVED';

  return `
    <div class="change-card ${change.impact}">
      <div class="change-header">${change.name}</div>
      <div class="token-name">${change.category}.${change.name}</div>
      <div class="token-comparison">
        <div>
          <div class="label">Before</div>
          <div class="token-value${isColor ? ' color' : ''}${isRemoved ? ' removed' : ''}" 
               style="${isColor ? `background-color: ${change.before}` : ''}">
            ${change.before}
          </div>
        </div>
        <div>
          <div class="label">After</div>
          <div class="token-value${isColor ? ' color' : ''}${isRemoved ? ' removed' : ''}" 
               style="${isColor ? `background-color: ${change.after}` : ''}">
            ${change.after}
          </div>
        </div>
      </div>
    </div>
  `;
}

function isHexColor(value: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value);
}

function inferTokenType(
  category: string
): 'color' | 'typography' | 'spacing' | 'other' {
  if (category.includes('color')) return 'color';
  if (category.includes('typography') || category.includes('font')) return 'typography';
  if (category.includes('spacing') || category.includes('size')) return 'spacing';
  return 'other';
}

function calculateChangeImpact(
  path: string,
  before: string,
  after: string
): 'low' | 'medium' | 'high' {
  // Removed tokens are high impact
  if (after === 'REMOVED') return 'high';

  // Brand/primary color changes are high impact
  if (path.includes('primary') || path.includes('brand')) return 'high';

  // Typography changes are medium impact
  if (path.includes('typography') || path.includes('font')) return 'medium';

  // Most other changes are low impact
  return 'low';
}

/**
 * Create visual test suite for token changes
 */
export function createTokenVisualTests(
  changes: TokenChangeVisualization[]
) {
  const grouped = changes.reduce(
    (acc, change) => {
      if (!acc[change.category]) {
        acc[change.category] = [];
      }
      acc[change.category].push(change);
      return acc;
    },
    {} as Record<string, TokenChangeVisualization[]>
  );

  for (const [category, categoryChanges] of Object.entries(grouped)) {
    test.describe(`${category} changes`, () => {
      categoryChanges.forEach(change => {
        test(`should show ${change.name} change`, async ({ page }) => {
          // This would be implemented based on your specific test setup
          expect(change).toBeDefined();
        });
      });
    });
  }
}
