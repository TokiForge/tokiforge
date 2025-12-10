---
title: Design Tokens Guide | TokiForge
description: Complete guide to creating and managing design tokens with TokiForge. Learn token structure, types, references, and best practices.
---

# Design Tokens Guide

Complete guide to creating and managing design tokens.

## Token Structure

### Basic Token

```json
{
  "color": {
    "primary": { "value": "#7C3AED", "type": "color" }
  }
}
```

### With Description

```json
{
  "color": {
    "primary": {
      "value": "#7C3AED",
      "type": "color",
      "description": "Primary brand color"
    }
  }
}
```

## Token Types

### Color

```json
{
  "color": {
    "primary": { "value": "#7C3AED", "type": "color" },
    "rgb": { "value": "rgb(124, 58, 237)", "type": "color" },
    "rgba": { "value": "rgba(124, 58, 237, 0.5)", "type": "color" }
  }
}
```

### Dimension

```json
{
  "spacing": {
    "sm": { "value": "4px", "type": "dimension" },
    "md": { "value": "16px", "type": "dimension" },
    "lg": { "value": "24px", "type": "dimension" }
  },
  "radius": {
    "sm": { "value": "4px", "type": "dimension" },
    "lg": { "value": "12px", "type": "dimension" }
  }
}
```

### Typography

```json
{
  "font": {
    "family": {
      "sans": { "value": "Inter, sans-serif", "type": "fontFamily" }
    },
    "weight": {
      "bold": { "value": "700", "type": "fontWeight" }
    },
    "size": {
      "sm": { "value": "14px", "type": "dimension" },
      "lg": { "value": "18px", "type": "dimension" }
    }
  }
}
```

## Token References

Reference other tokens using `{path.to.token}` syntax:

```json
{
  "color": {
    "primary": { "value": "#7C3AED", "type": "color" }
  },
  "button": {
    "background": { "value": "{color.primary}", "type": "color" }
  }
}
```

## Nested Tokens

Organize tokens hierarchically:

```json
{
  "color": {
    "text": {
      "primary": { "value": "#1F2937", "type": "color" },
      "secondary": { "value": "#6B7280", "type": "color" }
    },
    "background": {
      "default": { "value": "#FFFFFF", "type": "color" },
      "muted": { "value": "#F9FAFB", "type": "color" }
    }
  }
}
```

## Token Validation

TokiForge validates:

- Token structure
- Value types
- Reference resolution
- Duplicate names

Use `tokiforge lint` to validate:

```bash
tokiforge lint
```

## Best Practices

1. **Consistent naming** - Use clear, descriptive names
2. **Group related tokens** - Organize by category
3. **Use references** - Don't repeat values
4. **Add descriptions** - Document your tokens
5. **Type safety** - Use TypeScript for types

## Token Organization

Recommended structure:

```json
{
  "color": { /* colors */ },
  "spacing": { /* spacing */ },
  "typography": { /* fonts, sizes */ },
  "radius": { /* border radius */ },
  "shadow": { /* shadows */ },
  "animation": { /* durations, easings */ }
}
```

## Next Steps

- See [Core Concepts](/guide/core-concepts) for fundamentals
- Check [Theming Guide](/guide/theming) for theme usage


