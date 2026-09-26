import { defineConfig } from 'tsup';
import { copyFileSync, mkdirSync, existsSync, renameSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));

function copyPluginAssets() {
  mkdirSync(join(root, 'dist'), { recursive: true });
  copyFileSync(join(root, 'src/manifest.json'), join(root, 'dist/manifest.json'));
  copyFileSync(join(root, 'src/ui.html'), join(root, 'dist/ui.html'));
  const globalJs = join(root, 'dist/plugin.global.js');
  const pluginJs = join(root, 'dist/plugin.js');
  if (existsSync(globalJs)) {
    renameSync(globalJs, pluginJs);
  }
}

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: {
      compilerOptions: {
        skipLibCheck: true,
        ignoreDeprecations: '6.0',
      },
    },
    external: ['axios', '@tokiforge/core', '@tokiforge/core/node', '@tokiforge/core/runtime'],
    splitting: false,
    sourcemap: true,
    clean: true,
    tsconfig: './tsconfig.json',
    onSuccess: async () => {
      copyPluginAssets();
    },
  },
  {
    entry: {
      plugin: 'src/plugin.ts',
    },
    format: ['iife'],
    outDir: 'dist',
    platform: 'browser',
    target: 'es2017',
    splitting: false,
    sourcemap: false,
    clean: false,
    minify: false,
    dts: false,
    tsconfig: './tsconfig.json',
    onSuccess: async () => {
      copyPluginAssets();
    },
  },
]);
