# Troubleshooting

Common issues and solutions.

## Installation Issues

### Module Not Found

**Error:** `Cannot find module '@tokiforge/core'`

**Solution:**
```bash
npm install @tokiforge/core
# Or reinstall all
npm install
```

### TypeScript Errors

**Error:** `Could not find a declaration file`

**Solution:**
- Ensure TypeScript 5.0+
- Check `tsconfig.json` includes node_modules
- Restart TypeScript server

## Runtime Issues

### Theme Not Switching

**Problem:** Theme changes but nothing updates

**Solution:**
- Check CSS variables are being used
- Verify `runtime.init()` was called
- Check browser console for errors

### CSS Variables Not Applied

**Problem:** CSS variables don't appear

**Solution:**
```typescript
// Ensure runtime is initialized
runtime.init(':root', 'hf');

// Check selector matches
runtime.applyTheme('dark', '.my-app', 'custom');
```

### SSR Errors

**Problem:** Errors during server-side rendering

**Solution:**
TokiForge handles SSR automatically. If issues persist:

```typescript
if (typeof window !== 'undefined') {
  runtime.init();
}
```

## Token Issues

### Invalid Token Structure

**Error:** `Invalid token value at path`

**Solution:**
- Ensure all tokens have `value` property
- Check value types match (string/number)
- Run `tokiforge lint` to validate

### Reference Not Found

**Error:** `Token reference not found: {color.primary}`

**Solution:**
- Check reference path is correct
- Ensure referenced token exists
- Verify token is defined before reference

### Parse Errors

**Error:** `Unexpected token in JSON`

**Solution:**
- Validate JSON syntax
- Check for trailing commas
- Use `tokiforge lint` to find issues

## Framework-Specific

### React: Hook Errors

**Error:** `useTheme must be used within ThemeProvider`

**Solution:**
```tsx
// Wrap app with ThemeProvider
<ThemeProvider config={config}>
  <App />
</ThemeProvider>
```

### Vue: Composition API

**Error:** `useTheme must be used within provideTheme`

**Solution:**
```vue
<script setup>
provideTheme(config);
const { tokens } = useTheme();
</script>
```

### Svelte: Store Errors

**Error:** Store not reactive

**Solution:**
```svelte
<script>
const themeStore = createThemeStore(config);
// Use $ prefix for reactivity
$themeStore.theme
</script>
```

## CLI Issues

### Command Not Found

**Error:** `TokiForge: command not found`

**Solution:**
```bash
# Install globally
npm install -g tokiforge-cli@^1.1.0

# Or use npx
npx tokiforge-cli@^1.1.0 init
```

### Build Errors

**Error:** Build fails

**Solution:**
- Check `tokiforge.config.json` exists
- Verify token file path is correct
- Run `tokiforge lint` to find issues

## Performance Issues

### Slow Theme Switching

**Problem:** Theme switching is slow

**Solution:**
- Use CSS variables instead of JS tokens
- Check for unnecessary re-renders
- Minimize token file size

### Large Bundle Size

**Problem:** Bundle is too large

**Solution:**
- Tree-shake unused exports
- Use framework adapter only
- Don't import entire core if not needed

## Still Having Issues?

1. Check [GitHub Issues](https://github.com/TokiForge/tokiforge/issues)
2. Review [Examples](/examples/react)
3. See [API Reference](/api/core)


