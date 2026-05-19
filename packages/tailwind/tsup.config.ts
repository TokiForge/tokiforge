import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: {
    compilerOptions: {
      skipLibCheck: true,
      ignoreDeprecations: '6.0',
    },
  },
  external: ['tailwindcss'],
  splitting: false,
  sourcemap: true,
  clean: true,
  tsconfig: './tsconfig.json',
});

