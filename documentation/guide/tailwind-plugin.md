# Enhanced Tailwind Plugin

The TokiForge Tailwind plugin provides seamless integration between design tokens and Tailwind CSS, with support for Tailwind v4, automatic token mapping, and watch mode capabilities.

## Features

- **Official Plugin Format**: Built as a proper Tailwind CSS plugin
- **Token-to-Utility Mapping**: Automatic conversion of tokens to Tailwind utilities
- **Tailwind v4 Support**: Full support for Tailwind CSS v4 syntax and features
- **Watch Mode**: Auto-detect token file changes and regenerate configuration
- **Preset Generator**: Create Tailwind config presets from token files
- **Multi-Category Support**: Colors, spacing, sizing, typography, border radius

## Installation

```bash
npm install @tokiforge/tailwind tailwindcss
```

## Usage

### Basic Setup

```javascript
// tailwind.config.js
import { createTailwindPlugin } from "@tokiforge/tailwind";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  plugins: [
    createTailwindPlugin({
      tokensPath: "./tokens.json",
      prefix: "hf", // CSS variable prefix
    }),
  ],
};
```

### With Watch Mode

```javascript
createTailwindPlugin({
  tokensPath: "./tokens.json",
  watch: true, // Auto-regenerate on token changes
});
```

### Using Presets

```javascript
// tailwind.config.js
import { generateTailwindPreset } from "@tokiforge/tailwind";

export default {
  presets: [
    generateTailwindPreset("./tokens.json", {
      themeMappings: {
        colors: ["colors"],
        spacing: ["spacing"],
      },
    }),
  ],
};
```

### Tailwind v4 Support

```javascript
import { generateTailwindPreset } from "@tokiforge/tailwind";

const config = generateTailwindPreset("./tokens.json", {
  v4: true, // Enable Tailwind v4 features
});

export default config;
```

## Token Mapping

The plugin automatically maps tokens to Tailwind utilities:

### Colors

Tokens with `color` type are mapped to Tailwind color utilities:

```json
{
  "colors": {
    "primary": { "value": "#007AFF", "type": "color" },
    "secondary": { "value": "#5AC8FA", "type": "color" }
  }
}
```

Results in:

```html
<div class="text-primary bg-secondary">...</div>
```

### Spacing

Numeric spacing tokens are converted to Tailwind spacing utilities:

```json
{
  "spacing": {
    "xs": { "value": 4, "type": "spacing" },
    "sm": { "value": 8, "type": "spacing" },
    "md": { "value": 16, "type": "spacing" }
  }
}
```

Results in:

```html
<div class="p-md gap-sm">...</div>
```

### Typography

Font sizes, weights, and families are automatically mapped:

```json
{
  "typography": {
    "heading-lg": { "value": 24, "type": "fontSize" },
    "body-sm": { "value": 14, "type": "fontSize" },
    "font-sans": { "value": "system-ui, -apple-system", "type": "fontFamily" }
  }
}
```

### Border Radius

Radius tokens map to Tailwind border-radius utilities:

```json
{
  "borderRadius": {
    "sm": { "value": 4, "type": "borderRadius" },
    "md": { "value": 8, "type": "borderRadius" },
    "lg": { "value": 12, "type": "borderRadius" }
  }
}
```

## API Reference

### `createTailwindPlugin(options)`

Creates a Tailwind CSS plugin for token integration.

**Parameters:**

- `tokensPath` (string): Path to your tokens JSON file (omit if using `tokens`)
- `tokens` (object, optional): Inline design tokens (alternative to `tokensPath`; useful for Vite/HMR)
- `prefix` (string, optional): CSS variable prefix (default: `'hf'`)
- `watch` (boolean, optional): Enable file watching (default: false)
- `themeMappings` (object, optional): Custom token path mappings (see [Theme Mappings](#theme-mappings))
- `v4` (boolean, optional): Enable Tailwind v4 features (default: false)
- **v2.0.2:** `baseSelector` (string, optional): Selector for CSS variables (default: `':root'`)
- **v2.0.2:** `strict` (boolean, optional): Fail build on missing/invalid tokens; false = warn and skip (default: false)
- **v2.0.2:** `includeUtilities` (boolean, optional): Generate spacing/color utilities; false = only CSS variables (default: true)
- **v2.0.2:** `excludePaths` (string[], optional): Token path prefixes to exclude (e.g. `['internal.', 'legacy.']`)
- **v2.0.2:** `customUtilityPrefix` (string, optional): Prefix for generated utility classes
- **v2.0.2:** `debug` (boolean, optional): Log resolved paths and mapped key count (default: false)

**Returns:** Tailwind plugin function

### `generateTailwindPreset(tokensPath, options)`

Generates a Tailwind config preset from tokens.

**Parameters:**

- `tokensPath` (string, required): Path to your tokens JSON file
- `options` (object, optional): Same options as `createTailwindPlugin`

**Returns:** Partial Tailwind config object

### `generateTailwindThemeVariables(tokens, prefix)`

Generates CSS theme variables for Tailwind v4 @theme syntax.

**Parameters:**

- `tokens` (DesignTokens, required): Design tokens object
- `prefix` (string, optional): CSS variable prefix (default: 'hf')

**Returns:** Record of CSS variable names to values

### `mapTokensToUtilities(tokens, themeMappings)`

Maps design tokens to Tailwind utility values.

**Parameters:**

- `tokens` (DesignTokens, required): Design tokens object
- `themeMappings` (object, optional): Custom token path mappings

**Returns:** Object with utility categories (colors, spacing, etc.)

## Theme Mappings

Customize which token categories map to which utilities. In v2.0.2, `boxShadow`, `lineHeight`, and `animation` are supported in addition to colors, spacing, typography, and radius:

```javascript
createTailwindPlugin({
  tokensPath: "./tokens.json",
  themeMappings: {
    colors: ["colors", "palette"],
    spacing: ["spacing", "gaps"],
    borderRadius: ["radius", "borderRadius"],
    fontSize: ["typography", "fontSize"],
    fontFamily: ["fonts", "fontFamily"],
    boxShadow: ["shadows", "elevation"],
    lineHeight: ["typography", "lineHeight"],
    animation: ["motion", "animation"],
  },
});
```

## Tailwind v4 Integration

### Using @theme Variables

In Tailwind v4, you can use design tokens as theme variables:

```css
@import "tailwindcss";

@theme {
  --color-primary: #007aff;
  --color-secondary: #5ac8fa;
  --spacing-md: 1rem;
}
```

Generate these variables with:

```javascript
import { generateTailwindThemeVariables } from "@tokiforge/tailwind";

const variables = generateTailwindThemeVariables(tokens);
// Output: { '--color-primary': '#007AFF', '--spacing-md': '1rem' }
```

## Watch Mode

Enable watch mode to automatically regenerate configuration when tokens change:

```javascript
createTailwindPlugin({
  tokensPath: "./tokens.json",
  watch: true,
});
```

The plugin will:

1. Monitor the tokens file for changes
2. Parse updated tokens
3. Regenerate utility mappings
4. Apply changes (requires Tailwind rebuild)

## Best Practices

### 1. Token Organization

Keep tokens well-organized by category:

```json
{
  "colors": { ... },
  "typography": { ... },
  "spacing": { ... },
  "sizing": { ... },
  "borderRadius": { ... }
}
```

### 2. Naming Conventions

Use consistent naming for automatic mapping:

```json
{
  "colors": {
    "primary-light": { "value": "#E3F2FD" },
    "primary-main": { "value": "#2196F3" }
  }
}
```

### 3. Type Specification

Always specify token types for proper mapping:

```json
{
  "value": "#007AFF",
  "type": "color"
}
```

### 4. Performance

For large token sets, consider using presets:

```javascript
// More efficient than plugins for static configs
export default {
  presets: [generateTailwindPreset("./tokens.json")],
};
```

## Examples

### Complete Configuration

```javascript
// tailwind.config.js
import {
  createTailwindPlugin,
  generateTailwindPreset,
} from "@tokiforge/tailwind";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  presets: [
    generateTailwindPreset("./design-tokens/tokens.json", {
      v4: true,
    }),
  ],
  plugins: [
    createTailwindPlugin({
      tokensPath: "./design-tokens/tokens.json",
      prefix: "ds", // 'ds' = design-system
      watch: process.env.NODE_ENV === "development",
      themeMappings: {
        colors: ["colors"],
        spacing: ["spacing"],
        borderRadius: ["borderRadius", "radius"],
        fontSize: ["typography", "fontSize"],
        fontFamily: ["typography", "fontFamily"],
      },
    }),
  ],
};
```

### With TypeScript

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";
import { createTailwindPlugin } from "@tokiforge/tailwind";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  plugins: [
    createTailwindPlugin({
      tokensPath: "./tokens.json",
      watch: true,
    }),
  ],
};

export default config;
```

## Troubleshooting

### Plugin not recognizing token changes

Ensure watch mode is enabled:

```javascript
createTailwindPlugin({
  tokensPath: "./tokens.json",
  watch: true,
});
```

### Utilities not generating

Verify tokens have correct type specifications:

```json
{
  "value": "#007AFF",
  "type": "color" // Must match category
}
```

### Import errors

Ensure tokens file exists and is valid JSON:

```bash
# Check file exists
ls -la ./tokens.json

# Validate JSON
cat ./tokens.json | node -e "console.log(JSON.parse(require('fs').readFileSync(0, 'utf-8')))"
```

## Migration from v1.3

If upgrading from an earlier version:

1. Use `createTailwindPlugin` instead of `tokiforgeTailwindPlugin`
2. Token mappings are now automatic - remove manual theme extensions
3. Watch mode is opt-in via the `watch` option

## Support

For issues and feature requests, visit the [TokiForge GitHub repository](https://github.com/tokiforge/tokiforge).
