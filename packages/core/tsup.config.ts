import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/runtime.ts', 'src/tools.ts', 'src/node.ts'],
  format: ['cjs', 'esm'],
  tsconfig: './tsconfig.json',
  dts: {
    compilerOptions: {
      noUnusedLocals: false,
      noUnusedParameters: false,
      ignoreDeprecations: '6.0',
    },
  },
  splitting: true,
  sourcemap: true,
  clean: true,
  minify: true,
  treeshake: true,
  external: ['fs', 'path', 'module', 'yaml', 'zlib', 'util', 'fs/promises', 'worker_threads', 'node:fs', 'node:path', 'node:url'],
  noExternal: [],
});
