---
title: Svelte API Reference | TokiForge
description: Complete API reference for @tokiforge/svelte package. Svelte stores, createThemeStore, and reactive theme management for Svelte applications.
---

# Svelte API Reference

Complete API reference for `@tokiforge/svelte`.

## createThemeStore

Creates a reactive theme store for Svelte.

### Signature

```typescript
function createThemeStore(
  config: ThemeConfig,
  selector?: string,
  prefix?: string,
  defaultTheme?: string
): ThemeStore
```

### Parameters

- `config: ThemeConfig` - Theme configuration object
- `selector?: string` - CSS selector (default: `:root`)
- `prefix?: string` - CSS variable prefix (default: `hf`)
- `defaultTheme?: string` - Override default theme name

### Returns

```typescript
interface ThemeStore {
  theme: Writable<string>;
  tokens: Readable<DesignTokens>;
  setTheme: (themeName: string) => void;
  nextTheme: () => void;
  availableThemes: Readable<string[]>;
  runtime: ThemeRuntime;
}
```

### Example

```svelte
<script>
  import { createThemeStore } from '@tokiforge/svelte';

  const themeStore = createThemeStore({
    themes: [
      { name: 'light', tokens: lightTokens },
      { name: 'dark', tokens: darkTokens },
    ],
    defaultTheme: 'light',
  });
</script>

<button on:click={() => themeStore.setTheme('dark')}>
  Current: {$themeStore.theme}
</button>
```

## Store Properties

### `theme: Writable<string>`

Current theme name. Use `$themeStore.theme` to access reactively.

```svelte
<p>Current theme: {$themeStore.theme}</p>
```

### `tokens: Readable<DesignTokens>`

Current theme tokens. Use `$themeStore.tokens` to access reactively.

```svelte
<button
  style="background-color: {$themeStore.tokens.color.primary.value}"
>
  Click me
</button>
```

### `setTheme(themeName: string): void`

Switch to a specific theme.

```svelte
<button on:click={() => themeStore.setTheme('dark')}>
  Switch to Dark
</button>
```

### `nextTheme(): void`

Cycle to the next available theme.

```svelte
<button on:click={() => themeStore.nextTheme()}>
  Next Theme
</button>
```

### `availableThemes: Readable<string[]>`

All available theme names.

```svelte
{#each $themeStore.availableThemes as themeName}
  <option value={themeName}>{themeName}</option>
{/each}
```

### `runtime: ThemeRuntime`

The underlying `ThemeRuntime` instance for advanced usage.

## Types

All types are exported from `@tokiforge/core`. See [Core API](/api/core) for details.

## Examples

See [Svelte Example](/examples/svelte) for complete usage examples.

