# Core Concepts

Understanding how TokiForge works under the hood.

## Design Tokens

Design tokens are the foundation of TokiForge. They represent design decisions as data.

```json
{
  "color": {
    "primary": { "value": "#7C3AED", "type": "color" }
  }
}
```

### Token Structure

- `value` - The actual value (string or number)
- `type` - Optional type hint (color, dimension, etc.)
- `description` - Optional description

## CSS Variables

TokiForge converts tokens to CSS custom properties:

```css
:root {
  --hf-color-primary: #7C3AED;
  --hf-radius-lg: 12px;
}
```

These are injected at runtime, enabling instant theme switching.

## Theme Runtime

The `ThemeRuntime` class manages:

1. **Theme Storage** - Stores multiple themes
2. **CSS Injection** - Injects CSS variables into the page
3. **Theme Switching** - Switches themes without page reload
4. **Event System** - Emits events for theme changes

## Framework Adapters

Framework adapters provide:

- React: `ThemeProvider` + `useTheme` hook
- Vue: `provideTheme` + `useTheme` composable  
- Svelte: `createThemeStore` function

All adapters use the same core runtime underneath.

## Token Parsing

Tokens can be:

- **JSON** - Standard JSON files
- **YAML** - YAML format support
- **References** - Use `{color.primary}` syntax

```json
{
  "button": {
    "bg": { "value": "{color.primary}" }
  }
}
```

## Export Formats

TokiForge can export to:

- **CSS** - Custom properties
- **SCSS** - Variables
- **JavaScript** - Objects
- **TypeScript** - Typed objects
- **JSON** - Raw tokens

## Runtime Performance

- **<3KB gzipped** - Minimal bundle size
- **Zero JS overhead** - Uses CSS variables
- **Instant switching** - No re-renders needed
- **SSR safe** - Works with server-side rendering

## Next Steps

- Learn about [Theming](/guide/theming)
- See [Design Tokens Guide](/guide/design-tokens)
- Check [Performance Tips](/guide/performance)


