# Vue API Reference

Complete API reference for `@tokiforge/vue`.

## provideTheme

Provides theme context to Vue components.

### Signature

```typescript
function provideTheme(
  config: ThemeConfig,
  options?: ProvideThemeOptions
): ThemeContext
```

### Parameters

- `config: ThemeConfig` - Theme configuration object
- `options?: ProvideThemeOptions` - Configuration options

### Options

```typescript
interface ProvideThemeOptions {
  selector?: string;           // CSS selector (default: ':root')
  prefix?: string;            // CSS variable prefix (default: 'hf')
  defaultTheme?: string;      // Override default theme
  mode?: 'dynamic' | 'static'; // Theme mode (default: 'dynamic')
  persist?: boolean;          // Save to localStorage (default: true)
  watchSystemTheme?: boolean; // Auto-detect system theme (default: false)
  bodyClassPrefix?: string;   // Body class prefix for static mode (default: 'theme')
}
```

### Returns

`ThemeContext` - Context object with theme state and methods

### Example

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

provideTheme(themeConfig, {
  mode: 'static',
  persist: true,
  watchSystemTheme: true,
});
</script>
```

## useTheme

Composable to access theme context.

### Signature

```typescript
function useTheme(): ThemeContext
```

### Returns

```typescript
interface ThemeContext {
  theme: Ref<string>;
  tokens: ComputedRef<DesignTokens>;
  setTheme: (themeName: string) => void;
  nextTheme: () => void;
  availableThemes: ComputedRef<string[]>;
  runtime: ThemeRuntime;
  generateCSS?: (themeName?: string) => string; // Available in static mode
}
```

### Example

```vue
<script setup>
import { useTheme } from '@tokiforge/vue';

const { theme, tokens, setTheme } = useTheme();

function toggleTheme() {
  setTheme(theme.value === 'light' ? 'dark' : 'light');
}
</script>

<template>
  <button @click="toggleTheme">
    Current: {{ theme }}
  </button>
</template>
```

## CSS Generation Utilities

### `generateThemeCSS(config, options?)`

Generate separate CSS files for each theme.

```typescript
import { generateThemeCSS } from '@tokiforge/vue';

const files = generateThemeCSS(themeConfig, {
  bodyClassPrefix: 'theme',
  prefix: 'hf',
  format: 'css',
});
```

### `generateCombinedThemeCSS(config, options?)`

Generate a single CSS file with all themes.

```typescript
import { generateCombinedThemeCSS } from '@tokiforge/vue';

const css = generateCombinedThemeCSS(themeConfig, {
  bodyClassPrefix: 'theme',
  prefix: 'hf',
});
```

## Static Mode

When using static mode, themes are applied via body classes instead of runtime injection:

```typescript
provideTheme(themeConfig, {
  mode: 'static',
  bodyClassPrefix: 'theme',
});
```

This adds classes like `theme-light` or `theme-dark` to the body element. CSS variables are scoped by these classes, providing zero JavaScript overhead.

## Types

All types are exported from `@tokiforge/core`. See [Core API](/api/core) for details.

## Examples

See [Vue Example](/examples/vue) for complete usage examples.




## Improvements

- Enhanced documentation
- Better examples
- Updated usage guide
