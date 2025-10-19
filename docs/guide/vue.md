# Vue Guide

Complete guide to using TokiForge with Vue 3.

## Installation

```bash
npm install @tokiforge/vue @tokiforge/core
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

### `provideTheme(config, selector?, prefix?, defaultTheme?)`

Provides theme context to Vue components.

**Parameters:**
- `config: ThemeConfig` - Theme configuration
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

## Best Practices

1. **Call `provideTheme` early** - In root component or app setup
2. **Use computed properties** - Tokens are already computed refs
3. **Prefer CSS variables** - Better performance
4. **Type your config** - Use TypeScript for type safety

## Next Steps

- See [Vue Example](/examples/vue) for complete example
- Check [API Reference](/api/vue) for full API docs
- Learn about [Advanced Theming](/guide/theming)


