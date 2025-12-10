# TokiForge Vue Example

This is a complete example demonstrating how to use TokiForge with Vue 3.

> **TokiForge v1.2.0** | **Vue 3+**

## Setup

Before running this example, make sure you've built the TokiForge packages from the root of the monorepo:

```bash
# From the root directory
npm run build
```

Then install dependencies:

```bash
npm install
```

## Browser Compatibility

This example includes browser-compatible stubs for Node.js modules (`module`, `zlib`, `util`, `yaml`, `fs`, `path`) to ensure successful builds in browser environments. The Vite configuration automatically resolves these modules to stubs located in `src/stubs/`.

## Running

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Features

This example demonstrates:

- **Theme Configuration**: Setting up light and dark themes with design tokens
- **Theme Switching**: Toggle between themes using the `setTheme` function
- **CSS Variables**: Using TokiForge-generated CSS variables in your styles
- **Reactive Tokens**: Accessing theme tokens reactively using Vue's `useTheme` composable
- **Theme Context**: Providing theme context to child components using `provideTheme`

## Code Structure

- `src/App.vue` - Main component demonstrating theme usage
- `src/tokens.json` - Design tokens configuration
- `src/main.ts` - Application entry point

## Key Concepts

### Providing Theme Context

```vue
<script setup lang="ts">
import { provideTheme } from '@tokiforge/vue';

const themeConfig = {
  themes: [
    { name: 'light', tokens: lightTokens },
    { name: 'dark', tokens: darkTokens },
  ],
  defaultTheme: 'light',
};

provideTheme(themeConfig);
</script>
```

### Using Theme in Components

```vue
<script setup lang="ts">
import { useTheme } from '@tokiforge/vue';

const { theme, tokens, setTheme } = useTheme();
</script>
```

### Using CSS Variables

```vue
<style scoped>
.my-component {
  background-color: var(--hf-color-background-default);
  color: var(--hf-color-text-primary);
}
</style>
```

