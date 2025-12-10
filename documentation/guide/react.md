---
title: React Guide | TokiForge
description: Complete guide to using TokiForge with React. Learn how to set up ThemeProvider, use hooks, and manage themes in React applications.
---

# React Guide

> **TokiForge v1.2.0**

TokiForge works seamlessly with React through the `@tokiforge/react` package.

## Installation

```bash
npm install @tokiforge/react@^1.2.0 @tokiforge/core@^1.2.0
```

## Setup

### 1. Wrap Your App

Use the `ThemeProvider` to make themes available throughout your app:

```tsx
import { ThemeProvider } from '@tokiforge/react';

const themeConfig = {
  themes: [
    { name: 'light', tokens: lightTokens },
    { name: 'dark', tokens: darkTokens },
  ],
  defaultTheme: 'light',
};

function App() {
  return (
    <ThemeProvider config={themeConfig}>
      <YourComponents />
    </ThemeProvider>
  );
}
```

### 2. Use the Hook

Access theme data with the `useTheme` hook:

```tsx
import { useTheme } from '@tokiforge/react';

function MyComponent() {
  const { tokens, theme, setTheme, availableThemes } = useTheme();
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={() => setTheme('dark')}>
        Switch to Dark
      </button>
    </div>
  );
}
```

## API Reference

### `ThemeProvider`

Props:

- `config: ThemeConfig` - Theme configuration object
- `selector?: string` - CSS selector for theme injection (default: `:root`)
- `prefix?: string` - CSS variable prefix (default: `hf`)
- `defaultTheme?: string` - Override default theme name
- `children: ReactNode` - Your app components

### `useTheme()`

Returns:

```typescript
{
  theme: string;                    // Current theme name
  tokens: DesignTokens;              // Current theme tokens
  setTheme: (name: string) => void; // Switch theme
  nextTheme: () => void;             // Cycle to next theme
  availableThemes: string[];         // All available theme names
  runtime: ThemeRuntime;             // Runtime instance
}
```

## Examples

### Basic Theme Switching

```tsx
function ThemeSwitcher() {
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

### Using Tokens in Styles

```tsx
function Button() {
  const { tokens } = useTheme();
  
  return (
    <button
      style={{
        backgroundColor: tokens.color.primary,
        color: tokens.color.text.primary,
        borderRadius: tokens.radius.lg,
        padding: `${tokens.spacing.md} ${tokens.spacing.lg}`,
      }}
    >
      Click me
    </button>
  );
}
```

### Using CSS Variables

CSS variables are automatically injected. Use them directly:

```tsx
function Card() {
  return (
    <div
      style={{
        backgroundColor: 'var(--hf-color-background-default)',
        color: 'var(--hf-color-text-primary)',
        borderRadius: 'var(--hf-radius-md)',
        padding: 'var(--hf-spacing-lg)',
      }}
    >
      Content
    </div>
  );
}
```

### With CSS Modules

```css
/* styles.module.css */
.card {
  background-color: var(--hf-color-background-default);
  color: var(--hf-color-text-primary);
  border-radius: var(--hf-radius-md);
}
```

```tsx
import styles from './styles.module.css';

function Card() {
  return <div className={styles.card}>Content</div>;
}
```

### With Styled Components

```tsx
import styled from 'styled-components';

const Button = styled.button`
  background-color: var(--hf-color-primary);
  color: var(--hf-color-text-primary);
  border-radius: var(--hf-radius-lg);
  padding: var(--hf-spacing-md) var(--hf-spacing-lg);
`;
```

## Server-Side Rendering (SSR)

TokiForge works with SSR! The runtime safely handles server environments:

```tsx
// Works with Next.js, Remix, etc.
function App() {
  return (
    <ThemeProvider config={themeConfig}>
      <YourApp />
    </ThemeProvider>
  );
}
```

The theme will be applied on the client side after hydration.

## TypeScript

Full TypeScript support is included:

```tsx
import { ThemeConfig, DesignTokens } from '@tokiforge/react';

const themeConfig: ThemeConfig = {
  themes: [
    { name: 'light', tokens: lightTokens },
  ],
};

function Component() {
  const { tokens } = useTheme();
  // tokens is fully typed!
  const primary: string = tokens.color.primary;
}
```

## Best Practices

1. **Wrap at the root** - Place `ThemeProvider` at the top level of your app
2. **Use CSS variables** - Prefer CSS variables for better performance
3. **Type your tokens** - Use TypeScript to ensure type safety
4. **Lazy load themes** - Load theme data as needed for large apps

## Next Steps

- See [React Example](/examples/react) for a complete example
- Learn about [Advanced Theming](/guide/theming)
- Check the [API Reference](/api/react)


