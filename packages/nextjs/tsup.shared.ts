import type { Options } from 'tsup';

export const shared = {
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
} satisfies Options;
