# TokiForge React Example

This is a complete example demonstrating how to use TokiForge with React.

> **TokiForge v2.4.0** | **React 18+**

## Setup

Before running this example, make sure you've built the TokiForge packages from the root of the monorepo:

```bash
# From the root directory
npm run build
```

Then install dependencies:

```bash
npm install
```

## Browser Compatibility

Import browser APIs from `@tokiforge/core/runtime` (or framework packages like `@tokiforge/react`). Use `@tokiforge/core/node` only in CLI/build scripts that need `TokenParser` / file I/O.

## Running

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Features

This example demonstrates:

- **Theme Configuration**: Setting up light and dark themes with design tokens
- **Theme Provider**: Using `ThemeProvider` to wrap your app and provide theme context
- **Theme Switching**: Toggle between themes using the `setTheme` function from `useTheme` hook
- **CSS Variables**: Using TokiForge-generated CSS variables in your styles
- **Reactive Tokens**: Accessing theme tokens reactively using the `useTheme` hook
- **Component Structure**: Using theme context in multiple components

## Code Structure

- `src/App.tsx` - Main component demonstrating theme usage
- `src/tokens.json` - Design tokens configuration
- `src/main.tsx` - Application entry point

## Key Concepts

### Theme Provider

```tsx
import { ThemeProvider } from "@tokiforge/react";

function App() {
  return (
    <ThemeProvider config={themeConfig}>
      {/* Your app components */}
    </ThemeProvider>
  );
}
```

### Using Theme in Components

```tsx
import { useTheme } from "@tokiforge/react";

function MyComponent() {
  const { theme, tokens, setTheme } = useTheme();

  return (
    <div style={{ color: tokens.color.text.primary }}>
      Current theme: {theme}
    </div>
  );
}
```

### Using CSS Variables

```tsx
<div
  style={{
    backgroundColor: "var(--hf-color-background-default)",
    color: "var(--hf-color-text-primary)",
  }}
>
  Content
</div>
```
