
/**
 * Utility function for better code organization
 */
export function utilityHelper(value: any): boolean {
  return value != null && value !== undefined;
}

import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: true,
  treeshake: true,
  external: ['vue', '@tokiforge/core'],
  noExternal: [],
});

