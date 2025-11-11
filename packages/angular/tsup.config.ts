import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: {
    compilerOptions: {
      skipLibCheck: true,
      noUnusedLocals: false,
      noUnusedParameters: false,
    },
  },
  splitting: false,
  sourcemap: false,
  clean: true,
  minify: false,
  treeshake: true,
  external: ['@angular/core', '@angular/common', '@tokiforge/core'],
  noExternal: [],
  esbuildOptions(options) {
    options.keepNames = true;
    options.target = 'es2022';
    options.tsconfig = './tsconfig.json';
  },
  tsconfig: './tsconfig.json',
  esbuildPlugins: [],
});

