# React API Reference

Complete API reference for `@tokiforge/react`.

## ThemeProvider

React component that provides theme context to all child components.

### Props

```typescript
interface ThemeProviderProps {
  config: ThemeConfig;
  selector?: string;
  prefix?: string;
  defaultTheme?: string;
  children: React.ReactNode;
}
```

### Example

```tsx
<ThemeProvider 
  config={themeConfig}
  selector=":root"
  prefix="hf"
  defaultTheme="light"
>
  <App />
</ThemeProvider>
```

## useTheme

React hook to access theme context.

### Returns

```typescript
interface ThemeContextValue {
  theme: string;
  tokens: DesignTokens;
  setTheme: (themeName: string) => void;
  nextTheme: () => void;
  availableThemes: string[];
  runtime: ThemeRuntime;
}
```

### Example

```tsx
function Component() {
  const { theme, tokens, setTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme('dark')}>
      Current: {theme}
    </button>
  );
}
```

## Types

All types are exported from `@tokiforge/core`. See [Core API](/api/core) for details.

## Examples

See [React Example](/examples/react) for complete usage examples.


