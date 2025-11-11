# Vue Guide

> **TokiForge v1.1.1** | **Vue 3+**

Complete guide to using TokiForge with Vue 3.

## Installation

```bash
npm install @tokiforge/vue@^1.1.1 @tokiforge/core@^1.1.1
```

## Setup

### 1. Provide Theme Context

Use `provideTheme` to make themes available:

```vue
<script setup>
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

### 2. Use the Composable

Access theme data with `useTheme`:

```vue
<script setup>
import { useTheme } from '@tokiforge/vue';

const { tokens, theme, setTheme, availableThemes } = useTheme();
</script>
```

## API Reference

### `provideTheme(config, options?)`

Provides theme context to Vue components.

**Parameters:**
- `config: ThemeConfig` - Theme configuration
- `options?: ProvideThemeOptions` - Configuration options

**Options:**
- `mode?: 'dynamic' | 'static'` - Theme mode (default: `'dynamic'`)
  - `'dynamic'`: Runtime CSS injection (default)
  - `'static'`: Body class-based (zero JS overhead)
- `persist?: boolean` - Save theme to localStorage (default: `true`)
- `watchSystemTheme?: boolean` - Auto-detect system theme (default: `false`)
- `bodyClassPrefix?: string` - Body class prefix for static mode (default: `'theme'`)
- `selector?: string` - CSS selector (default: `:root`)
- `prefix?: string` - CSS variable prefix (default: `hf`)
- `defaultTheme?: string` - Override default theme

**Must be called before `useTheme()`**

### `useTheme()`

Composable to access theme context.

**Returns:**
```typescript
{
  theme: Ref<string>;                    // Current theme name
  tokens: ComputedRef<DesignTokens>;      // Current theme tokens
  setTheme: (name: string) => void;       // Switch theme
  nextTheme: () => void;                  // Cycle to next theme
  availableThemes: ComputedRef<string[]>; // Available themes
  runtime: ThemeRuntime;                  // Runtime instance
  generateCSS?: (themeName?: string) => string; // Generate CSS (static mode)
}
```

## Examples

### Basic Usage

```vue
<template>
  <div :style="{ backgroundColor: 'var(--hf-color-background-default)' }">
    <button @click="toggleTheme">Switch Theme</button>
  </div>
</template>

<script setup>
import { provideTheme, useTheme } from '@tokiforge/vue';

provideTheme(themeConfig);
const { theme, setTheme } = useTheme();

const toggleTheme = () => {
  setTheme(theme.value === 'light' ? 'dark' : 'light');
};
</script>
```

### Using Tokens

```vue
<template>
  <button
    :style="{
      backgroundColor: tokens.color.primary,
      borderRadius: tokens.radius.lg,
    }"
  >
    Click me
  </button>
</template>

<script setup>
import { provideTheme, useTheme } from '@tokiforge/vue';

provideTheme(themeConfig);
const { tokens } = useTheme();
</script>
```

### CSS Variables

```vue
<template>
  <div class="card">
    Content
  </div>
</template>

<style scoped>
.card {
  background-color: var(--hf-color-background-default);
  color: var(--hf-color-text-primary);
  border-radius: var(--hf-radius-md);
  padding: var(--hf-spacing-lg);
}
</style>
```

## TypeScript

Full TypeScript support:

```typescript
import type { ThemeConfig, DesignTokens } from '@tokiforge/vue';
import { provideTheme, useTheme } from '@tokiforge/vue';

const themeConfig: ThemeConfig = {
  themes: [{ name: 'light', tokens: lightTokens }],
};

provideTheme(themeConfig);
const { tokens } = useTheme();
// tokens is fully typed!
```

## Static Mode (Recommended)

For best performance, use static mode with body classes:

```vue
<script setup>
import { provideTheme } from '@tokiforge/vue';

provideTheme(themeConfig, {
  mode: 'static',        // Use body classes
  persist: true,         // Auto-save preference
  watchSystemTheme: true, // Follow system theme
});
</script>

<style>
/* CSS variables scoped by body class */
body.theme-light {
  --hf-color-background-default: #FFFFFF;
  --hf-color-text-primary: #1E293B;
}

body.theme-dark {
  --hf-color-background-default: #0F172A;
  --hf-color-text-primary: #F8FAFC;
}
</style>
```

Benefits:
- ✅ Zero JavaScript overhead
- ✅ Automatic localStorage persistence
- ✅ System theme detection
- ✅ All plugin features (token parsing, references)

## CSS Generation

Generate CSS files at build time:

```javascript
// generate-themes.js
import { generateCombinedThemeCSS } from '@tokiforge/vue';
import { writeFileSync } from 'fs';

const css = generateCombinedThemeCSS(themeConfig, {
  bodyClassPrefix: 'theme',
  prefix: 'hf',
});

writeFileSync('src/themes/generated.css', css);
```

## Best Practices

1. **Use static mode** - Best performance with zero JS overhead
2. **Call `provideTheme` early** - In root component or app setup
3. **Use computed properties** - Tokens are already computed refs
4. **Prefer CSS variables** - Better performance
5. **Type your config** - Use TypeScript for type safety
6. **Generate CSS at build time** - For static sites

## Next Steps

- See [Vue Example](/examples/vue) for complete example
- Check [API Reference](/api/vue) for full API docs
- Learn about [Advanced Theming](/guide/theming)


