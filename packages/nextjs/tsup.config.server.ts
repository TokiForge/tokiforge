import { defineConfig } from 'tsup';
import { shared } from './tsup.shared';

export default defineConfig({
    ...shared,
    entry: { server: 'src/server.ts' },
    // The index build (tsup.config.ts) runs first and owns the dist clean.
    clean: false,
});
