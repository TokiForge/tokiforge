import { defineConfig } from 'tsup';
import { shared } from './tsup.shared';

// The server entry is built separately by tsup.config.server.ts; the build
// script chains the two so they never run concurrently. Building them as a
// single config array made tsup run both in parallel inside one process,
// which let this config's `clean` race the server build's output and
// intermittently crashed Node (heap corruption) on Windows CI.
export default defineConfig({
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
});
