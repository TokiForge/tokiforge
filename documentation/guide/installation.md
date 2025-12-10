# Installation

> **TokiForge v1.2.0**

## Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

## Package Installation

### Core Package

The core package is required for all TokiForge functionality:

```bash
npm install @tokiforge/core@^1.2.0
```

> **Note:** TokiForge v1.2.0 includes browser-compatible builds. For browser environments, Node.js-specific features (like `TokenParser.parse()` for file reading) are automatically handled with stubs. See [Troubleshooting](/guide/troubleshooting#browser-build-errors) for build configuration details.

### Framework Adapters

Install the adapter for your framework:

#### React

```bash
npm install @tokiforge/react@^1.2.0
```

Requires React 16.8+ (hooks support).

#### Vue

```bash
npm install @tokiforge/vue@^1.2.0
```

Requires Vue 3.0+.

#### Svelte

```bash
npm install @tokiforge/svelte@^1.2.0
```

Requires Svelte 3.0+.

#### Angular

```bash
npm install @tokiforge/angular@^1.2.0
```

Requires Angular 17.0+.

### CLI Tool

Install globally for easy access:

```bash
npm install -g tokiforge-cli@^1.2.0
```

Or use with `npx`:

```bash
npx tokiforge-cli@^1.2.0 init
```

## TypeScript Support

TokiForge is built with TypeScript and includes full type definitions. No additional `@types` packages needed!

## CDN Usage

For vanilla JavaScript projects, you can use the core package via CDN:

```html
<script type="module">
  import { ThemeRuntime } from 'https://cdn.jsdelivr.net/npm/@tokiforge/core@1.2.0/dist/index.js';
  
  const runtime = new ThemeRuntime({
    themes: [{ name: 'default', tokens: myTokens }],
  });
  
  runtime.init();
</script>
```

**Note:** The core package uses `index.js` for ESM (not `index.mjs`) because it has `"type": "module"` in its package.json.

## Framework-Specific Setup

### React

```tsx
import { ThemeProvider } from '@tokiforge/react';

// Wrap your app
function App() {
  return (
    <ThemeProvider config={themeConfig}>
      <YourApp />
    </ThemeProvider>
  );
}
```

### Vue

```vue
<script setup>
import { provideTheme } from '@tokiforge/vue';

provideTheme(themeConfig);
</script>
```

### Svelte

```svelte
<script>
import { createThemeStore } from '@tokiforge/svelte';

const themeStore = createThemeStore(themeConfig);
</script>
```

## Verification

After installation, verify it's working:

```bash
# Check CLI
TokiForge --version

# Or test in your code
import { TokenParser } from '@tokiforge/core';
console.log('TokiForge loaded!');
```

## Troubleshooting

### Module Not Found

If you get module not found errors:

1. Make sure you've installed the package: `npm install @tokiforge/core`
2. Check your Node.js version: `node --version` (should be 18+)
3. Try clearing cache: `npm cache clean --force`

### Vue Package Resolution Error

If you get `Failed to resolve entry for package "@tokiforge/vue"`:

1. Ensure you're using v1.2.0 or later: `npm install @tokiforge/vue@^1.2.0`
2. Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
3. See [Troubleshooting Guide](/guide/troubleshooting#vue-package-resolution-error) for details

### TypeScript Errors

If TypeScript can't find types:

1. Ensure you're using TypeScript 5.0+
2. Check your `tsconfig.json` includes node_modules
3. Restart your TypeScript server

### Build Errors

If you encounter build errors:

1. Make sure all dependencies are installed
2. Check that you're using compatible versions
3. See the [Troubleshooting Guide](/guide/troubleshooting) for more help


