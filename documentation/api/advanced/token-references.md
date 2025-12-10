---
title: Token References with Fallbacks API | TokiForge
description: Complete API reference for token references with fallback support. Learn how to reference tokens with fallback values for robust token systems.
---

# Token References with Fallbacks API

Complete API reference for token references with fallback support.

## Overview

Token references with fallbacks allow you to reference other tokens with a fallback value if the reference is missing.

## Syntax

```json
{
  "token": { "value": "{reference.path || fallback}" }
}
```

## Fallback Types

### String Fallback

```json
{
  "color": {
    "accent": { "value": "{color.secondary || #FF6B6B}" }
  }
}
```

### Number Fallback

```json
{
  "spacing": {
    "base": { "value": "{spacing.default || 16}" }
  }
}
```

### Nested Reference Fallback

```json
{
  "color": {
    "text": { "value": "{color.textPrimary || {color.primary} || #000000}" }
  }
}
```

## Reference Resolver

### Resolve References

```typescript
import { ReferenceResolver } from '@tokiforge/core';

const result = ReferenceResolver.resolve(
  '{color.primary || #000000}',
  tokens,
  ['color', 'text']
);
```

## Usage in TokenParser

Fallback references are automatically processed when parsing tokens:

```typescript
import { TokenParser } from '@tokiforge/core';

const tokens = TokenParser.parse('./tokens.json', {
  processFallbacks: true, // Default: true
});
```

## Examples

### Color Fallbacks

```json
{
  "color": {
    "primary": { "value": "#7C3AED" },
    "accent": { "value": "{color.secondary || {color.primary} || #FF6B6B}" },
    "text": { "value": "{color.textPrimary || #000000}" }
  }
}
```

### Spacing Fallbacks

```json
{
  "spacing": {
    "base": { "value": "1rem" },
    "small": { "value": "{spacing.sm || {spacing.base} || 0.5rem}" }
  }
}
```

