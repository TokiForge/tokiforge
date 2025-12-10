---
title: Theming Guide | TokiForge
description: Complete guide to theming with TokiForge. Learn how to create themes, switch between themes, and manage theme configurations.
---

# Theming Guide

Complete guide to theming with TokiForge.

## Basic Theming

### Single Theme

```typescript
const themeConfig = {
  themes: [
    { name: 'default', tokens: myTokens },
  ],
};
```

### Multiple Themes

```typescript
const themeConfig = {
  themes: [
    { name: 'light', tokens: lightTokens },
    { name: 'dark', tokens: darkTokens },
    { name: 'high-contrast', tokens: highContrastTokens },
  ],
  defaultTheme: 'light',
};
```

## Theme Modes

### Static Mode (Recommended)

Use static mode for zero JavaScript overhead:

```typescript
provideTheme(themeConfig, {
  mode: 'static',
  persist: true,
  watchSystemTheme: true,
});

themeService.init(themeConfig, {
  mode: 'static',
  persist: true,
  watchSystemTheme: true,
});
```

Static mode uses body classes (`theme-light`, `theme-dark`) instead of runtime injection, providing:
- ✅ Zero JavaScript overhead
- ✅ Automatic localStorage persistence
- ✅ System theme detection
- ✅ All plugin features (token parsing, references)

### Dynamic Mode

Dynamic mode uses runtime CSS injection (default):

```typescript
provideTheme(themeConfig);

themeService.init(themeConfig);
```

## Theme Switching

### Programmatic

```typescript
const { setTheme } = useTheme();
setTheme('dark');

themeService.setTheme('dark');

themeStore.setTheme('dark');
```

### User-Initiated

```tsx
function ThemeSelector() {
  const { theme, setTheme, availableThemes } = useTheme();
  
  return (
    <select value={theme} onChange={(e) => setTheme(e.target.value)}>
      {availableThemes.map(name => (
        <option key={name} value={name}>{name}</option>
      ))}
    </select>
  );
}
```

## System Theme Detection

Automatic system theme detection is built-in:

```typescript
provideTheme(themeConfig, {
  watchSystemTheme: true,
});

themeService.init(themeConfig, {
  watchSystemTheme: true,
});
```

Or use manually:

```typescript
import { ThemeRuntime } from '@tokiforge/core';

const systemTheme = ThemeRuntime.detectSystemTheme();

const unwatch = ThemeRuntime.watchSystemTheme((theme) => {
  setTheme(theme);
});
```

## Contextual Theming

Apply themes to specific components:

```typescript
const runtime = new ThemeRuntime(config);
runtime.init('.my-component', 'hf');
```

## Theme Inheritance

Create themes that extend others:

```typescript
const baseTheme = { /* base tokens */ };
const darkTheme = {
  ...baseTheme,
  color: {
    ...baseTheme.color,
    background: { value: '#000', type: 'color' },
  },
};
```

## Dynamic Themes

Generate themes programmatically:

```typescript
function generateTheme(primaryColor: string) {
  return {
    name: 'custom',
    tokens: {
      color: {
        primary: { value: primaryColor, type: 'color' },
      },
    },
  };
}
```

## Performance Tips

1. **Use static mode** - Zero JavaScript overhead with body classes
2. **Preload themes** - Load theme data early
3. **Use CSS variables** - Better performance than JS tokens
4. **Generate CSS at build time** - For static sites
5. **Lazy load** - Load themes on demand for large apps
6. **Cache tokens** - Cache parsed tokens in memory

## Best Practices

1. **Consistent naming** - Use clear theme names
2. **Token structure** - Keep token structure consistent
3. **Type safety** - Use TypeScript for token types
4. **Accessibility** - Ensure contrast ratios meet WCAG

## Next Steps

- See [Design Tokens](/guide/design-tokens) for token structure
- Check [Performance Guide](/guide/performance) for optimization


