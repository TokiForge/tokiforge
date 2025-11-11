# Quick Start

> **TokiForge v1.0.0**

Get up and running with TokiForge in 5 minutes!

## Step 1: Install

```bash
npm install @tokiforge/core@^1.0.0 @tokiforge/react@^1.0.0
```

## Step 2: Create Tokens

Create `tokens.json`:

```json
{
  "color": {
    "primary": { "value": "#7C3AED", "type": "color" },
    "accent": { "value": "#06B6D4", "type": "color" }
  },
  "radius": {
    "lg": { "value": "12px", "type": "dimension" }
  }
}
```

## Step 3: Use in Your App

```tsx
import { ThemeProvider, useTheme } from '@tokiforge/react';

const themeConfig = {
  themes: [
    { name: 'light', tokens: tokens },
  ],
  defaultTheme: 'light',
};

function App() {
  return (
    <ThemeProvider config={themeConfig}>
      <Button />
    </ThemeProvider>
  );
}

function Button() {
  const { tokens, setTheme } = useTheme();
  return (
    <button
      style={{
        backgroundColor: tokens.color.primary,
        borderRadius: tokens.radius.lg,
      }}
    >
      Click me
    </button>
  );
}
```

## Step 4: Switch Themes

```tsx
function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Toggle Theme
    </button>
  );
}
```

That's it! 🎉

## Next Steps

- Learn about [Core Concepts](/guide/core-concepts)
- See [Framework Guides](/guide/react)
- Check [Examples](/examples/react)


