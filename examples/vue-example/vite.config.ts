import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      'fs': resolve(__dirname, 'src/stubs/fs.ts'),
      'path': resolve(__dirname, 'src/stubs/path.ts'),
      'module': resolve(__dirname, 'src/stubs/module.ts'),
      'yaml': resolve(__dirname, 'src/stubs/yaml.ts'),
      'zlib': resolve(__dirname, 'src/stubs/zlib.ts'),
      'util': resolve(__dirname, 'src/stubs/util.ts'),
    },
  },
  optimizeDeps: {
    exclude: ['fs', 'path', 'module', 'yaml', 'zlib', 'util'],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
        if (warning.code === 'UNRESOLVED_IMPORT' && 
            (warning.source === 'module' || warning.source === 'fs' || warning.source === 'path' ||
             warning.source === 'zlib' || warning.source === 'util' || warning.source === 'yaml')) return;
        if (warning.message?.includes('fs') || warning.message?.includes('path') || 
            warning.message?.includes('module') || warning.message?.includes('yaml') ||
            warning.message?.includes('zlib') || warning.message?.includes('createRequire') ||
            warning.message?.includes('util') || warning.message?.includes('worker_threads')) return;
        warn(warning);
      },
    },
  },
});

