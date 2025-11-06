# CLI Usage Example

> **TokiForge v0.2.1**

Complete example of using TokiForge CLI to manage design tokens.

## Setup

### 1. Install CLI

```bash
# Global installation
npm install -g tokiforge-cli@^0.2.1

# Or use with npx (no installation needed)
npx tokiforge-cli@latest init
```

### 2. Initialize Project

```bash
# Navigate to your project
cd my-project

# Initialize TokiForge
tokiforge init
```

This creates:
- `tokens.json` - Your design tokens
- `tokiforge.config.json` - Configuration file

## Example Workflow

### Step 1: Define Tokens

Edit `tokens.json`:

```json
{
  "color": {
    "primary": { "value": "#7C3AED", "type": "color" },
    "accent": { "value": "#06B6D4", "type": "color" },
    "text": {
      "primary": { "value": "#1F2937", "type": "color" },
      "secondary": { "value": "#6B7280", "type": "color" }
    },
    "background": {
      "default": { "value": "#FFFFFF", "type": "color" },
      "muted": { "value": "#F9FAFB", "type": "color" }
    }
  },
  "radius": {
    "sm": { "value": "4px", "type": "dimension" },
    "md": { "value": "8px", "type": "dimension" },
    "lg": { "value": "12px", "type": "dimension" }
  },
  "spacing": {
    "xs": { "value": "4px", "type": "dimension" },
    "sm": { "value": "8px", "type": "dimension" },
    "md": { "value": "16px", "type": "dimension" },
    "lg": { "value": "24px", "type": "dimension" }
  }
}
```

### Step 2: Configure Output

Edit `tokiforge.config.json`:

```json
{
  "input": "./tokens.json",
  "output": {
    "css": "./dist/tokens.css",
    "js": "./dist/tokens.js",
    "ts": "./dist/tokens.ts",
    "scss": "./dist/tokens.scss",
    "json": "./dist/tokens.json"
  },
  "prefix": "hf",
  "selector": ":root"
}
```

### Step 3: Preview Themes

Start the development server:

```bash
tokiforge dev
```

This opens `http://localhost:3000` where you can:
- Preview all your tokens
- Switch between themes
- See live updates as you edit tokens

### Step 4: Validate Tokens

Check for errors:

```bash
tokiforge lint
```

Output:
```
✅ All tokens are valid!
✅ Color contrast ratios are acceptable
✅ No duplicate token names found
```

### Step 5: Build Exports

Generate all output formats:

```bash
tokiforge build
```

Output:
```
📦 Parsing tokens...
✅ Generated CSS: ./dist/tokens.css
✅ Generated JS: ./dist/tokens.js
✅ Generated TS: ./dist/tokens.ts
✅ Generated SCSS: ./dist/tokens.scss
✅ Generated JSON: ./dist/tokens.json

🎉 Build complete!
```

## Generated Files

### CSS Output (`dist/tokens.css`)

```css
:root {
  --hf-color-primary: #7C3AED;
  --hf-color-accent: #06B6D4;
  --hf-color-text-primary: #1F2937;
  --hf-color-text-secondary: #6B7280;
  --hf-color-background-default: #FFFFFF;
  --hf-color-background-muted: #F9FAFB;
  --hf-radius-sm: 4px;
  --hf-radius-md: 8px;
  --hf-radius-lg: 12px;
  --hf-spacing-xs: 4px;
  --hf-spacing-sm: 8px;
  --hf-spacing-md: 16px;
  --hf-spacing-lg: 24px;
}
```

### JavaScript Output (`dist/tokens.js`)

```javascript
export default {
  color: {
    primary: "#7C3AED",
    accent: "#06B6D4",
    text: {
      primary: "#1F2937",
      secondary: "#6B7280"
    },
    background: {
      default: "#FFFFFF",
      muted: "#F9FAFB"
    }
  },
  radius: {
    sm: "4px",
    md: "8px",
    lg: "12px"
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px"
  }
};
```

### TypeScript Output (`dist/tokens.ts`)

```typescript
{
  color: {
    primary: string;
    accent: string;
    text: {
      primary: string;
      secondary: string;
    };
    background: {
      default: string;
      muted: string;
    };
  };
  radius: {
    sm: string;
    md: string;
    lg: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
  };
}

export default {
  color: {
    primary: "#7C3AED",
    // ... rest of tokens
  }
};
```

### SCSS Output (`dist/tokens.scss`)

```scss
$hf-color-primary: #7C3AED;
$hf-color-accent: #06B6D4;
$hf-color-text-primary: #1F2937;
$hf-color-text-secondary: #6B7280;
$hf-color-background-default: #FFFFFF;
$hf-color-background-muted: #F9FAFB;
$hf-radius-sm: 4px;
$hf-radius-md: 8px;
$hf-radius-lg: 12px;
$hf-spacing-xs: 4px;
$hf-spacing-sm: 8px;
$hf-spacing-md: 16px;
$hf-spacing-lg: 24px;
```

## Using Generated Files

### In CSS

```css
.button {
  background-color: var(--hf-color-primary);
  border-radius: var(--hf-radius-lg);
  padding: var(--hf-spacing-md);
}
```

### In JavaScript/TypeScript

```typescript
import tokens from './dist/tokens';

const buttonStyle = {
  backgroundColor: tokens.color.primary,
  borderRadius: tokens.radius.lg,
  padding: tokens.spacing.md,
};
```

### In SCSS

```scss
@import './dist/tokens';

.button {
  background-color: $hf-color-primary;
  border-radius: $hf-radius-lg;
  padding: $hf-spacing-md;
}
```

## Advanced Configuration

### Multiple Themes

```json
{
  "input": "./tokens.json",
  "output": {
    "css": "./dist/tokens.css"
  },
  "themes": [
    {
      "name": "light",
      "tokens": { /* light theme tokens */ }
    },
    {
      "name": "dark",
      "tokens": { /* dark theme tokens */ }
    },
    {
      "name": "brand",
      "tokens": { /* brand theme tokens */ }
    }
  ],
  "defaultTheme": "light",
  "prefix": "hf",
  "selector": ":root"
}
```

### Custom Prefix

```json
{
  "prefix": "myapp",
  "selector": ":root"
}
```

Generates: `--myapp-color-primary` instead of `--hf-color-primary`

### Custom Selector

```json
{
  "selector": "body.theme-light"
}
```

Generates CSS scoped to `body.theme-light` selector.

## Integration with Build Tools

### npm Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "tokens:build": "tokiforge build",
    "tokens:dev": "tokiforge dev",
    "tokens:lint": "tokiforge lint"
  }
}
```

Usage:
```bash
npm run tokens:build
npm run tokens:dev
npm run tokens:lint
```

### Watch Mode

For continuous building during development, use the dev server:

```bash
tokiforge dev
```

The dev server watches for changes and auto-reloads.

## Next Steps

- See [CLI Overview](/cli/overview) for more details
- Check [CLI Commands](/cli/commands) for command reference
- Learn about [Configuration](/cli/configuration) options

