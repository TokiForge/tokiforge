---
title: Core API Reference | TokiForge
description: Complete API reference for @tokiforge/core package. Learn about ThemeRuntime, TokenParser, TokenExporter, and all core classes and methods.
---

---
title: Core API Reference | TokiForge
description: Complete API reference for TokiForge core classes. ThemeRuntime, TokenExporter, TokenParser, and all core functionality for design token management.
---

# Core API Reference

Complete API reference for `@tokiforge/core` package.

---

## ThemeRuntime

Central class for managing theme lifecycle and CSS variable injection.

### Constructor

```typescript
new ThemeRuntime(config: ThemeConfig)
```

Creates a new theme runtime instance.

**Parameters:**
- `config: ThemeConfig` - Theme configuration object

**Example:**
```typescript
import { ThemeRuntime } from '@tokiforge/core';

const runtime = new ThemeRuntime({
  themes: [
    {
      name: 'light',
      tokens: {
        color: {
          primary: { value: '#3b82f6' },
          background: { value: '#ffffff' },
        },
      },
    },
    {
      name: 'dark',
      tokens: {
        color: {
          primary: { value: '#60a5fa' },
          background: { value: '#1f2937' },
        },
      },
    },
  ],
  defaultTheme: 'light',
});
```

---

### init()

```typescript
async init(selector?: string, prefix?: string): Promise<void>
```

Initialize the runtime and apply the default theme.

**Parameters:**
- `selector?: string` - CSS selector for variable injection (default: `:root`)
- `prefix?: string` - Prefix for CSS variables (default: `hf`)

**Example:**
```typescript
await runtime.init(':root', 'app');
// CSS variables will be: --app-color-primary, --app-color-background, etc.
```

---

### applyTheme()

```typescript
async applyTheme(
  themeName: string, 
  selector?: string, 
  prefix?: string
): Promise<void>
```

Apply a theme by injecting CSS variables.

**Parameters:**
- `themeName: string` - Name of the theme to apply
- `selector?: string` - CSS selector (default: `:root`)
- `prefix?: string` - Variable prefix (default: `hf`)

**Throws:**
- `ThemeNotFoundError` - If theme doesn't exist

**Events:**
- Dispatches `tokiforge:theme-change` event with `{ theme, tokens }`

**Example:**
```typescript
await runtime.applyTheme('dark');

// With custom selector and prefix
await runtime.applyTheme('dark', '[data-theme="dark"]', 'custom');
```

---

### getCurrentTheme()

```typescript
getCurrentTheme(): string | null
```

Get the currently active theme name.

**Returns:** `string | null` - Current theme name or null if none applied

**Example:**
```typescript
const currentTheme = runtime.getCurrentTheme();
console.log(currentTheme); // 'dark'
```

---

### getThemeTokens()

```typescript
getThemeTokens(themeName: string): DesignTokens
```

Get token values for a specific theme.

**Parameters:**
- `themeName: string` - Theme name

**Returns:** `DesignTokens` - Token object

**Throws:**
- `ThemeError` - If theme not loaded or doesn't exist

**Example:**
```typescript
const tokens = runtime.getThemeTokens('dark');
console.log(tokens.color.primary.value); // '#60a5fa'
```

---

### getAvailableThemes()

```typescript
getAvailableThemes(): string[]
```

Get list of all available theme names.

**Returns:** `string[]` - Array of theme names

**Example:**
```typescript
const themes = runtime.getAvailableThemes();
console.log(themes); // ['light', 'dark']
```

---

### nextTheme()

```typescript
nextTheme(): string
```

Get the next theme in rotation.

**Returns:** `string` - Next theme name

**Example:**
```typescript
const next = runtime.nextTheme();
await runtime.applyTheme(next);
```

---

### watchSystemTheme()

```typescript
watchSystemTheme(callback: (theme: string) => void): () => void
```

Watch for system theme changes (light/dark).

**Parameters:**
- `callback: (theme: string) => void` - Called with 'light' or 'dark'

**Returns:** `() => void` - Unwatch function

**Example:**
```typescript
const unwatch = runtime.watchSystemTheme((systemTheme) => {
  console.log('System theme changed to:', systemTheme);
  runtime.applyTheme(systemTheme);
});

// Later: stop watching
unwatch();
```

---

### destroy()

```typescript
destroy(): void
```

Clean up runtime resources and remove injected styles.

**Example:**
```typescript
runtime.destroy();
```

---

### Static: detectSystemTheme()

```typescript
static detectSystemTheme(): string
```

Detect current system color scheme preference.

**Returns:** `string` - 'dark' or 'light'

**Example:**
```typescript
const systemTheme = ThemeRuntime.detectSystemTheme();
console.log(systemTheme); // 'dark' or 'light'
```

---

## TokenExporter

Export tokens to various formats.

### export()

```typescript
static export(
  tokens: DesignTokens, 
  options: TokenExportOptions
): string
```

Export tokens to specified format.

**Parameters:**
- `tokens: DesignTokens` - Token object to export
- `options: TokenExportOptions` - Export configuration

**Returns:** `string` - Formatted output

**Example:**
```typescript
import { TokenExporter } from '@tokiforge/core';

const css = TokenExporter.export(tokens, {
  format: 'css',
  selector: ':root',
  prefix: 'app',
});
```

---

### exportCSS()

```typescript
static exportCSS(
  tokens: DesignTokens,
  options?: { selector?: string; prefix?: string }
): string
```

Export as CSS variables.

**Example:**
```typescript
const css = TokenExporter.exportCSS(tokens, {
  selector: ':root',
  prefix: 'app',
});

console.log(css);
// :root {
//   --app-color-primary: #3b82f6;
//   --app-color-background: #ffffff;
// }
```

---

### exportSCSS()

```typescript
static exportSCSS(
  tokens: DesignTokens,
  options?: { prefix?: string }
): string
```

Export as SCSS variables.

**Example:**
```typescript
const scss = TokenExporter.exportSCSS(tokens, { prefix: 'app' });

console.log(scss);
// $app-color-primary: #3b82f6;
// $app-color-background: #ffffff;
```

---

### exportJS()

```typescript
static exportJS(
  tokens: DesignTokens,
  options?: { variables?: boolean; prefix?: string }
): string
```

Export as JavaScript module.

**Example:**
```typescript
// Export as CSS variable references
const jsVars = TokenExporter.exportJS(tokens, { 
  variables: true,
  prefix: 'app'
});

// Export as plain object
const jsObj = TokenExporter.exportJS(tokens, { variables: false });
```

---

### exportTS()

```typescript
static exportTS(tokens: DesignTokens): string
```

Export as TypeScript module with const assertion.

**Example:**
```typescript
const ts = TokenExporter.exportTS(tokens);
// export default { ... } as const;
```

---

### exportJSON()

```typescript
static exportJSON(tokens: DesignTokens): string
```

Export as formatted JSON.

**Example:**
```typescript
const json = TokenExporter.exportJSON(tokens);
```

---

## TokenParser

Parse and validate token files. Now supports advanced features including functions, expressions, and fallback references.

### Advanced Features

The parser supports:
- **Token Functions**: `darken({color.primary}, 20)`
- **Expressions**: `{spacing.base} * 2`
- **Fallback References**: `{color.primary || #000000}`

See [Token Functions](/api/advanced/token-functions), [Token Expressions](/api/advanced/token-expressions), and [Token References](/api/advanced/token-references) for details.

### parse()

```typescript
static parse(
  filePath: string,
  options?: TokenParserOptions
): DesignTokens
```

Parse token file (JSON or YAML).

**Parameters:**
- `filePath: string` - Path to token file
- `options?: TokenParserOptions` - Parser options

**Throws:**
- `ParseError` - If file can't be parsed
- `ValidationError` - If validation fails

**Example:**
```typescript
import { TokenParser } from '@tokiforge/core';

const tokens = TokenParser.parse('./tokens.json', {
  validate: true,
  expandReferences: true,
});
```

---

### validate()

```typescript
static validate(tokens: DesignTokens): void
```

Validate token structure.

**Throws:**
- `ValidationError` - If validation fails

**Example:**
```typescript
try {
  TokenParser.validate(tokens);
  console.log('Tokens are valid!');
} catch (error) {
  console.error('Validation failed:', error.message);
}
```

---

### expandReferences()

```typescript
static expandReferences(tokens: DesignTokens): DesignTokens
```

Expand token references (e.g., `{color.primary}`).

**Example:**
```typescript
const tokens = {
  color: {
    blue: { value: '#3b82f6' },
    primary: { value: '{color.blue}' },
  },
};

const expanded = TokenParser.expandReferences(tokens);
console.log(expanded.color.primary.value); // '#3b82f6'
```

---

## Type Definitions

### ThemeConfig

```typescript
interface ThemeConfig {
  themes: Theme[];
  defaultTheme?: string;
}
```

### Theme

```typescript
interface Theme {
  name: string;
  tokens: ThemeTokensProvider;
}

type ThemeTokensProvider = 
  | DesignTokens 
  | (() => Promise<DesignTokens>);
```

### DesignTokens

```typescript
interface DesignTokens {
  [key: string]: TokenValue | DesignTokens;
}
```

### TokenValue

```typescript
interface TokenValue {
  value: string | number | TokenState | TokenResponsive;
  type?: 'color' | 'dimension' | 'fontFamily' | 'fontWeight' | 'duration' | 'custom';
  description?: string;
  deprecated?: boolean;
}
```

### TokenExportOptions

```typescript
interface TokenExportOptions {
  format: 'css' | 'js' | 'ts' | 'scss' | 'json';
  selector?: string;
  prefix?: string;
  variables?: boolean;
}
```

---

## Error Classes

### ThemeError

Base error for theme-related issues.

```typescript
class ThemeError extends Error {
  constructor(message: string, path?: string);
}
```

### ThemeNotFoundError

Thrown when theme doesn't exist.

```typescript
class ThemeNotFoundError extends ThemeError {
  constructor(themeName: string, availableThemes?: string[]);
}
```

### ParseError

Thrown when token file parsing fails.

```typescript
class ParseError extends Error {
  constructor(message: string, path?: string);
}
```

### ValidationError

Thrown when token validation fails.

```typescript
class ValidationError extends Error {
  constructor(message: string, path?: string);
}
```

---

## See Also

- [Vue API](/api/vue)
- [React API](/api/react)
- [Angular API](/api/angular)
- [Advanced APIs](/api/advanced/)
