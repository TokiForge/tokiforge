import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/cli.ts'],
  // package.json declares "type": "module", so .js output must be ESM;
  // a CJS bundle here crashes with "require is not defined in ES module scope"
  format: ['esm'],
  outExtension: () => ({ js: '.js' }),
  dts: false,
  splitting: false,
  sourcemap: false,
  clean: true,
  minify: true,
  treeshake: true,
  bundle: true,
  external: ['@tokiforge/core'],
});

