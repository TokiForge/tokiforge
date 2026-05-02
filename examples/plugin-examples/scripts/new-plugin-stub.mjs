#!/usr/bin/env node
/**
 * Minimal plugin template generator: writes plugins/custom-<name>.mjs
 * Usage: node scripts/new-plugin-stub.mjs my-brand
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const name = process.argv[2];
if (!name || !/^[\w-]+$/.test(name)) {
  console.error('Usage: node scripts/new-plugin-stub.mjs <plugin-id>');
  process.exit(1);
}

const safe = name.replace(/[^a-zA-Z0-9_-]/g, '-');
const file = path.join(__dirname, '..', 'plugins', `custom-${safe}.mjs`);
const body = `/** @type {import('@tokiforge/core').Plugin} */
export const customPlugin = {
  name: 'custom-${safe}',
  exporter(tokens) {
    return JSON.stringify({ plugin: 'custom-${safe}', keys: Object.keys(tokens || {}) }, null, 2);
  },
};
`;

fs.writeFileSync(file, body, 'utf8');
console.log('Wrote', file);
