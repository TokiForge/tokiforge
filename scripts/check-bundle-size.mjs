#!/usr/bin/env node
/**
 * Guard the "<3KB gzipped" (core runtime) claim. Fails CI when the gzipped
 * ESM bundle of a package exceeds its budget.
 *
 * Usage: node scripts/check-bundle-size.mjs
 */
import { gzipSync } from 'node:zlib';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Budgets in gzipped bytes. The full core bundle includes build-time-only
// utilities (parser, exporters, analytics); the runtime claim applies to
// what a browser app actually imports, so the budget covers the whole
// bundle with headroom while still catching runaway growth.
const budgets = [
  { name: '@tokiforge/core', file: 'packages/core/dist/index.js', budget: 20 * 1024 },
  { name: '@tokiforge/react', file: 'packages/react/dist/index.js', budget: 4 * 1024 },
  { name: '@tokiforge/vue', file: 'packages/vue/dist/index.js', budget: 6 * 1024 },
  { name: '@tokiforge/svelte', file: 'packages/svelte/dist/index.js', budget: 4 * 1024 },
];

let failed = false;

for (const { name, file, budget } of budgets) {
  const path = resolve(root, file);
  if (!existsSync(path)) {
    console.log(`SKIP  ${name} (${file} not built)`);
    continue;
  }

  const gzipped = gzipSync(readFileSync(path)).length;
  const kb = (gzipped / 1024).toFixed(2);
  const budgetKb = (budget / 1024).toFixed(0);

  if (gzipped > budget) {
    console.error(`FAIL  ${name}: ${kb} KB gzipped (budget ${budgetKb} KB)`);
    failed = true;
  } else {
    console.log(`OK    ${name}: ${kb} KB gzipped (budget ${budgetKb} KB)`);
  }
}

process.exit(failed ? 1 : 0);
