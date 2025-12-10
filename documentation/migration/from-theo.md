---
title: Migration from Theo | TokiForge
description: Step-by-step guide to migrate from Salesforce Theo to TokiForge. Convert token formats, migrate transforms, and update build processes.
---

# Migration from Theo

Step-by-step guide to migrate from Salesforce Theo to TokiForge.

## Overview

Theo and TokiForge share similar token philosophies. This guide will help you migrate smoothly with minimal code changes.

---

## Key Differences

| Feature | Theo | TokiForge |
|---------|------|-----------|
| **Format** | JSON with aliases | TypeScript/JSON with references |
| **Build** | CLI-based transforms | Runtime + Build-time |
| **Platforms** | Multiple output formats | Export to 5 formats |
| **Themes** | Separate files | Single config |
| **Framework Integration** | Manual | Built-in adapters |

---

## Migration Steps

### Step 1: Analyze Theo Setup

Typical Theo structure:

```
tokens/
├── aliases.yml
├── globals.yml
├── components/
│   └── button.yml
└── .theo.yml
```

---

### Step 2: Convert Token Format

#### Theo Format

```yaml
# aliases.yml
aliases:
  BLUE: "#3b82f6"
  GRAY: "#6b7280"

# globals.yml
props:
  COLOR_PRIMARY:
    value: "{!BLUE}"
  COLOR_TEXT:
    value: "{!GRAY}"
```

#### TokiForge Format

```typescript
const tokens = {
  // Aliases (Core tokens)
  _core: {
    blue: { value: '#3b82f6' },
    gray: { value: '#6b7280' },
  },
  // Semantic tokens
  color: {
    primary: { value: '{_core.blue}' },
    text: { value: '{_core.gray}' },
  },
};
```

---

### Step 3: Handle Theo Aliases

Theo uses `{!alias}` syntax, TokiForge uses `{path.to.token}`:

```typescript
// Theo
{
  "value": "{!BLUE}"
}

// TokiForge
{
  "value": "{color.core.blue}"
}
```

**Migration script:**

```typescript
function convertTheoToTokiForge(theoTokens: any): DesignTokens {
  const result: any = {};
  
  // Convert aliases
  if (theoTokens.aliases) {
    result._core = {};
    for (const [key, value] of Object.entries(theoTokens.aliases)) {
      const tokenName = key.toLowerCase().replace(/_/g, '-');
      result._core[tokenName] = { value };
    }
  }
  
  // Convert props
  if (theoTokens.props) {
    for (const [key, token] of Object.entries(theoTokens.props)) {
      const path = key.toLowerCase().split('_');
      let current = result;
      
      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) current[path[i]] = {};
        current = current[path[i]];
      }
      
      const tokenValue = (token as any).value;
      const convertedValue = tokenValue.replace(/\{!(\w+)\}/g, (_, alias) => {
        return `{_core.${alias.toLowerCase().replace(/_/g, '-')}}`;
      });
      
      current[path[path.length - 1]] = {
        value: convertedValue,
        type: (token as any).type,
      };
    }
  }
  
  return result;
}
```

---

### Step 4: Migrate Build Configuration

#### Before (Theo)

```yaml
# .theo.yml
transforms:
  web:
    - color/rgb
platform:
  web:
    transformGroup: web
    buildPath: build/
    files:
      - destination: tokens.scss
        format: scss
```

#### After (TokiForge)

```typescript
// scripts/build-tokens.ts
import { TokenExporter } from '@tokiforge/core';
import { writeFileSync } from 'fs';
import tokens from '../tokens';

// SCSS output
const scss = TokenExporter.exportSCSS(tokens, { prefix: 'app' });
writeFileSync('build/tokens.scss', scss);

// CSS output
const css = TokenExporter.exportCSS(tokens, {
  selector: ':root',
  prefix: 'app',
});
writeFileSync('build/tokens.css', css);

// JSON output
const json = TokenExporter.exportJSON(tokens);
writeFileSync('build/tokens.json', json);
```

---

### Step 5: Update Component Usage

#### Before (Theo - SCSS)

```scss
@import '../build/tokens.scss';

.button {
  background: $color-primary;
  padding: $spacing-md;
}
```

#### After (TokiForge - CSS Variables)

```vue
<template>
  <button class="button">
    <slot />
  </button>
</template>

<style scoped>
.button {
  background: var(--app-color-primary);
  padding: var(--app-spacing-md);
}
</style>
```

---

## Transform Mapping

| Theo Transform | TokiForge Equivalent |
|----------------|----------------------|
| `color/rgb` | Use hex format directly |
| `color/hex` | Native support |
| `size/rem` | Use `rem` in value |
| `size/px` | Use `px` in value |

---

## Alias Migration

### Theo Aliases

```yaml
aliases:
  COLOR_BRAND_PRIMARY: "#3b82f6"
  COLOR_BRAND_SECONDARY: "#8b5cf6"
```

### TokiForge Core Tokens

```typescript
const tokens = {
  color: {
    brand: {
      primary: { value: '#3b82f6' },
      secondary: { value: '#8b5cf6' },
    },
  },
};
```

---

## Complete Example

### Before (Theo)

```
project/
├── tokens/
│   ├── aliases.yml
│   └── globals.yml
├── .theo.yml
└── src/
    └── styles/
        └── main.scss
```

```yaml
# aliases.yml
aliases:
  BLUE_500: "#3b82f6"
  SPACING_BASE: "8px"

# globals.yml
props:
  COLOR_PRIMARY:
    value: "{!BLUE_500}"
    type: "color"
  SPACING_MD:
    value: "{!SPACING_BASE}"
    type: "size"
```

```scss
// main.scss
@import '../../build/tokens.scss';

.button {
  background: $color-primary;
  padding: $spacing-md;
}
```

### After (TokiForge)

```
project/
├── tokens/
│   └── index.ts
└── src/
    ├── App.vue
    └── components/
        └── Button.vue
```

```typescript
// tokens/index.ts
export const tokens = {
  color: {
    primary: { value: '#3b82f6', type: 'color' },
  },
  spacing: {
    md: { value: '8px', type: 'dimension' },
  },
};
```

```vue
<!-- Button.vue -->
<script setup>
import { provideTheme } from '@tokiforge/vue';
import { tokens } from '../tokens';

provideTheme({
  themes: [{ name: 'default', tokens }],
});
</script>

<template>
  <button class="button">
    <slot />
  </button>
</template>

<style scoped>
.button {
  background: var(--hf-color-primary);
  padding: var(--hf-spacing-md);
}
</style>
```

---

## Benefits After Migration

✅ **Runtime theme switching** - No rebuild needed  
✅ **Simpler configuration** - No YAML, no CLI  
✅ **TypeScript support** - Full type safety  
✅ **Framework integration** - Vue/React/Angular adapters  
✅ **Smaller builds** - Only include what you use  

---

## Migration Checklist

- [ ] Convert Theo aliases to core tokens
- [ ] Map props to semantic tokens
- [ ] Update reference syntax (`{!alias}` → `{path}`)
- [ ] Replace build scripts
- [ ] Convert SCSS to CSS variables
- [ ] Add framework adapter
- [ ] Test theme switching
- [ ] Update documentation

---

## Common Issues

### Issue 1: Alias Not Found

**Theo:** `{!UNKNOWN_ALIAS}`  
**Error:** Reference not found

**Solution:** Ensure all aliases are converted to core tokens

---

### Issue 2: Transform Syntax

**Problem:** Theo transforms don't automatically apply

**Solution:** Apply transforms in build script or use TokiForge transforms

---

### Issue 3: Build Output Different

**Problem:** Generated CSS looks different

**Solution:** Customize prefix in TokenExporter

```typescript
TokenExporter.exportCSS(tokens, {
  prefix: 'theo', // Match Theo prefix
});
```

---

## Need Help?

- [TokiForge Documentation](/guide/getting-started)
- [API Reference](/api/core)
- [Community Support](https://github.com/yourusername/tokiforge/discussions)

---

**Next:** [Migration from Figma Tokens](/migration/from-figma-tokens)
