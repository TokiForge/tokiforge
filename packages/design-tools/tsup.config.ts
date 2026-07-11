import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['index.ts', 'sketch/index.ts', 'adobe-xd/index.ts'],
  format: ['cjs', 'esm'],
  dts: {
    compilerOptions: {
      skipLibCheck: true,
      ignoreDeprecations: '6.0',
    },
  },
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: true,
  treeshake: true,
  external: ['@tokiforge/core'],
});
