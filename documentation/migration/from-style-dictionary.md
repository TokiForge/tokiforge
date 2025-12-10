# Migration from Style Dictionary

Step-by-step guide to migrate from Style Dictionary to TokiForge.

## Overview

Style Dictionary and TokiForge share similar concepts but differ in implementation. This guide will help you migrate smoothly.

---

## Key Differences

| Feature | Style Dictionary | TokiForge |
|---------|------------------|-----------|
| **Format** | JSON/JS (Design Tokens Format) | TypeScript/JSON |
| **Build** | CLI-based | Runtime + Build-time |
| **Transforms** | Build-time | Runtime & Build-time |
| **Themes** | Multiple files/builds | Single config, runtime switching |
| **Framework Integration** | Manual | Built-in (Vue, React, Angular, Svelte) |

---

## Migration Steps

### Step 1: Analyze Current Setup

Identify your Style Dictionary structure:

```bash
# Typical Style Dictionary structure
tokens/
├── properties/
│   ├── color/
│   │   └── base.json
│   └── size/
│       └── font.json
├── config.json
└── build/
```

---

### Step 2: Convert Token Format

#### Style Dictionary Format

```json
{
  "color": {
    "base": {
      "gray": {
        "light": { "value": "#CCCCCC" },
        "medium": { "value": "#999999" },
        "dark": { "value": "#111111" }
      }
    },
    "brand": {
      "primary": { "value": "{color.base.gray.dark}" }
    }
  }
}
```

#### TokiForge Format

```typescript
const tokens = {
  color: {
    base: {
      gray: {
        light: { value: '#CCCCCC' },
        medium: { value: '#999999' },
        dark: { value: '#111111' },
      },
    },
    brand: {
      primary: { value: '{color.base.gray.dark}' },
    },
  },
};
```

**Note:** Format is nearly identical! Main difference is TypeScript vs JSON.

---

### Step 3: Use TokenImporter

TokiForge can automatically import Style Dictionary tokens:

```typescript
import { TokenImporter } from '@tokiforge/core';
import styleDictionaryTokens from './tokens.json';

// Convert Style Dictionary format to TokiForge
const tokens = TokenImporter.fromStyleDictionary(styleDictionaryTokens);

// Use in theme config
const config = {
  themes: [
    {
      name: 'default',
      tokens: tokens,
    },
  ],
};
```

---

### Step 4: Handle Transforms

#### Style Dictionary Transforms

```javascript
// config.json
{
  "transform": {
    "color/css": {
      "type": "value",
      "matcher": (token) => token.type === 'color',
      "transformer": (token) => token.value.toUpperCase()
    }
  }
}
```

#### TokiForge Equivalent

```typescript
import { TokenTransforms } from '@tokiforge/core';

// Custom transform
TokenTransforms.register('uppercase', (value: string) => {
  return value.toUpperCase();
});

// Use in tokens
const tokens = {
  color: {
    primary: {
      value: '{color.base.blue | uppercase}',
    },
  },
};
```

---

### Step 5: Migrate Build Scripts

#### Before (Style Dictionary)

```json
// package.json
{
  "scripts": {
    "build:tokens": "style-dictionary build"
  }
}
```

```javascript
// config.json
{
  "source": ["tokens/**/*.json"],
  "platforms": {
    "scss": {
      "transformGroup": "scss",
      "buildPath": "build/scss/",
      "files": [{
        "destination": "_variables.scss",
        "format": "scss/variables"
      }]
    }
  }
}
```

#### After (TokiForge)

```json
// package.json
{
  "scripts": {
    "build:tokens": "node scripts/build-tokens.js"
  }
}
```

```typescript
// scripts/build-tokens.ts
import { TokenExporter } from '@tokiforge/core';
import { writeFileSync } from 'fs';
import tokens from '../tokens';

// Export to SCSS
const scss = TokenExporter.export(tokens, {
  format: 'scss',
  prefix: 'tf',
});

writeFileSync('build/scss/_variables.scss', scss);

// Export to CSS
const css = TokenExporter.export(tokens, {
  format: 'css',
  selector: ':root',
  prefix: 'tf',
});

writeFileSync('build/css/variables.css', css);
```

---

### Step 6: Update Component Usage

#### Before (Style Dictionary - SCSS)

```scss
// components/button.scss
@import '../build/scss/variables';

.button {
  background: $color-brand-primary;
  padding: $size-padding-medium;
}
```

#### After (TokiForge - CSS Variables)

```vue
<!-- components/Button.vue -->
<template>
  <button class="button">
    <slot />
  </button>
</template>

<style scoped>
.button {
  background: var(--tf-color-brand-primary);
  padding: var(--tf-size-padding-medium);
}
</style>
```

**Benefits:**
- ✅ Runtime theme switching
- ✅ No rebuild required for theme changes
- ✅ Smaller bundle size

---

### Step 7: Enable Theme Switching

This is where TokiForge shines - add theme switching with minimal code:

```vue
<script setup>
import { provideTheme } from '@tokiforge/vue';

const config = {
  themes: [
    { name: 'light', tokens: lightTokens },
    { name: 'dark', tokens: darkTokens },
  ],
};

const { theme, setTheme, availableThemes } = provideTheme(config);
</script>

<template>
  <select :value="theme" @change="setTheme($event.target.value)">
    <option v-for="t in availableThemes" :key="t" :value="t">
      {{ t }}
    </option>
  </select>
</template>
```

---

## Transform Mapping

Common Style Dictionary transforms and their TokiForge equivalents:

| Style Dictionary | TokiForge |
|------------------|-----------|
| `color/hex` | Native (use hex values) |
| `size/rem` | Use `rem` units in values |
| `name/cti/kebab` | Automatic in CSS export |
| `time/seconds` | Use seconds in values |
| `color/css` | `TokenExporter.exportCSS()` |

---

## Platform Mapping

| Style Dictionary Platform | TokiForge Export |
|---------------------------|------------------|
| `scss/variables` | `format: 'scss'` |
| `css/variables` | `format: 'css'` |
| `javascript/es6` | `format: 'js'` |
| `typescript/es6-declarations` | `format: 'ts'` |
| `json/flat` | `format: 'json'` |

---

## Example: Complete Migration

### Before (Style Dictionary)

```
project/
├── tokens/
│   ├── color.json
│   └── size.json
├── config.json
├── build/
│   └── scss/
│       └── _variables.scss
└── src/
    └── styles/
        └── main.scss
```

```json
// tokens/color.json
{
  "color": {
    "primary": { "value": "#3b82f6" },
    "secondary": { "value": "#8b5cf6" }
  }
}
```

```scss
// src/styles/main.scss
@import '../../build/scss/variables';

body {
  background: $color-primary;
}
```

### After (TokiForge)

```
project/
├── tokens/
│   └── index.ts
├── src/
│   ├── main.ts
│   └── App.vue
└── build/
    └── theme-config.ts
```

```typescript
// tokens/index.ts
export const tokens = {
  color: {
    primary: { value: '#3b82f6' },
    secondary: { value: '#8b5cf6' },
  },
};
```

```vue
<!-- App.vue -->
<script setup>
import { provideTheme } from '@tokiforge/vue';
import { tokens } from './tokens';

provideTheme({
  themes: [{ name: 'default', tokens }],
});
</script>

<template>
  <div class="app">
    <!-- Your app -->
  </div>
</template>

<style>
.app {
  background: var(--hf-color-primary);
}
</style>
```

---

## Migration Checklist

- [ ] Analyze current Style Dictionary setup
- [ ] Convert token files to TypeScript/JSON
- [ ] Use `TokenImporter.fromStyleDictionary()` for automatic conversion
- [ ] Migrate transforms to TokiForge format
- [ ] Update build scripts
- [ ] Replace SCSS variables with CSS variables
- [ ] Add theme switching (optional)
- [ ] Test all components
- [ ] Update documentation

---

## Backward Compatibility

If you need to maintain both systems during migration:

```typescript
// scripts/build-both.ts
import { TokenExporter } from '@tokiforge/core';
import StyleDictionary from 'style-dictionary';

// Build with Style Dictionary
StyleDictionary.buildAllPlatforms();

// Also export with TokiForge
const css = TokenExporter.exportCSS(tokens);
writeFileSync('build/tokiforge.css', css);
```

---

## Common Issues

### Issue 1: References Not Resolving

**Style Dictionary:** `{color.primary.value}`  
**TokiForge:** `{color.primary}`

**Solution:** Remove `.value` from references

### Issue 2: Transform Not Working

**Problem:** Transforms from Style Dictionary don't automatically apply

**Solution:** Re-implement using `TokenTransforms` or handle in export

### Issue 3: Build Output Different

**Problem:** Generated CSS variable names differ

**Solution:** Customize prefix in `TokenExporter`:

```typescript
TokenExporter.exportCSS(tokens, {
  prefix: 'sd', // Match Style Dictionary prefix
});
```

---

## Benefits After Migration

✅ **Runtime theme switching** - No rebuild needed  
✅ **Smaller builds** - Only include what you use  
✅ **Better DX** - TypeScript support  
✅ **Framework integration** - Vue/React/Angular adapters  
✅ **Faster builds** - No preprocessing step  
✅ **Live preview** - See changes instantly  

---

## Need Help?

- [TokiForge Documentation](/guide/getting-started)
- [API Reference](/api/core)
- [Examples](/examples/react)
- GitHub Discussions

---

**Next:** [Migration from Theo](/migration/from-theo) | [Migration from Figma Tokens](/migration/from-figma-tokens)
