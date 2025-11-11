# Vue API Reference

Complete API reference for `@tokiforge/vue`.

## provideTheme

Provides theme context to Vue components. Supports type-safe token access through generic type parameters.

### Signature

```typescript
// Type-safe version (infers token type from config)
function provideTheme<T extends DesignTokens>(
  config: { themes: Array<{ name: string; tokens: T }>; defaultTheme?: string },
  options?: ProvideThemeOptions
): ThemeContext<T>;

// Backward compatible version
function provideTheme(
  config: ThemeConfig,
  options?: ProvideThemeOptions
): ThemeContext<DesignTokens>;
```

### Parameters

- `config: ThemeConfig | { themes: Array<{ name: string; tokens: T }>; defaultTheme?: string }` - Theme configuration object. When using the typed version, the token type is inferred from the config.
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

`ThemeContext<T>` - Context object with theme state and methods, where `T` is the token type (inferred or explicitly provided)

### Example

```vue
<script setup lang="ts">
import { provideTheme } from '@tokiforge/vue';

// Type-safe: token type is inferred from config
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

Composable to access theme context. Supports type-safe token access through generic type parameters.

### Signature

```typescript
function useTheme<T extends DesignTokens = DesignTokens>(): ThemeContext<T>
```

### Returns

```typescript
interface ThemeContext<T extends DesignTokens = DesignTokens> {
  theme: Ref<string>;
  tokens: ComputedRef<T>;  // Type-safe tokens!
  setTheme: (themeName: string) => void;
  nextTheme: () => void;
  availableThemes: ComputedRef<string[]>;
  runtime: ThemeRuntime;
  generateCSS?: (themeName?: string) => string; // Available in static mode
}
```

### Type-Safe Usage

```vue
<script setup lang="ts">
import { useTheme } from '@tokiforge/vue';

// Define your token type
interface MyDesignTokens extends DesignTokens {
  color: {
    primary: TokenValue;
    secondary: TokenValue;
  };
  radius: {
    sm: TokenValue;
    lg: TokenValue;
  };
}

// Use with type parameter for full type safety
const { tokens, setTheme } = useTheme<MyDesignTokens>();

// Now tokens.value.color.primary is fully typed!
const primaryColor = tokens.value.color.primary.value;
const borderRadius = tokens.value.radius.lg.value;
</script>

<template>
  <button
    :style="{
      backgroundColor: tokens.value.color.primary.value,
      borderRadius: tokens.value.radius.lg.value,
    }"
    @click="setTheme('dark')"
  >
    Switch Theme
  </button>
</template>
```

### Backward Compatible Usage

```vue
<script setup>
import { useTheme } from '@tokiforge/vue';

// Works without type parameter (defaults to DesignTokens)
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
