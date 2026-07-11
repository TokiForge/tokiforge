import { defineConfig } from 'tsup';

const shared = {
    format: ['cjs', 'esm'] as const,
    dts: {
        compilerOptions: {
            skipLibCheck: true,
            ignoreDeprecations: '6.0',
        },
    },
    splitting: false,
    sourcemap: true,
    minify: true,
    treeshake: true,
    external: ['react', 'next', '@tokiforge/core'],
};

export default defineConfig([
    {
        ...shared,
        entry: { index: 'src/index.tsx' },
        clean: true,
        // rollup (tsup's treeshake pass) strips module-level directives,
        // including the banner; esbuild alone keeps it.
        treeshake: false,
        banner: {
            // Next.js App Router needs the client boundary marker on the
            // built provider bundle.
            js: "'use client';",
        },
    },
    {
        ...shared,
        entry: { server: 'src/server.ts' },
        clean: false,
    },
]);
