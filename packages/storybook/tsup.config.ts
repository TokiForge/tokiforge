import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  minify: true,
  treeshake: true,
  external: ['react', '@storybook/addons', '@storybook/components', '@storybook/api', '@tokiforge/core'],
});
