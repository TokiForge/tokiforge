# @tokiforge/emotion

Emotion CSS-in-JS adapter for TokiForge theming system.

## Installation

```bash
npm install @tokiforge/emotion @tokiforge/core @emotion/styled
```

## Usage

```tsx
import { ThemeProvider, useTheme } from "@tokiforge/emotion";
import styled from "@emotion/styled";

const StyledButton = styled.button`
  background-color: ${() => "var(--hf-color-primary)"};
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
`;

function App() {
  return (
    <ThemeProvider config={config}>
      <ThemeSwitcher />
      <StyledButton>Click me</StyledButton>
    </ThemeProvider>
  );
}

function ThemeSwitcher() {
  const { theme, setTheme, availableThemes } = useTheme();

  return (
    <select value={theme} onChange={(e) => setTheme(e.target.value)}>
      {availableThemes.map((t) => (
        <option key={t} value={t}>{t}</option>
      ))}
    </select>
  );
}
```

## API

### `ThemeProvider`

Emotion-compatible theme provider component.

**Props:**
- `config`: Theme configuration
- `prefix?`: CSS variable prefix (default: `hf`)
- `children`: React children

### `useTheme()`

Hook to access theme context.

**Returns:** `{ runtime, currentTheme, tokens, setTheme, nextTheme, availableThemes }`

### `styled`

Re-exported from `@emotion/styled` for convenience.

## Features

- Emotion CSS-in-JS support
- Runtime theme switching
- CSS variable injection
- TypeScript support

## License

AGPL-3.0
