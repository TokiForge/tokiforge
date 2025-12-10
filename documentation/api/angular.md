---
title: Angular API Reference | TokiForge
description: Complete API reference for @tokiforge/angular package. Angular service with Signals, theme management, and SSR support for Angular 17+.
---

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

### `initialized: Signal<boolean>`

Whether the service has been initialized.

```typescript
const isInit = this.themeService.initialized();
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

### `destroy()`

Cleanup the service and remove injected CSS.

**Signature:**

```typescript
destroy(): void
```

**Example:**

```typescript
this.themeService.destroy();
```

## Types

All types are exported from `@tokiforge/core`. See [Core API](/api/core) for details.

## Examples

See [Angular Example](/examples/angular) for complete usage examples.

