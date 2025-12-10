---
title: Token Functions API | TokiForge
description: Complete API reference for token functions in TokiForge. Learn about computed tokens, color manipulation, mathematical operations, and custom functions.
---

# Token Functions API

Complete API reference for token functions in TokiForge.

## Overview

Token functions allow you to compute token values dynamically using built-in or custom functions.

## Import

```typescript
import { TokenFunctions, FunctionParser } from '@tokiforge/core';
```

## Built-in Functions

### Color Functions

#### `darken(color, amount)`

Darken a color by a percentage.

```json
{
  "color": {
    "primary": { "value": "#7C3AED" },
    "primaryDark": { "value": "darken({color.primary}, 20)" }
  }
}
```

#### `lighten(color, amount)`

Lighten a color by a percentage.

```json
{
  "color": {
    "primary": { "value": "#7C3AED" },
    "primaryLight": { "value": "lighten({color.primary}, 20)" }
  }
}
```

#### `mix(color1, color2, weight)`

Mix two colors with a weight (0-1).

```json
{
  "color": {
    "accent": { "value": "mix({color.primary}, {color.secondary}, 0.5)" }
  }
}
```

#### `alpha(color, alpha)`

Add alpha channel to a color (0-1).

```json
{
  "color": {
    "primaryAlpha": { "value": "alpha({color.primary}, 0.8)" }
  }
}
```

### Math Functions

#### `add(...values)`

Add multiple values.

```json
{
  "spacing": {
    "total": { "value": "add({spacing.sm}, {spacing.md}, {spacing.lg})" }
  }
}
```

#### `subtract(a, b)`

Subtract b from a.

```json
{
  "spacing": {
    "difference": { "value": "subtract({spacing.lg}, {spacing.md})" }
  }
}
```

#### `multiply(...values)`

Multiply multiple values.

```json
{
  "spacing": {
    "double": { "value": "multiply({spacing.base}, 2)" }
  }
}
```

#### `divide(a, b)`

Divide a by b.

```json
{
  "spacing": {
    "half": { "value": "divide({spacing.base}, 2)" }
  }
}
```

### Unit Functions

#### `px(value)`

Convert value to pixels.

```json
{
  "spacing": {
    "base": { "value": "16" },
    "basePx": { "value": "px({spacing.base})" }
  }
}
```

#### `rem(value)`

Convert value to rem units.

```json
{
  "spacing": {
    "base": { "value": "16" },
    "baseRem": { "value": "rem({spacing.base})" }
  }
}
```

#### `em(value)`

Convert value to em units.

```json
{
  "spacing": {
    "base": { "value": "16" },
    "baseEm": { "value": "em({spacing.base})" }
  }
}
```

## Custom Functions

### Register a Custom Function

```typescript
import { TokenFunctions } from '@tokiforge/core';

TokenFunctions.register({
  name: 'customFunction',
  minArgs: 1,
  maxArgs: 3,
  execute: (args, tokens, context) => {
    // Your custom logic
    return result;
  },
});
```

### Function Interface

```typescript
interface TokenFunction {
  name: string;
  execute: (args: any[], tokens: DesignTokens, context: string[]) => any;
  minArgs?: number;
  maxArgs?: number;
}
```

## Function Parser

### Parse Function Calls

```typescript
import { FunctionParser } from '@tokiforge/core';

const result = FunctionParser.parse(
  'darken({color.primary}, 20)',
  tokens,
  ['color', 'primaryDark']
);
```

## Usage in TokenParser

Functions are automatically processed when parsing tokens:

```typescript
import { TokenParser } from '@tokiforge/core';

const tokens = TokenParser.parse('./tokens.json', {
  processFunctions: true, // Default: true
});
```

## Examples

### Complex Color Calculations

```json
{
  "color": {
    "primary": { "value": "#7C3AED" },
    "primaryDark": { "value": "darken({color.primary}, 20)" },
    "primaryLight": { "value": "lighten({color.primary}, 20)" },
    "accent": { "value": "mix({color.primary}, {color.secondary}, 0.5)" },
    "primaryAlpha": { "value": "alpha({color.primary}, 0.8)" }
  }
}
```

### Spacing Calculations

```json
{
  "spacing": {
    "base": { "value": "1rem" },
    "double": { "value": "multiply({spacing.base}, 2)" },
    "half": { "value": "divide({spacing.base}, 2)" },
    "total": { "value": "add({spacing.sm}, {spacing.md}, {spacing.lg})" }
  }
}
```

