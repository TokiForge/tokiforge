import { defineConfig } from 'tsup';

export default defineConfig({
    entry: {
        index: 'src/index.tsx',
        server: 'src/server.ts',
    },
    format: ['cjs', 'esm'],
    dts: {
        compilerOptions: {
            skipLibCheck: true,
        },
    },
    splitting: false,
    sourcemap: true,
    clean: true,
    minify: true,
    treeshake: true,
    external: ['react', 'next', '@tokiforge/core'],
});
