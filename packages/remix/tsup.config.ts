import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.tsx'],
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
    external: ['react', '@tokiforge/core'],
    noExternal: [],
});
