import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/register.tsx'],
  format: ['cjs', 'esm'],
  dts: {
    compilerOptions: {
      ignoreDeprecations: '6.0',
    },
  },
  sourcemap: true,
  clean: true,
  minify: true,
  treeshake: true,
  external: [
    'react',
    'react/jsx-runtime',
    '@storybook/addons',
    '@storybook/components',
    '@storybook/api',
    '@tokiforge/core',
    '@tokiforge/core/runtime',
  ],
});
