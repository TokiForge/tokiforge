---
title: TokenImporter API | TokiForge
description: Complete API reference for TokenImporter. Import design tokens from W3C Design Tokens format, Style Dictionary, and other token formats.
---

# TokenImporter API

Import tokens from other formats.

---

## fromStyleDictionary()

```typescript
static fromStyleDictionary(sdTokens: any): DesignTokens
```

Convert Style Dictionary tokens to TokiForge format.

**Parameters:**
- `sdTokens: any` - Style Dictionary token object

**Returns:** `DesignTokens` - Converted tokens

**Example:**
```typescript
import { TokenImporter } from '@tokiforge/core';
import styleDictionaryTokens from './tokens.json';

const tokens = TokenImporter.fromStyleDictionary(styleDictionaryTokens);

// Use in TokiForge
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

## fromW3C()

```typescript
static fromW3C(w3cTokens: any): DesignTokens
```

Convert W3C Design Tokens format to TokiForge.

**Parameters:**
- `w3cTokens: any` - W3C format tokens

**Returns:** `DesignTokens` - Converted tokens

**Example:**
```typescript
// W3C format
const w3cTokens = {
  color: {
    primary: {
      $value: '#3b82f6',
      $type: 'color',
    },
  },
};

const tokens = TokenImporter.fromW3C(w3cTokens);

console.log(tokens);
// {
//   color: {
//     primary: {
//       value: '#3b82f6',
//       type: 'color'
//     }
//   }
// }
```

---

## Format Comparison

| Feature | Style Dictionary | W3C Format | TokiForge |
|---------|------------------|------------|-----------|
| Value key | `value` | `$value` | `value` |
| Type key | `type` | `$type` | `type` |
| References | `{path}` | `{path}` | `{path}` |
| Metadata | Custom keys | `$description`, etc. | `description`, etc. |

---

## Migration Example

### From Style Dictionary

```typescript
// Input: Style Dictionary tokens
const sdTokens = {
  color: {
    brand: {
      primary: { value: '#3b82f6' },
      secondary: { value: '{color.brand.primary}' },
    },
  },
};

// Convert
const tokens = TokenImporter.fromStyleDictionary(sdTokens);

// Output: TokiForge format (already compatible!)
// {
//   color: {
//     brand: {
//       primary: { value: '#3b82f6' },
//       secondary: { value: '{color.brand.primary}' }
//     }
//   }
// }
```

---

### From W3C Format

```typescript
// Input: W3C Design Tokens
const w3cTokens = {
  spacing: {
    base: {
      $value: '8px',
      $type: 'dimension',
      $description: 'Base spacing unit',
    },
  },
};

// Convert
const tokens = TokenImporter.fromW3C(w3cTokens);

// Output: TokiForge format
// {
//   spacing: {
//     base: {
//       value: '8px',
//       type: 'dimension',
//       description: 'Base spacing unit'
//     }
//   }
// }
```

---

## See Also

- [Migration from Style Dictionary](/migration/from-style-dictionary)
- [TokenExporter](/api/token-exporter)
