import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  tsconfig: './tsconfig.json',
  dts: {
    compilerOptions: {
      noUnusedLocals: false,
      noUnusedParameters: false,
    },
  },
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: true,
  treeshake: true,
  external: ['fs', 'path', 'module', 'yaml', 'zlib', 'util', 'fs/promises', 'worker_threads'],
  noExternal: [],
});

