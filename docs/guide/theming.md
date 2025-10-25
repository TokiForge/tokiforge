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

## Theme Switching

### Programmatic

```typescript
// React
const { setTheme } = useTheme();
setTheme('dark');

// Vue
const { setTheme } = useTheme();
setTheme.value('dark');

// Svelte
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

Detect and follow system theme preference:

```typescript
import { ThemeRuntime } from '@tokiforge/core';

const systemTheme = ThemeRuntime.detectSystemTheme();
// 'light' | 'dark'

// Watch for changes
const unwatch = ThemeRuntime.watchSystemTheme((theme) => {
  setTheme(theme);
});
```

## Contextual Theming

Apply themes to specific components:

```typescript
// Different selector
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

1. **Preload themes** - Load theme data early
2. **Use CSS variables** - Better performance than JS tokens
3. **Lazy load** - Load themes on demand for large apps
4. **Cache tokens** - Cache parsed tokens in memory

## Best Practices

1. **Consistent naming** - Use clear theme names
2. **Token structure** - Keep token structure consistent
3. **Type safety** - Use TypeScript for token types
4. **Accessibility** - Ensure contrast ratios meet WCAG

## Next Steps

- See [Design Tokens](/guide/design-tokens) for token structure
- Check [Performance Guide](/guide/performance) for optimization


