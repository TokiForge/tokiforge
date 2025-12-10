import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { resolve } from 'path';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    open: true,
  },
  resolve: {
    alias: {
      fs: resolve(__dirname, 'src/stubs/fs.ts'),
      path: resolve(__dirname, 'src/stubs/path.ts'),
      module: resolve(__dirname, 'src/stubs/module.ts'),
      yaml: resolve(__dirname, 'src/stubs/yaml.ts'),
    },
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      external: ['fs', 'path', 'module', 'yaml', 'zlib', 'util', 'fs/promises', 'worker_threads'],
      output: {
        globals: {
          'module': 'module',
          'fs': 'fs',
          'path': 'path',
        },
      },
      onwarn(warning, warn) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
        if (warning.code === 'UNRESOLVED_IMPORT' && 
            (warning.source === 'module' || warning.source === 'fs' || warning.source === 'path')) return;
        if (warning.message?.includes('fs') || warning.message?.includes('path') || 
            warning.message?.includes('module') || warning.message?.includes('yaml') ||
            warning.message?.includes('zlib') || warning.message?.includes('createRequire') ||
            warning.message?.includes('worker_threads')) return;
        warn(warning);
      },
    },
  },
});

