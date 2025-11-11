# @tokiforge/react

React adapter for TokiForge theming (v1.1.0).

## Installation

```bash
npm install @tokiforge/react@^1.1.0 @tokiforge/core@^1.1.0
```

## Usage

```tsx
import { ThemeProvider, useTheme } from '@tokiforge/react';

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
      <YourApp />
    </ThemeProvider>
  );
}

function Button() {
  const { tokens, setTheme, theme } = useTheme();
  
  return (
    <button
      style={{
        backgroundColor: tokens.color.primary,
        color: tokens.color.text.primary,
      }}
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      Toggle Theme
    </button>
  );
}
```

## API

### `ThemeProvider`

Provides theme context to React components.

**Props:**
- `config`: Theme configuration object
- `selector`: CSS selector for theme injection (default: `:root`)
- `prefix`: CSS variable prefix (default: `hf`)
- `defaultTheme`: Default theme name

### `useTheme()`

Hook to access theme context.

**Returns:**
- `theme`: Current theme name
- `tokens`: Current theme tokens
- `setTheme(name)`: Switch to a theme
- `nextTheme()`: Cycle to next theme
- `availableThemes`: Array of available theme names
- `runtime`: ThemeRuntime instance





## Improvements

- Enhanced documentation
- Better examples
- Updated usage guide
