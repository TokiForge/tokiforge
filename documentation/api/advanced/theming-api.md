---
title: Theming API | TokiForge
description: Complete API reference for programmatic theme creation with ThemeBuilder. Learn how to create, extend, and manipulate themes programmatically.
---

# Theming API

Complete API reference for programmatic theme creation.

## Overview

The Theming API allows you to programmatically create and manage themes using a fluent builder pattern.

## Import

```typescript
import { ThemeBuilder } from '@tokiforge/core';
```

## ThemeBuilder

### Creating a Theme

```typescript
const theme = new ThemeBuilder('dark')
  .addToken('color.primary', '#7C3AED')
  .addToken('color.background', '#1a1a1a', { type: 'color' })
  .build();
```

### Adding Multiple Tokens

```typescript
const theme = new ThemeBuilder('light')
  .addTokens({
    'color.primary': '#7C3AED',
    'color.secondary': '#06B6D4',
    'spacing.base': '1rem',
    'spacing.md': '1.5rem',
  })
  .build();
```

### Extending a Theme

```typescript
const darkTheme = new ThemeBuilder('dark')
  .extend(lightTheme)
  .override({
    color: {
      background: { value: '#1a1a1a' },
    },
  })
  .build();
```

### Overriding Tokens

```typescript
const theme = new ThemeBuilder('custom')
  .addToken('color.primary', '#7C3AED')
  .override({
    color: {
      primary: { value: '#8B5CF6' },
    },
  })
  .build();
```

## Static Methods

### fromTokens()

Create a theme from existing tokens.

```typescript
const theme = ThemeBuilder.fromTokens('light', lightTokens);
```

### createVariant()

Create a theme variant from a base theme.

```typescript
const darkTheme = ThemeBuilder.createVariant(lightTheme, 'dark', {
  color: {
    background: { value: '#1a1a1a' },
  },
});
```

### createThemeConfig()

Create a theme config with multiple themes.

```typescript
const config = ThemeBuilder.createThemeConfig(lightTheme, darkTheme, customTheme);
```

## Examples

### Complete Theme Creation

```typescript
const lightTheme = new ThemeBuilder('light')
  .addToken('color.primary', '#7C3AED', { type: 'color' })
  .addToken('color.background', '#ffffff', { type: 'color' })
  .addTokens({
    'spacing.sm': '0.5rem',
    'spacing.md': '1rem',
    'spacing.lg': '2rem',
  })
  .build();

const darkTheme = new ThemeBuilder('dark')
  .extend(lightTheme)
  .override({
    color: {
      background: { value: '#1a1a1a' },
      text: { value: '#ffffff' },
    },
  })
  .build();

const config = ThemeBuilder.createThemeConfig(lightTheme, darkTheme);
```

