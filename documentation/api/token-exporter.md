# TokenExporter API Reference

Complete API reference for the `TokenExporter` class from `@tokiforge/core`.

## Overview

`TokenExporter` is a static utility class for exporting design tokens to various formats: CSS, SCSS, JavaScript, TypeScript, and JSON.

## Import

```typescript
import { TokenExporter } from '@tokiforge/core';
```

## Methods

### `TokenExporter.export(tokens, options)`

Main export method that supports all formats.

**Signature:**

```typescript
static export(
  tokens: DesignTokens,
  options: TokenExportOptions
): string
```

**Parameters:**

- `tokens: DesignTokens` - Design tokens to export
- `options: TokenExportOptions` - Export options (must include `format`)

**Options:**

```typescript
interface TokenExportOptions {
  format: 'css' | 'js' | 'ts' | 'scss' | 'json'; // Required
  selector?: string;    // CSS selector (for CSS format, default: ':root')
  prefix?: string;     // CSS variable prefix (default: 'hf')
  variables?: boolean;  // Use CSS variables in JS/TS output (default: false)
}
```

**Returns:** `string` - Exported content as a string

**Example:**

```typescript
import { TokenExporter } from '@tokiforge/core';

const css = TokenExporter.export(tokens, {
  format: 'css',
  selector: ':root',
  prefix: 'hf',
});

const js = TokenExporter.export(tokens, {
  format: 'js',
  variables: false,
});
```

**Throws:**

- `Error` if format is unsupported

### `TokenExporter.exportCSS(tokens, options?)`

Export tokens as CSS custom properties.

**Signature:**

```typescript
static exportCSS(
  tokens: DesignTokens,
  options?: TokenExportOptions
): string
```

**Options:**

- `selector?: string` - CSS selector (default: `:root`)
- `prefix?: string` - CSS variable prefix (default: `hf`)

**Returns:** `string` - CSS code

**Example:**

```typescript
import { TokenExporter } from '@tokiforge/core';

const css = TokenExporter.exportCSS(tokens, {
  selector: ':root',
  prefix: 'hf',
});
```

**Output:**

```css
:root {
  --hf-color-primary: #7C3AED;
  --hf-color-accent: #06B6D4;
  --hf-spacing-md: 16px;
}
```

### `TokenExporter.exportSCSS(tokens, options?)`

Export tokens as SCSS variables.

**Signature:**

```typescript
static exportSCSS(
  tokens: DesignTokens,
  options?: TokenExportOptions
): string
```

**Options:**

- `prefix?: string` - Variable prefix (default: `hf`)

**Returns:** `string` - SCSS code

**Example:**

```typescript
import { TokenExporter } from '@tokiforge/core';

const scss = TokenExporter.exportSCSS(tokens, {
  prefix: 'hf',
});
```

**Output:**

```scss
$hf-color-primary: #7C3AED;
$hf-color-accent: #06B6D4;
$hf-spacing-md: 16px;
```

### `TokenExporter.exportJS(tokens, options?)`

Export tokens as JavaScript module.

**Signature:**

```typescript
static exportJS(
  tokens: DesignTokens,
  options?: TokenExportOptions
): string
```

**Options:**

- `variables?: boolean` - Use CSS variables instead of values (default: `false`)
- `prefix?: string` - CSS variable prefix (when `variables: true`, default: `hf`)

**Returns:** `string` - JavaScript code

**Example:**

```typescript
import { TokenExporter } from '@tokiforge/core';

// Export with values
const js = TokenExporter.exportJS(tokens, {
  variables: false,
});

// Export with CSS variables
const jsWithVars = TokenExporter.exportJS(tokens, {
  variables: true,
  prefix: 'hf',
});
```

**Output (values):**

```javascript
export default {
  color: {
    primary: "#7C3AED",
    accent: "#06B6D4"
  },
  spacing: {
    md: "16px"
  }
};
```

**Output (variables):**

```javascript
export default {
  color: {
    primary: "var(--hf-color-primary)",
    accent: "var(--hf-color-accent)"
  },
  spacing: {
    md: "var(--hf-spacing-md)"
  }
};
```

### `TokenExporter.exportTS(tokens, options?)`

Export tokens as TypeScript module with type definitions.

**Signature:**

```typescript
static exportTS(
  tokens: DesignTokens,
  options?: TokenExportOptions
): string
```

**Options:**

- `variables?: boolean` - Use CSS variables instead of values (default: `false`)
- `prefix?: string` - CSS variable prefix (when `variables: true`, default: `hf`)

**Returns:** `string` - TypeScript code with types

**Example:**

```typescript
import { TokenExporter } from '@tokiforge/core';

const ts = TokenExporter.exportTS(tokens);
```

**Output:**

```typescript
{
  color: {
    primary: string;
    accent: string;
  };
  spacing: {
    md: string;
  };
}

export default {
  color: {
    primary: "#7C3AED",
    accent: "#06B6D4"
  },
  spacing: {
    md: "16px"
  }
};
```

### `TokenExporter.exportJSON(tokens)`

Export tokens as formatted JSON.

**Signature:**

```typescript
static exportJSON(tokens: DesignTokens): string
```

**Parameters:**

- `tokens: DesignTokens` - Design tokens to export

**Returns:** `string` - JSON string (formatted with 2-space indentation)

**Example:**

```typescript
import { TokenExporter } from '@tokiforge/core';

const json = TokenExporter.exportJSON(tokens);
```

**Output:**

```json
{
  "color": {
    "primary": {
      "value": "#7C3AED",
      "type": "color"
    }
  }
}
```

## Usage Examples

### Export to CSS

```typescript
import { TokenExporter } from '@tokiforge/core';
import { writeFileSync } from 'fs';

const css = TokenExporter.exportCSS(tokens, {
  selector: ':root',
  prefix: 'myapp',
});

writeFileSync('./dist/tokens.css', css);
```

### Export to Multiple Formats

```typescript
import { TokenExporter } from '@tokiforge/core';
import { writeFileSync } from 'fs';

const formats = ['css', 'scss', 'js', 'ts', 'json'] as const;

for (const format of formats) {
  const content = TokenExporter.export(tokens, {
    format,
    selector: ':root',
    prefix: 'hf',
  });
  
  writeFileSync(`./dist/tokens.${format}`, content);
}
```

### Export with Custom Prefix

```typescript
import { TokenExporter } from '@tokiforge/core';

// Custom prefix for CSS variables
const css = TokenExporter.exportCSS(tokens, {
  prefix: 'myapp',
  selector: ':root',
});

// Generates: --myapp-color-primary instead of --hf-color-primary
```

### Export JavaScript with CSS Variables

```typescript
import { TokenExporter } from '@tokiforge/core';

// Export JS that uses CSS variables
const js = TokenExporter.exportJS(tokens, {
  variables: true,
  prefix: 'hf',
});

// Output uses var(--hf-color-primary) instead of "#7C3AED"
```

### Custom Selector for CSS

```typescript
import { TokenExporter } from '@tokiforge/core';

// Export for body class selector
const css = TokenExporter.exportCSS(tokens, {
  selector: 'body.theme-light',
  prefix: 'hf',
});

// Output:
// body.theme-light {
//   --hf-color-primary: #7C3AED;
// }
```

## Variable Naming

Tokens are converted to CSS/SCSS variables using the following rules:

1. **Path-based naming** - Token path becomes variable name
2. **Prefix addition** - Prefix is prepended to the path
3. **CamelCase conversion** - CamelCase is converted to kebab-case
4. **Lowercase** - All parts are lowercased

**Examples:**

- `color.primary` → `--hf-color-primary` (CSS) or `$hf-color-primary` (SCSS)
- `spacing.large` → `--hf-spacing-large`
- `radius.small` → `--hf-radius-small`

## Best Practices

1. **Use consistent prefixes** - Use the same prefix across your project
2. **Choose appropriate selectors** - Use `:root` for global, or specific selectors for scoped themes
3. **Export CSS variables in JS** - Use `variables: true` when you want JS to reference CSS variables
4. **Format output** - All exports are formatted for readability

## Related

- See [TokenParser API](/api/token-parser) for parsing tokens
- Check [Custom Exporters Guide](/guide/custom-exporters) for creating custom formats
- View [Core API](/api/core) for complete overview

