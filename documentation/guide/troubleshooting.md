---
title: Troubleshooting | TokiForge
description: Common issues and solutions for TokiForge. Fix installation problems, theme switching issues, and token parsing errors.
---

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

## Build Issues

### Browser Build Errors

**Error:** `createRequire is not available in browser environment`  
**Error:** `Could not resolve "module"`  
**Error:** `Could not resolve "zlib"`

**Solution:**

TokiForge v1.2.0 includes browser-compatible stubs for Node.js modules. If you encounter these errors:

1. **For Vite projects (React, Vue, Svelte):**
   - Ensure `vite.config.ts` includes aliases for Node.js modules:
   ```typescript
   resolve: {
     alias: {
       'module': resolve(__dirname, 'src/stubs/module.ts'),
       'zlib': resolve(__dirname, 'src/stubs/zlib.ts'),
       'util': resolve(__dirname, 'src/stubs/util.ts'),
       'yaml': resolve(__dirname, 'src/stubs/yaml.ts'),
       'fs': resolve(__dirname, 'src/stubs/fs.ts'),
       'path': resolve(__dirname, 'src/stubs/path.ts'),
     },
   },
   ```
   - Create stub files in `src/stubs/` (see example projects for reference)

2. **For Angular projects:**
   - Add path mappings in `tsconfig.json` and `tsconfig.app.json`:
   ```json
   "paths": {
     "module": ["./src/stubs/module.ts"],
     "zlib": ["./src/stubs/zlib.ts"],
     "util": ["./src/stubs/util.ts"],
     "yaml": ["./src/stubs/yaml.ts"],
     "fs": ["./src/stubs/fs.ts"],
     "path": ["./src/stubs/path.ts"]
   }
   ```
   - Add to `allowedCommonJsDependencies` in `angular.json`:
   ```json
   "allowedCommonJsDependencies": [
     "@tokiforge/core",
     "@tokiforge/angular",
     "util",
     "inherits",
     "is-arguments",
     "is-generator-function",
     "which-typed-array",
     "is-typed-array"
   ]
   ```

3. **Reference implementations:**
   - See `examples/react-example/src/stubs/` for Vite stub examples
   - See `examples/angular-example/src/stubs/` for Angular stub examples

### TypeScript Build Errors

**Error:** `Property 'then' does not exist on type 'void'`  
**Error:** `Property 'catch' does not exist on type 'void'`

**Solution:**

In TokiForge v1.2.0, `ThemeRuntime.init()` and `ThemeRuntime.applyTheme()` are synchronous methods. Remove `.then()` and `.catch()` calls:

```typescript
// ❌ Incorrect (v1.1.x style)
runtime.init(selector, prefix).then(() => {
  // ...
});

// ✅ Correct (v1.2.0)
runtime.init(selector, prefix);
// or with error handling
try {
  runtime.init(selector, prefix);
} catch (err) {
  console.error('Failed to initialize:', err);
}
```

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

### Vue: Package Resolution Error

**Error:** `Failed to resolve entry for package "@tokiforge/vue". The package may have incorrect main/module/exports specified in its package.json`

**Solution:**
This issue was fixed in v1.2.0. If you're experiencing this:

1. Ensure you're using the latest version:
   ```bash
   npm install @tokiforge/vue@^1.2.0
   ```

2. Clear your node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. Clear npm cache if the issue persists:
   ```bash
   npm cache clean --force
   npm install @tokiforge/vue@^1.2.0
   ```

**Note:** This was caused by incorrect package.json exports that didn't match the actual build output. The fix aligns exports with the built files (`index.cjs` for CommonJS, `index.js` for ESM).

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
npm install -g tokiforge-cli@^1.2.0

# Or use npx
npx tokiforge-cli@^1.2.0 init
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


