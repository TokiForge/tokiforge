---
title: Accessibility Features | TokiForge
description: Learn about TokiForge's built-in accessibility features including high contrast mode, reduced motion, color blind support, and font scaling.
---

# Accessibility Features

TokiForge provides built-in accessibility features to ensure your themes are accessible to all users.

## High Contrast Mode

Automatically detect and support high contrast mode preferences.

### Configuration

```typescript
import { ThemeRuntime } from '@tokiforge/core';

const theme = new ThemeRuntime({
  themes: [
    { name: 'light', tokens: lightTokens },
    { name: 'dark', tokens: darkTokens },
  ],
  accessibility: {
    highContrast: {
      autoDetect: true,
      useVariants: true,
    },
  },
});
```

### Manual Control

```typescript
const preferences = theme.getAccessibilityPreferences();
console.log('High contrast:', preferences?.highContrast);
```

## Reduced Motion

Respect user preferences for reduced motion by disabling animations and transitions.

### Configuration

```typescript
const theme = new ThemeRuntime({
  themes: [...],
  accessibility: {
    reducedMotion: {
      autoDetect: true,
      disableTransitions: true,
    },
  },
});
```

When `prefers-reduced-motion: reduce` is detected, TokiForge automatically injects CSS that disables animations and transitions.

## Color Blind Mode

Support users with color vision deficiencies by applying color transformations.

### Configuration

```typescript
const theme = new ThemeRuntime({
  themes: [...],
  accessibility: {
    colorBlind: {
      type: 'protanopia', // 'protanopia' | 'deuteranopia' | 'tritanopia'
      autoApply: true,
    },
  },
});
```

### Manual Control

```typescript
// Set color blind mode
theme.setColorBlindMode('deuteranopia');

// Check current mode
const preferences = theme.getAccessibilityPreferences();
console.log('Color blind mode:', preferences?.colorBlindMode);
```

### Supported Types

- **protanopia**: Red-green color blindness (red deficiency)
- **deuteranopia**: Red-green color blindness (green deficiency)
- **tritanopia**: Blue-yellow color blindness

## Font Size Scaling

Support users who need larger font sizes.

### Configuration

```typescript
const theme = new ThemeRuntime({
  themes: [...],
  accessibility: {
    fontSizeScaling: {
      autoDetect: true,
      baseSize: 16,
    },
  },
});
```

### Manual Control

```typescript
// Set font size scale (0.5x to 3.0x)
theme.setFontSizeScale(1.25); // 25% larger

// Check current scale
const preferences = theme.getAccessibilityPreferences();
console.log('Font size scale:', preferences?.fontSizeScale);
```

## Complete Configuration

```typescript
const theme = new ThemeRuntime({
  themes: [
    { name: 'light', tokens: lightTokens },
    { name: 'dark', tokens: darkTokens },
  ],
  accessibility: {
    highContrast: {
      autoDetect: true,
      useVariants: true,
    },
    reducedMotion: {
      autoDetect: true,
      disableTransitions: true,
    },
    colorBlind: {
      type: 'protanopia',
      autoApply: true,
    },
    fontSizeScaling: {
      autoDetect: true,
      baseSize: 16,
    },
  },
});
```

## System Preferences Detection

TokiForge automatically detects system preferences:

- `prefers-contrast: high` - High contrast mode
- `forced-colors: active` - Windows High Contrast mode
- `prefers-reduced-motion: reduce` - Reduced motion preference
- Document font size - Font scaling preference

All preferences are watched and themes are automatically updated when preferences change.

