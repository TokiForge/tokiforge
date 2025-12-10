---
title: TokenMerger API | TokiForge
description: Complete API reference for TokenMerger. Merge tokens, resolve inheritance, and combine multiple token sources into a unified token system.
---

# TokenMerger API

Merge and resolve token inheritance.

---

## merge()

```typescript
static merge(
  target: DesignTokens,
  source: DesignTokens
): DesignTokens
```

Deep merge two token objects.

**Parameters:**
- `target: DesignTokens` - Base tokens
- `source: DesignTokens` - Tokens to merge in

**Returns:** `DesignTokens` - Merged result

**Example:**
```typescript
import { TokenMerger } from '@tokiforge/core';

const baseTokens = {
  color: {
    primary: { value: '#3b82f6' },
    secondary: { value: '#8b5cf6' },
  },
};

const overrides = {
  color: {
    primary: { value: '#2563eb' }, // Override
    accent: { value: '#f59e0b' },  // Add new
  },
};

const merged = TokenMerger.merge(baseTokens, overrides);

console.log(merged);
// {
//   color: {
//     primary: { value: '#2563eb' },  // Overridden
//     secondary: { value: '#8b5cf6' }, // Preserved
//     accent: { value: '#f59e0b' }     // Added
//   }
// }
```

---

## resolveInheritance()

```typescript
static resolveInheritance(
  theme: DesignTokens,
  baseThemes: DesignTokens[]
): DesignTokens
```

Resolve theme inheritance from multiple base themes.

**Parameters:**
- `theme: DesignTokens` - Theme to extend
- `baseThemes: DesignTokens[]` - Base themes (applied in order)

**Returns:** `DesignTokens` - Resolved theme

**Example:**
```typescript
// Base theme
const baseTheme = {
  color: {
    primary: { value: '#3b82f6' },
    background: { value: '#ffffff' },
  },
};

// Brand override
const brandTheme = {
  color: {
    primary: { value: '#ef4444' },
  },
};

// Dark mode extension
const darkTheme = {
  color: {
    background: { value: '#1f2937' },
  },
};

const resolved = TokenMerger.resolveInheritance(
  darkTheme,
  [baseTheme, brandTheme]
);

console.log(resolved.color.primary.value);    // '#ef4444' (from brand)
console.log(resolved.color.background.value); // '#1f2937' (from dark)
```

---

## Use Cases

### Theme Inheritance

Create a theme hierarchy:

```typescript
// Core tokens
const coreTokens = {
  color: {
    blue: { value: '#3b82f6' },
    gray: { value: '#6b7280' },
  },
};

// Semantic layer
const semanticTokens = TokenMerger.merge(coreTokens, {
  color: {
    primary: { value: '{color.blue}' },
    text: { value: '{color.gray}' },
  },
});

// Component layer
const componentTokens = TokenMerger.merge(semanticTokens, {
  button: {
    background: { value: '{color.primary}' },
  },
});
```

---

### Multi-Brand System

```typescript
const baseTheme = {
  spacing: { md: { value: '1rem' } },
  // ... common tokens
};

const brandA = TokenMerger.merge(baseTheme, {
  color: { primary: { value: '#3b82f6' } },
});

const brandB = TokenMerger.merge(baseTheme, {
  color: { primary: { value: '#ef4444' } },
});
```

---

## See Also

- [TokenTransforms](/api/advanced/token-transforms)
- [Best Practices - Token Organization](/guides/best-practices#token-organization)
