# Svelte Guide

> **TokiForge v1.1.1**

Complete guide to using TokiForge with Svelte.

## Installation

```bash
npm install @tokiforge/svelte@^1.1.1 @tokiforge/core@^1.1.1
```

## Setup

### 1. Create Theme Store

Use `createThemeStore` to create a reactive theme store:

```svelte
<script>
  import { createThemeStore } from '@tokiforge/svelte';

  const themeConfig = {
    themes: [
      { name: 'light', tokens: lightTokens },
      { name: 'dark', tokens: darkTokens },
    ],
    defaultTheme: 'light',
  };

  const themeStore = createThemeStore(themeConfig);
</script>
```

### 2. Use the Store

Access theme data using Svelte's reactive syntax:

```svelte
<script>
  import { createThemeStore } from '@tokiforge/svelte';

  const themeStore = createThemeStore(themeConfig);
</script>

<button on:click={() => themeStore.setTheme('dark')}>
  Current: {$themeStore.theme}
</button>
```

## API Reference

### `createThemeStore(config, selector?, prefix?, defaultTheme?)`

Creates a reactive theme store.

**Parameters:**
- `config: ThemeConfig` - Theme configuration
- `selector?: string` - CSS selector (default: `:root`)
- `prefix?: string` - CSS variable prefix (default: `hf`)
- `defaultTheme?: string` - Override default theme

**Returns:**

```typescript
{
  theme: Writable<string>;              // Current theme name
  tokens: Readable<DesignTokens>;        // Current theme tokens
  setTheme: (name: string) => void;     // Switch theme
  nextTheme: () => void;                 // Cycle to next theme
  availableThemes: Readable<string[]>;  // Available themes
  runtime: ThemeRuntime;                // Runtime instance
}
```

## Examples

### Basic Usage

```svelte
<script>
  import { createThemeStore } from '@tokiforge/svelte';

  const themeStore = createThemeStore(themeConfig);
</script>

<div style="background-color: var(--hf-color-background-default)">
  <button on:click={() => themeStore.setTheme('dark')}>
    Switch Theme
  </button>
</div>
```

### Using Tokens

```svelte
<script>
  import { createThemeStore } from '@tokiforge/svelte';

  const themeStore = createThemeStore(themeConfig);
</script>

<button
  style="
    background-color: {$themeStore.tokens.color.primary.value};
    border-radius: {$themeStore.tokens.radius.lg.value};
  "
>
  Click me
</button>
```

### CSS Variables

```svelte
<style>
  .card {
    background-color: var(--hf-color-background-default);
    color: var(--hf-color-text-primary);
    border-radius: var(--hf-radius-md);
    padding: var(--hf-spacing-lg);
  }
</style>

<div class="card">
  Content
</div>
```

### Theme Switcher

```svelte
<script>
  import { createThemeStore } from '@tokiforge/svelte';

  const themeStore = createThemeStore(themeConfig);
</script>

<select
  value={$themeStore.theme}
  on:change={(e) => themeStore.setTheme(e.target.value)}
>
  {#each $themeStore.availableThemes as themeName}
    <option value={themeName}>{themeName}</option>
  {/each}
</select>
```

## TypeScript

Full TypeScript support:

```typescript
import { createThemeStore } from '@tokiforge/svelte';
import type { ThemeConfig } from '@tokiforge/core';

const themeConfig: ThemeConfig = {
  themes: [{ name: 'light', tokens: lightTokens }],
};

const themeStore = createThemeStore(themeConfig);
// themeStore is fully typed!
```

## Best Practices

1. **Create store early** - In your root component or app initialization
2. **Use CSS variables** - Better performance than reactive tokens
3. **Type your config** - Use TypeScript for type safety
4. **Use reactive syntax** - Leverage Svelte's `$` syntax for reactivity

## Next Steps

- See [Svelte Example](/examples/svelte) for complete example
- Check [API Reference](/api/svelte) for full API docs
- Learn about [Advanced Theming](/guide/theming)

