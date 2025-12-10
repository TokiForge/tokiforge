---
title: Migration from CSS Variables | TokiForge
description: Step-by-step guide to migrate from CSS custom properties to TokiForge design tokens. Convert CSS variables to tokens and enable runtime theme switching.
---

# Migration from CSS Variables

Migrate from CSS custom properties to TokiForge design tokens.

## Overview

Figma Tokens is a popular plugin for managing design tokens in Figma. This guide helps you export from Figma and integrate with TokiForge.

---

## Export from Figma

### Step 1: Export JSON

1. Open Figma Tokens plugin
2. Click **Export**
3. Select **JSON** format
4. Save as `figma-tokens.json`

---

### Step 2: Token Format

Figma Tokens uses a similar structure:

```json
{
  "global": {
    "colors": {
      "primary": {
        "value": "#3b82f6",
        "type": "color"
      },
      "secondary": {
        "value": "{colors.primary}",
        "type": "color"
      }
    },
    "spacing": {
      "md": {
        "value": "16",
        "type": "spacing"
      }
    }
  }
}
```

---

## Conversion Process

### Flatten Structure

Figma Tokens often nests tokens in theme sets. Flatten for TokiForge:

```typescript
function convertFigmaTokens(figmaTokens: any): DesignTokens {
  const result: any = {};
  
  // Extract from theme sets
  for (const [setName, tokens] of Object.entries(figmaTokens)) {
    if (setName === 'global' || setName === '$themes') continue;
    
    // Merge all tokens
    Object.assign(result, flattenTokens(tokens));
  }
  
  return result;
}

function flattenTokens(obj: any, parentKey = ''): any {
  const result: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const newKey = parentKey ? `${parentKey}.${key}` : key;
    
    if (value && typeof value === 'object' && 'value' in value) {
      // It's a token
      const path = newKey.split('.');
      let current = result;
      
      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) current[path[i]] = {};
        current = current[path[i]];
      }
      
      current[path[path.length - 1]] = {
        value: value.value,
        type: value.type,
        description: value.description,
      };
    } else if (value && typeof value === 'object') {
      // Recurse
      const nested = flattenTokens(value, newKey);
      Object.assign(result, nested);
    }
  }
  
  return result;
}
```

---

## Handle Theme Sets

Figma Tokens supports multiple theme sets. Convert to TokiForge themes:

### Figma Format

```json
{
  "$themes": [
    {
      "id": "light",
      "name": "Light",
      "selectedTokenSets": {
        "global": "enabled",
        "light": "enabled"
      }
    },
    {
      "id": "dark",
      "name": "Dark",
      "selectedTokenSets": {
        "global": "enabled",
        "dark": "enabled"
      }
    }
  ],
  "global": {
    "spacing": {
      "md": { "value": "16", "type": "spacing" }
    }
  },
  "light": {
    "colors": {
      "background": { "value": "#ffffff", "type": "color" }
    }
  },
  "dark": {
    "colors": {
      "background": { "value": "#1f2937", "type": "color" }
    }
  }
}
```

### TokiForge Format

```typescript
import { TokenMerger } from '@tokiforge/core';

const globalTokens = {
  spacing: {
    md: { value: '16px', type: 'dimension' },
  },
};

const lightTokens = TokenMerger.merge(globalTokens, {
  color: {
    background: { value: '#ffffff', type: 'color' },
  },
});

const darkTokens = TokenMerger.merge(globalTokens, {
  color: {
    background: { value: '#1f2937', type: 'color' },
  },
});

const config = {
  themes: [
    { name: 'light', tokens: lightTokens },
    { name: 'dark', tokens: darkTokens },
  ],
};
```

---

## Type Mapping

| Figma Tokens | TokiForge |
|--------------|-----------|
| `color` | `color` |
| `spacing` | `dimension` |
| `sizing` | `dimension` |
| `borderRadius` | `dimension` |
| `fontFamilies` | `fontFamily` |
| `fontWeights` | `fontWeight` |
| `typography` | `custom` |

---

## Reference Syntax

Both use curly braces, but handling differs:

```typescript
// Figma Tokens
{
  "value": "{colors.primary}"
}

// TokiForge (same!)
{
  "value": "{color.primary}"
}
```

**Note:** References work the same way! Just ensure paths are correct.

---

## Math Operations

Figma Tokens supports math expressions:

```json
{
  "spacing": {
    "lg": {
      "value": "{spacing.md} * 2",
      "type": "spacing"
    }
  }
}
```

**TokiForge:** Calculate during export or use CSS `calc()`:

```typescript
const tokens = {
  spacing: {
    md: { value: '16px' },
    lg: { value: 'calc(16px * 2)' }, // or '32px'
  },
};
```

---

## Typography Composition

Figma handles composite typography tokens:

```json
{
  "typography": {
    "heading": {
      "value": {
        "fontFamily": "{fontFamilies.inter}",
        "fontSize": "{fontSize.xl}",
        "fontWeight": "{fontWeights.bold}"
      },
      "type": "typography"
    }
  }
}
```

**TokiForge:** Decompose into individual tokens:

```typescript
const tokens = {
  typography: {
    heading: {
      fontFamily: { value: '{fontFamily.inter}' },
      fontSize: { value: '{fontSize.xl}' },
      fontWeight: { value: '{fontWeight.bold}' },
    },
  },
};
```

---

## Figma Sync Workflow

### Option 1: Manual Export

1. Update tokens in Figma
2. Export JSON
3. Convert and import to TokiForge
4. Rebuild app

### Option 2: Automated Sync

```typescript
// scripts/sync-figma.ts
import { convertFigmaTokens } from './convert';
import { writeFileSync } from 'fs';

async function syncFromFigma() {
  // Fetch from Figma API or read exported file
  const figmaTokens = JSON.parse(
    readFileSync('./figma-tokens.json', 'utf-8')
  );
  
  const tokiTokens = convertFigmaTokens(figmaTokens);
  
  writeFileSync(
    './src/tokens.ts',
    `export const tokens = ${JSON.stringify(tokiTokens, null, 2)};`
  );
  
  console.log('✅ Tokens synced from Figma');
}

syncFromFigma();
```

---

## Complete Example

### Step 1: Export from Figma

Export `figma-tokens.json`:

```json
{
  "global": {
    "color": {
      "primary": { "value": "#3b82f6", "type": "color" },
      "secondary": { "value": "#8b5cf6", "type": "color" }
    },
    "spacing": {
      "sm": { "value": "8", "type": "spacing" },
      "md": { "value": "16", "type": "spacing" }
    }
  }
}
```

### Step 2: Convert

```typescript
// scripts/convert-figma.ts
import { writeFileSync, readFileSync } from 'fs';

const figmaTokens = JSON.parse(
  readFileSync('./figma-tokens.json', 'utf-8')
);

// Extract global tokens
const tokens = figmaTokens.global;

// Add units to spacing
if (tokens.spacing) {
  for (const key in tokens.spacing) {
    tokens.spacing[key].value += 'px';
    tokens.spacing[key].type = 'dimension';
  }
}

writeFileSync(
  './src/tokens.ts',
  `export const tokens = ${JSON.stringify(tokens, null, 2)} as const;`
);
```

### Step 3: Use in App

```vue
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
  padding: var(--hf-spacing-md);
}
</style>
```

---

## Migration Checklist

- [ ] Export tokens from Figma Tokens plugin
- [ ] Convert JSON format
- [ ] Handle theme sets
- [ ] Map token types
- [ ] Add units to spacing values
- [ ] Decompose composite tokens
- [ ] Test in TokiForge
- [ ] Set up sync workflow (optional)

---

## Tips

1. **Keep Figma as Source of Truth** - Update tokens in Figma, export, convert
2. **Automate Conversion** - Create script for repeatable process
3. **Version Control** - Track both Figma export and converted tokens
4. **Test Thoroughly** - Verify all tokens converted correctly

---

## Benefits

✅ **Design-Dev Sync** - Keep Figma and code in sync  
✅ **Single Source of Truth** - Figma remains the design source  
✅ **Type Safety** - TypeScript support after conversion  
✅ **Runtime Themes** - Switch themes without rebuilding  

---

**Next:** [Migration from CSS Variables](/migration/from-css-variables)
