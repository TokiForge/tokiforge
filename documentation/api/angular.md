# Angular API Reference

Complete API reference for `@tokiforge/angular`.

## ThemeService

Injectable service that manages theme state and operations.

### Constructor

```typescript
constructor()
```

The service is provided in root, so you can inject it anywhere:

```typescript
import { inject } from '@angular/core';
import { ThemeService } from '@tokiforge/angular';

export class MyComponent {
  themeService = inject(ThemeService);
}
```

## Methods

### `init(config, options?)`

Initialize the theme service.

**Signature:**

```typescript
init(config: ThemeConfig, options?: ThemeInitOptions): void
```

**Parameters:**

- `config: ThemeConfig` - Theme configuration object
- `options?: ThemeInitOptions` - Initialization options

**Options:**

```typescript
interface ThemeInitOptions {
  selector?: string;           // CSS selector (default: ':root')
  prefix?: string;            // CSS variable prefix (default: 'hf')
  defaultTheme?: string;      // Override default theme
  mode?: 'dynamic' | 'static'; // Theme mode (default: 'dynamic')
  persist?: boolean;          // Save to localStorage (default: true)
  watchSystemTheme?: boolean; // Auto-detect system theme (default: false)
  bodyClassPrefix?: string;   // Body class prefix for static mode (default: 'theme')
}
```

**Example:**

```typescript
this.themeService.init(themeConfig, {
  mode: 'static',
  persist: true,
  watchSystemTheme: true,
  bodyClassPrefix: 'theme',
  prefix: 'hf',
});
```

### `setTheme(themeName)`

Switch to a specific theme.

**Signature:**

```typescript
setTheme(themeName: string): void
```

**Parameters:**

- `themeName: string` - Name of the theme to apply

**Example:**

```typescript
this.themeService.setTheme('dark');
```

### `nextTheme()`

Cycle to the next available theme.

**Signature:**

```typescript
nextTheme(): void
```

**Example:**

```typescript
this.themeService.nextTheme();
```

### `generateCSS(themeName?)`

Generate CSS for a theme (available in static mode).

**Signature:**

```typescript
generateCSS(themeName?: string): string
```

**Parameters:**

- `themeName?: string` - Theme name (defaults to current theme)

**Returns:**

CSS string with theme variables

**Example:**

```typescript
const css = this.themeService.generateCSS('dark');
```

### `getContext()`

Get the complete theme context object.

**Signature:**

```typescript
getContext(): ThemeContext
```

**Returns:**

```typescript
interface ThemeContext {
  theme: string;
  tokens: DesignTokens;
  setTheme: (themeName: string) => void;
  nextTheme: () => void;
  availableThemes: string[];
  runtime: ThemeRuntime;
  generateCSS?: (themeName?: string) => string; // Available in static mode
}
```

### `getRuntime()`

Get the underlying `ThemeRuntime` instance.

**Signature:**

```typescript
getRuntime(): ThemeRuntime | null
```

## Properties (Signals)

### `theme: Signal<string>`

Current theme name.

```typescript
const currentTheme = this.themeService.theme();
```

### `tokens: Signal<DesignTokens>`

Current theme tokens.

```typescript
const tokens = this.themeService.tokens();
```

### `availableThemes: Signal<string[]>`

All available theme names.

```typescript
const themes = this.themeService.availableThemes();
```

## Static Mode

When using static mode, themes are applied via body classes instead of runtime injection:

```typescript
this.themeService.init(themeConfig, {
  mode: 'static',
  bodyClassPrefix: 'theme',
});
```

This adds classes like `theme-light` or `theme-dark` to the body element. CSS variables are scoped by these classes.

## CSS Generation Utilities

### `generateThemeCSS(config, options?)`

Generate separate CSS files for each theme.

```typescript
import { generateThemeCSS } from '@tokiforge/angular';

const files = generateThemeCSS(themeConfig, {
  bodyClassPrefix: 'theme',
  prefix: 'hf',
  format: 'css',
});
```

### `generateCombinedThemeCSS(config, options?)`

Generate a single CSS file with all themes.

```typescript
import { generateCombinedThemeCSS } from '@tokiforge/angular';

const css = generateCombinedThemeCSS(themeConfig, {
  bodyClassPrefix: 'theme',
  prefix: 'hf',
});
```

## Types

All types are exported from `@tokiforge/core`. See [Core API](/api/core) for details.

## Examples

See [Angular Example](/examples/angular) for complete usage examples.

