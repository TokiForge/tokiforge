---
title: Token Expressions API | TokiForge
description: Complete API reference for mathematical expressions in TokiForge tokens. Learn how to use expressions, calculations, and dynamic token values.
---

# Token Expressions API

Complete API reference for mathematical expressions in TokiForge tokens.

## Overview

Token expressions allow you to use mathematical operations and `calc()` in token values.

## Import

```typescript
import { ExpressionParser } from '@tokiforge/core';
```

## Supported Operations

### Basic Math

- `+` - Addition
- `-` - Subtraction
- `*` - Multiplication
- `/` - Division
- `()` - Parentheses for grouping

### Examples

```json
{
  "spacing": {
    "base": { "value": "1rem" },
    "large": { "value": "{spacing.base} * 2" },
    "small": { "value": "{spacing.base} / 2" },
    "combined": { "value": "({spacing.base} + {spacing.md}) * 1.5" }
  }
}
```

## Calc() Expressions

Support for CSS `calc()` syntax:

```json
{
  "layout": {
    "sidebar": { "value": "250px" },
    "content": { "value": "calc(100% - {layout.sidebar})" },
    "header": { "value": "60px" },
    "main": { "value": "calc(100vh - {layout.header})" }
  }
}
```

## Expression Parser

### Parse Expressions

```typescript
import { ExpressionParser } from '@tokiforge/core';

const result = ExpressionParser.parse(
  '{spacing.base} * 2',
  tokens,
  ['spacing', 'large']
);
```

## Usage in TokenParser

Expressions are automatically processed when parsing tokens:

```typescript
import { TokenParser } from '@tokiforge/core';

const tokens = TokenParser.parse('./tokens.json', {
  processExpressions: true, // Default: true
});
```

## Examples

### Responsive Spacing

```json
{
  "spacing": {
    "base": { "value": "16px" },
    "sm": { "value": "{spacing.base} / 2" },
    "md": { "value": "{spacing.base}" },
    "lg": { "value": "{spacing.base} * 1.5" },
    "xl": { "value": "{spacing.base} * 2" }
  }
}
```

### Layout Calculations

```json
{
  "layout": {
    "container": { "value": "1200px" },
    "sidebar": { "value": "250px" },
    "content": { "value": "calc({layout.container} - {layout.sidebar})" }
  }
}
```

