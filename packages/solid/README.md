# @tokiforge/solid

Solid.js adapter for TokiForge theming system.

## Installation

```bash
npm install @tokiforge/solid @tokiforge/core solid-js
```

## Usage

### Basic Setup

```tsx
import { ThemeProvider, useTheme } from '@tokiforge/solid';

const config = {
  themes: [
    { name: 'light', tokens: { /* ... */ } },
    { name: 'dark', tokens: { /* ... */ } },
  ],
  defaultTheme: 'light',
};

function App() {
  return (
    <ThemeProvider config={config}>
      <YourApp />
    </ThemeProvider>
  );
}
```

### Using Theme Context

```tsx
import { useTheme } from '@tokiforge/solid';

function ThemeSwitcher() {
  const { theme, setTheme, availableThemes } = useTheme();

  return (
    <div>
      <p>Current theme: {theme()}</p>
      <For each={availableThemes()}>
        {(themeName) => (
          <button onClick={() => setTheme(themeName)}>
            {themeName}
          </button>
        )}
      </For>
    </div>
  );
}
```

### Using Standalone (without Provider)

```tsx
import { createTheme } from '@tokiforge/solid';

function MyComponent() {
  const { theme, tokens, setTheme } = createTheme(config);

  return (
    <div>
      <p>Theme: {theme()}</p> 
      <button onClick={() => setTheme('dark')}>Dark Mode</button>
    </div>
  );
}
```

## API

### `createTheme(config, options?)`

Creates a reactive theme context.

**Returns:** `ThemeContext`

### `ThemeProvider`

Context provider component.

**Props:**
- `config`: Theme configuration
- `options?`: Theme options
- `children`: Child components

### `useTheme()`

Hook to access theme context.

**Returns:** `ThemeContext`

## Features

- ✅ Signal-based reactivity
- ✅ SSR-safe initialization
- ✅ Theme persistence (localStorage)
- ✅ System theme detection
- ✅ TypeScript support

## License

AGPL-3.0
