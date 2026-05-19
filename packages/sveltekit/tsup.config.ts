import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: {
        compilerOptions: {
            ignoreDeprecations: '6.0',
        },
    },
    splitting: false,
    sourcemap: true,
    clean: true,
    minify: true,
    treeshake: true,
    external: ['svelte', '@sveltejs/kit', 'svelte/store', '@tokiforge/core'],
});
