import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/cli.ts'],
  format: ['cjs'],
  outExtension: () => ({ js: '.js' }),
  dts: false,
  splitting: false,
  sourcemap: false,
  clean: true,
});

