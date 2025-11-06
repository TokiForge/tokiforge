# React Example

> **TokiForge v0.2.1**

Complete React example using TokiForge.

## Setup

```bash
npm install @tokiforge/react@^0.2.1 @tokiforge/core@^0.2.1 react react-dom
```

## Code

```tsx
import { ThemeProvider, useTheme } from '@tokiforge/react';
import { useState } from 'react';

// Define your tokens
const lightTokens = {
  color: {
    primary: { value: '#7C3AED', type: 'color' },
    accent: { value: '#06B6D4', type: 'color' },
    text: {
      primary: { value: '#1F2937', type: 'color' },
      secondary: { value: '#6B7280', type: 'color' },
    },
    background: {
      default: { value: '#FFFFFF', type: 'color' },
      muted: { value: '#F9FAFB', type: 'color' },
    },
  },
  radius: {
    sm: { value: '4px', type: 'dimension' },
    md: { value: '8px', type: 'dimension' },
    lg: { value: '12px', type: 'dimension' },
  },
  spacing: {
    xs: { value: '4px', type: 'dimension' },
    sm: { value: '8px', type: 'dimension' },
    md: { value: '16px', type: 'dimension' },
    lg: { value: '24px', type: 'dimension' },
  },
};

const darkTokens = {
  ...lightTokens,
  color: {
    ...lightTokens.color,
    text: {
      primary: { value: '#F8FAFC', type: 'color' },
      secondary: { value: '#CBD5E1', type: 'color' },
    },
    background: {
      default: { value: '#0F172A', type: 'color' },
      muted: { value: '#1E293B', type: 'color' },
    },
  },
};

const themeConfig = {
  themes: [
    { name: 'light', tokens: lightTokens },
    { name: 'dark', tokens: darkTokens },
  ],
  defaultTheme: 'light',
};

// App Component
function App() {
  return (
    <ThemeProvider config={themeConfig}>
      <div style={{ minHeight: '100vh', padding: '2rem' }}>
        <Header />
        <Content />
        <ThemeSwitcher />
      </div>
    </ThemeProvider>
  );
}

// Header Component
function Header() {
  const { tokens } = useTheme();
  
  return (
    <header
      style={{
        backgroundColor: tokens.color.background.muted,
        padding: tokens.spacing.lg,
        borderRadius: tokens.radius.md,
        marginBottom: tokens.spacing.lg,
      }}
    >
      <h1 style={{ color: tokens.color.text.primary, margin: 0 }}>
        🌈 TokiForge React Example
      </h1>
    </header>
  );
}

// Content Component
function Content() {
  const { tokens } = useTheme();
  
  return (
    <div
      style={{
        backgroundColor: tokens.color.background.default,
        color: tokens.color.text.primary,
        padding: tokens.spacing.lg,
        borderRadius: tokens.radius.lg,
        border: `1px solid ${tokens.color.primary}`,
      }}
    >
      <h2>Welcome to TokiForge!</h2>
      <p>This is a React example demonstrating theme switching.</p>
      <Button>Primary Button</Button>
      <Button variant="accent">Accent Button</Button>
    </div>
  );
}

// Button Component
function Button({ children, variant = 'primary' }) {
  const { tokens } = useTheme();
  
  const backgroundColor = 
    variant === 'accent' 
      ? tokens.color.accent 
      : tokens.color.primary;
  
  return (
    <button
      style={{
        backgroundColor,
        color: tokens.color.text.primary,
        border: 'none',
        borderRadius: tokens.radius.md,
        padding: `${tokens.spacing.md} ${tokens.spacing.lg}`,
        marginRight: tokens.spacing.md,
        cursor: 'pointer',
        fontWeight: 600,
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = '0.9';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = '1';
      }}
    >
      {children}
    </button>
  );
}

// Theme Switcher
function ThemeSwitcher() {
  const { theme, setTheme, availableThemes } = useTheme();
  
  return (
    <div style={{ marginTop: '2rem' }}>
      <label>
        Theme:{' '}
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            border: '1px solid var(--hf-color-primary)',
          }}
        >
          {availableThemes.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

export default App;
```

## Try It

1. Navigate to the example: `cd examples/react-example`
2. Install dependencies: `npm install`
3. Run dev server: `npm run dev`
4. Switch themes to see the magic! ✨

## Features Demonstrated

- ✅ Theme provider setup
- ✅ Theme switching with hooks
- ✅ CSS variables for styling
- ✅ Direct token access
- ✅ Works with CSS Modules and Styled Components
- ✅ SSR-safe (works with Next.js, Remix, etc.)

## Next Steps

- See [React Guide](/guide/react) for more details
- Check [API Reference](/api/react) for full API docs
- Explore [Other Examples](/examples/vue)


