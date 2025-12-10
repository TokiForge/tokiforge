---
title: Advanced Token Features | TokiForge
description: Learn about TokiForge's advanced token features including functions, expressions, references with fallbacks, scoping, theming API, and transformation pipeline.
---

# Advanced Token Features

TokiForge supports advanced token features including functions, expressions, references with fallbacks, scoping, and more.

## Token Functions

Use built-in functions to compute token values dynamically.

### Available Functions

#### Color Functions

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

#### Math Functions

```json
{
  "spacing": {
    "base": { "value": "1rem" },
    "double": { "value": "multiply({spacing.base}, 2)" },
    "half": { "value": "divide({spacing.base}, 2)" },
    "sum": { "value": "add({spacing.sm}, {spacing.md}, {spacing.lg})" }
  }
}
```

#### Unit Functions

```json
{
  "spacing": {
    "base": { "value": "16" },
    "basePx": { "value": "px({spacing.base})" },
    "baseRem": { "value": "rem({spacing.base})" },
    "baseEm": { "value": "em({spacing.base})" }
  }
}
```

### Custom Functions

```typescript
import { TokenFunctions } from '@tokiforge/core';

TokenFunctions.register({
  name: 'customFunction',
  minArgs: 1,
  maxArgs: 2,
  execute: (args) => {
    // Your custom logic
    return result;
  },
});
```

## Token Expressions

Use mathematical expressions in token values.

### Basic Expressions

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

### Calc() Expressions

```json
{
  "layout": {
    "sidebar": { "value": "250px" },
    "content": { "value": "calc(100% - {layout.sidebar})" }
  }
}
```

## Token References with Fallbacks

Use fallback values when references are missing.

### Syntax

```json
{
  "color": {
    "primary": { "value": "#7C3AED" },
    "accent": { "value": "{color.secondary || #FF6B6B}" },
    "text": { "value": "{color.textPrimary || {color.primary} || #000000}" },
    "background": { "value": "{color.bgPrimary || #FFFFFF}" }
  }
}
```

### Fallback Types

- **String**: `{color.primary || "red"}`
- **Number**: `{spacing.base || 16}`
- **Reference**: `{color.primary || {color.fallback}}`

## Token Scoping

Create component-scoped tokens for isolated theming.

### Creating Scoped Tokens

```typescript
import { TokenScoping } from '@tokiforge/core';

const scoped = TokenScoping.createScope('button', {
  color: {
    background: { value: '#007bff' },
    text: { value: '#ffffff' },
  },
}, baseTokens);
```

### Extracting Component Tokens

```typescript
const buttonTokens = TokenScoping.extractScope(tokens, 'button');
```

### Applying Scope

```typescript
const scopedTokens = TokenScoping.applyScope(tokens, 'component.button');
```

## Theming API

Programmatically create and manage themes.

### Theme Builder

```typescript
import { ThemeBuilder } from '@tokiforge/core';

const theme = new ThemeBuilder('dark')
  .addToken('color.primary', '#7C3AED')
  .addToken('color.background', '#1a1a1a', { type: 'color' })
  .addTokens({
    'spacing.sm': '0.5rem',
    'spacing.md': '1rem',
    'spacing.lg': '2rem',
  })
  .extend(baseTheme)
  .override({
    color: {
      primary: { value: '#8B5CF6' },
    },
  })
  .build();
```

### Create Theme Config

```typescript
const lightTheme = ThemeBuilder.fromTokens('light', lightTokens);
const darkTheme = ThemeBuilder.createVariant(lightTheme, 'dark', {
  color: {
    background: { value: '#1a1a1a' },
  },
});

const config = ThemeBuilder.createThemeConfig(lightTheme, darkTheme);
```

## Validation Plugins

Create custom validation rules for your tokens.

### Creating a Validation Plugin

```typescript
import { ValidationPluginManager } from '@tokiforge/core';
import type { ValidationPlugin } from '@tokiforge/core';

const plugin: ValidationPlugin = {
  name: 'color-format-validator',
  validator: (tokens) => {
    const errors: string[] = [];
    // Validation logic
    return {
      valid: errors.length === 0,
      errors,
    };
  },
  validateToken: (token, path) => {
    if (path[0] === 'color' && !token.value.startsWith('#')) {
      return `Color token at ${path.join('.')} must use hex format`;
    }
    return null;
  },
};

ValidationPluginManager.register(plugin);
```

### Using Validation Plugins

```typescript
const result = ValidationPluginManager.validateAll(tokens);
if (!result.valid) {
  console.error('Validation errors:', result.errors);
}
```

## Transformation Pipeline

Transform tokens before export using a pipeline.

### Creating a Pipeline

```typescript
import { TransformationPipeline, BuiltInTransformations } from '@tokiforge/core';

const pipeline = TransformationPipeline.create()
  .addStep('removeDeprecated', BuiltInTransformations.removeDeprecated)
  .addStep('flatten', BuiltInTransformations.flatten)
  .addStep('addNamespace', (tokens) => 
    BuiltInTransformations.addNamespace(tokens, 'myapp')
  );

const transformed = await pipeline.execute(tokens);
```

### Built-in Transformations

- `flatten`: Flatten nested token structure
- `expandReferences`: Expand token references
- `removeDeprecated`: Remove deprecated tokens
- `addNamespace`: Add namespace prefix to tokens

### Custom Transformations

```typescript
pipeline.addStep('customTransform', async (tokens) => {
  // Your transformation logic
  return transformedTokens;
});
```

## Enabling Advanced Features

Configure which features to process:

```typescript
import { TokenParser } from '@tokiforge/core';

const tokens = TokenParser.parse('./tokens.json', {
  processFunctions: true,
  processExpressions: true,
  processFallbacks: true,
});
```

