import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: {
    compilerOptions: {
      skipLibCheck: true,
    },
  },
  external: ['axios'],
  splitting: false,
  sourcemap: true,
  clean: true,
  tsconfig: './tsconfig.json',
});

