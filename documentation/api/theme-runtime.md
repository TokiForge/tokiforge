# ThemeRuntime API Reference

Complete API reference for the `ThemeRuntime` class from `@tokiforge/core`.

## Overview

`ThemeRuntime` is the core runtime engine for theme management. It handles theme switching, CSS variable injection, and system theme detection.

## Import

```typescript
import { ThemeRuntime } from '@tokiforge/core';
```

## Constructor

### `new ThemeRuntime(config)`

Create a new theme runtime instance.

**Signature:**

```typescript
constructor(config: ThemeConfig)
```

**Parameters:**

- `config: ThemeConfig` - Theme configuration

**Config:**

```typescript
interface ThemeConfig {
  themes: Theme[];
  defaultTheme?: string;
}

interface Theme {
  name: string;
  tokens: DesignTokens;
}
```

**Example:**

```typescript
import { ThemeRuntime } from '@tokiforge/core';

const runtime = new ThemeRuntime({
  themes: [
    { name: 'light', tokens: lightTokens },
    { name: 'dark', tokens: darkTokens },
  ],
  defaultTheme: 'light',
});
```

## Instance Methods

### `init(selector?, prefix?)`

Initialize the runtime and inject CSS variables for the default theme.

**Signature:**

```typescript
init(selector?: string, prefix?: string): void
```

**Parameters:**

- `selector?: string` - CSS selector (default: `:root`)
- `prefix?: string` - CSS variable prefix (default: `hf`)

**Example:**

```typescript
runtime.init(':root', 'hf');
```

**Note:** This method is SSR-safe and does nothing in server environments.

### `applyTheme(themeName, selector?, prefix?)`

Switch to a specific theme and inject its CSS variables.

**Signature:**

```typescript
applyTheme(
  themeName: string,
  selector?: string,
  prefix?: string
): void
```

**Parameters:**

- `themeName: string` - Name of the theme to apply
- `selector?: string` - CSS selector (default: `:root`)
- `prefix?: string` - CSS variable prefix (default: `hf`)

**Example:**

```typescript
runtime.applyTheme('dark');
runtime.applyTheme('light', ':root', 'myapp');
```

**Throws:**

- `Error` if theme name is not found

**Events:**

Dispatches a `tokiforge:theme-change` custom event:

```typescript
window.addEventListener('tokiforge:theme-change', (e) => {
  const { theme, tokens } = e.detail;
  console.log('Theme changed to:', theme);
});
```

### `getCurrentTheme()`

Get the name of the currently active theme.

**Signature:**

```typescript
getCurrentTheme(): string
```

**Returns:** `string` - Current theme name

**Example:**

```typescript
const current = runtime.getCurrentTheme();
console.log(current); // 'light' or 'dark'
```

### `getThemeTokens(themeName?)`

Get tokens for a specific theme or the current theme.

**Signature:**

```typescript
getThemeTokens(themeName?: string): DesignTokens
```

**Parameters:**

- `themeName?: string` - Theme name (optional, defaults to current theme)

**Returns:** `DesignTokens` - Theme tokens

**Example:**

```typescript
const tokens = runtime.getThemeTokens();

const darkTokens = runtime.getThemeTokens('dark');
```

**Throws:**

- `Error` if theme name is not found

### `getAvailableThemes()`

Get all available theme names.

**Signature:**

```typescript
getAvailableThemes(): string[]
```

**Returns:** `string[]` - Array of theme names

**Example:**

```typescript
const themes = runtime.getAvailableThemes();
console.log(themes); // ['light', 'dark']
```

### `nextTheme()`

Cycle to the next available theme.

**Signature:**

```typescript
nextTheme(): string
```

**Returns:** `string` - New theme name

**Example:**

```typescript
const newTheme = runtime.nextTheme();
console.log(newTheme); // 'dark' (if current was 'light')
```

**Behavior:**

- Cycles through themes in order
- Wraps around to first theme after last

### `destroy()`

Cleanup runtime and remove injected CSS.

**Signature:**

```typescript
destroy(): void
```

**Example:**

```typescript
runtime.destroy();
```

**Use Cases:**

- Component unmounting
- Cleanup before reinitialization
- Memory management

## Instance Methods (continued)

### `watchSystemTheme(callback)`

Watch for system theme changes and call the callback.

**Signature:**

```typescript
watchSystemTheme(
  callback: (theme: 'light' | 'dark') => void
): () => void
```

**Parameters:**

- `callback: (theme: 'light' | 'dark') => void` - Callback function

**Returns:** `() => void` - Unwatch function

**Example:**

```typescript
const unwatch = runtime.watchSystemTheme((theme) => {
  console.log('System theme changed to:', theme);
  runtime.applyTheme(theme);
});

unwatch();
```

**Note:** Returns a no-op function in server environments.

## Static Methods

### `ThemeRuntime.detectSystemTheme()`

Detect the system's color scheme preference.

**Signature:**

```typescript
static detectSystemTheme(): 'light' | 'dark'
```

**Returns:** `'light' | 'dark'` - System theme preference

**Example:**

```typescript
const systemTheme = ThemeRuntime.detectSystemTheme();
console.log(systemTheme);

runtime.applyTheme(systemTheme);
```

**Note:** Returns `'light'` in server environments.

## Usage Examples

### Basic Setup

```typescript
import { ThemeRuntime } from '@tokiforge/core';

const runtime = new ThemeRuntime({
  themes: [
    { name: 'light', tokens: lightTokens },
    { name: 'dark', tokens: darkTokens },
  ],
  defaultTheme: 'light',
});

runtime.init();

runtime.applyTheme('dark');
```

### System Theme Detection

```typescript
import { ThemeRuntime } from '@tokiforge/core';

const runtime = new ThemeRuntime(config);

const systemTheme = ThemeRuntime.detectSystemTheme();
runtime.applyTheme(systemTheme);

runtime.watchSystemTheme((theme) => {
  runtime.applyTheme(theme);
});
```

### Custom Selector and Prefix

```typescript
import { ThemeRuntime } from '@tokiforge/core';

const runtime = new ThemeRuntime(config);

runtime.init('body.theme-light', 'myapp');

runtime.applyTheme('dark', 'body.theme-dark', 'myapp');
```

### Theme Change Events

```typescript
import { ThemeRuntime } from '@tokiforge/core';

const runtime = new ThemeRuntime(config);
runtime.init();

window.addEventListener('tokiforge:theme-change', (e) => {
  const { theme, tokens } = e.detail;
  console.log('Theme:', theme);
  console.log('Tokens:', tokens);
});

runtime.applyTheme('dark');
```

### SSR-Safe Usage

```typescript
import { ThemeRuntime } from '@tokiforge/core';

const runtime = new ThemeRuntime(config);

if (typeof window !== 'undefined') {
  runtime.init();
  runtime.applyTheme('dark');
}
```

### Cleanup

```typescript
import { ThemeRuntime } from '@tokiforge/core';

const runtime = new ThemeRuntime(config);
runtime.init();

runtime.destroy();
```

## CSS Variable Injection

The runtime injects CSS variables into the document head:

```html
<style id="tokiforge-theme">
:root {
  --hf-color-primary: #7C3AED;
  --hf-color-accent: #06B6D4;
  --hf-spacing-md: 16px;
}
</style>
```

The style element is reused and updated on theme changes for performance.

## Best Practices

1. **Initialize once** - Call `init()` once per runtime instance
2. **Use consistent selectors** - Use the same selector/prefix throughout
3. **Cleanup on unmount** - Call `destroy()` when component unmounts
4. **Handle SSR** - Check for `window` before using in SSR environments
5. **Listen to events** - Use `tokiforge:theme-change` event for reactivity

## Related

- See [TokenParser API](/api/token-parser) for parsing tokens
- Check [TokenExporter API](/api/token-exporter) for exporting tokens
- View [Core API](/api/core) for complete overview
- Learn about [Theming Guide](/guide/theming) for theme strategies

