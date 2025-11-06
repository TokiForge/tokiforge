# Core API Reference

The `@tokiforge/core` package provides the foundation for TokiForge.

## TokenParser

Parse and validate design token files.

### Methods

#### `TokenParser.parse(filePath, options?)`

Parse a JSON or YAML token file.

```typescript
import { TokenParser } from '@tokiforge/core';

const tokens = TokenParser.parse('./tokens.json', {
  validate: true,        // Validate token structure (default: true)
  expandReferences: true // Expand token references (default: true)
});
```

**Options:**

- `validate?: boolean` - Validate token structure
- `expandReferences?: boolean` - Expand `{token.path}` references

**Returns:** `DesignTokens`

#### `TokenParser.validate(tokens)`

Validate token structure.

```typescript
TokenParser.validate(tokens);
```

Throws an error if tokens are invalid.

#### `TokenParser.expandReferences(tokens)`

Expand token references.

```typescript
const expanded = TokenParser.expandReferences(tokens);
```

## TokenExporter

Export tokens to various formats.

### Methods

#### `TokenExporter.export(tokens, options)`

Main export method.

```typescript
import { TokenExporter } from '@tokiforge/core';

const css = TokenExporter.export(tokens, {
  format: 'css',
  selector: ':root',
  prefix: 'hf',
});
```

**Options:**

- `format: 'css' | 'js' | 'ts' | 'scss' | 'json'` - Output format
- `selector?: string` - CSS selector (for CSS format)
- `prefix?: string` - CSS variable prefix
- `variables?: boolean` - Use CSS variables in JS/TS output

#### Format-Specific Methods

```typescript
// CSS
const css = TokenExporter.exportCSS(tokens, {
  selector: ':root',
  prefix: 'hf',
});

// SCSS
const scss = TokenExporter.exportSCSS(tokens, {
  prefix: 'hf',
});

// JavaScript
const js = TokenExporter.exportJS(tokens, {
  variables: false,
});

// TypeScript
const ts = TokenExporter.exportTS(tokens);

// JSON
const json = TokenExporter.exportJSON(tokens);
```

## ThemeRuntime

Runtime engine for theme switching.

### Constructor

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

### Methods

#### `init(selector?, prefix?)`

Initialize runtime and inject CSS variables.

```typescript
runtime.init(':root', 'hf');
```

#### `applyTheme(themeName, selector?, prefix?)`

Switch to a specific theme.

```typescript
runtime.applyTheme('dark');
```

#### `getCurrentTheme()`

Get current theme name.

```typescript
const current = runtime.getCurrentTheme();
```

#### `getThemeTokens(themeName?)`

Get tokens for a theme.

```typescript
const tokens = runtime.getThemeTokens('dark');
// or current theme
const currentTokens = runtime.getThemeTokens();
```

#### `getAvailableThemes()`

Get all available theme names.

```typescript
const themes = runtime.getAvailableThemes();
// ['light', 'dark']
```

#### `nextTheme()`

Cycle to the next theme.

```typescript
const newTheme = runtime.nextTheme();
```

#### `destroy()`

Cleanup runtime.

```typescript
runtime.destroy();
```

### Static Methods

#### `ThemeRuntime.detectSystemTheme()`

Detect system theme preference.

```typescript
const systemTheme = ThemeRuntime.detectSystemTheme();
// 'light' | 'dark'
```

#### `ThemeRuntime.watchSystemTheme(callback)`

Watch system theme changes.

```typescript
const unwatch = ThemeRuntime.watchSystemTheme((theme) => {
  console.log('System theme:', theme);
});

// Stop watching
unwatch();
```

## Types

### `DesignTokens`

```typescript
interface DesignTokens {
  [key: string]: TokenValue | DesignTokens | TokenValue[] | DesignTokens[];
}
```

### `TokenValue`

```typescript
interface TokenValue {
  value: string | number;
  type?: 'color' | 'dimension' | 'fontFamily' | 'fontWeight' | 'duration' | 'custom';
  description?: string;
}
```

### `Theme`

```typescript
interface Theme {
  name: string;
  tokens: DesignTokens;
}
```

### `ThemeConfig`

```typescript
interface ThemeConfig {
  themes: Theme[];
  defaultTheme?: string;
}
```

### `TokenExportOptions`

```typescript
interface TokenExportOptions {
  format?: 'css' | 'js' | 'ts' | 'scss' | 'json';
  selector?: string;
  prefix?: string;
  variables?: boolean;
}
```

## Examples

See the [Examples](/examples/react) section for complete usage examples.


