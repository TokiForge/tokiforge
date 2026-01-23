---
title: Watch Command | CLI Commands
description: Watch for design token changes and automatically rebuild exports in development.
---

# Watch Command

Watch for design token file changes and automatically rebuild exports in development.

```bash
tokiforge watch
```

## What it does

- Monitors `tokens.json` for changes
- Automatically rebuilds exports on save
- Displays change summaries
- Supports hot reloading in dev servers
- Works with CSS-in-JS and static CSS

## Options

- `--input <path>` - Input token file (default: `tokens.json`)
- `--output <path>` - Output directory (default: `dist/`)
- `--poll <interval>` - Poll interval in ms (default: `100`)
- `--verbose` - Show detailed change logs

## Examples

### Basic Watch

```bash
tokiforge watch
# Watching tokens.json for changes...
```

### Watch with Custom Input

```bash
tokiforge watch --input src/design-tokens.json
```

### Verbose Output

```bash
tokiforge watch --verbose
# [10:32:15] Watching tokens.json
# [10:32:22] Changed: colors.primary
# [10:32:22] Rebuilding exports...
# [10:32:23] ✅ Build complete
```

## Development Workflow

### With Next.js/React

```json
{
  "scripts": {
    "dev": "concurrently \"tokiforge watch\" \"next dev\"",
    "build": "tokiforge build && next build"
  }
}
```

### With Vite

```json
{
  "scripts": {
    "dev": "tokiforge watch & vite",
    "build": "tokiforge build && vite build"
  }
}
```

### With Webpack

```json
{
  "scripts": {
    "dev": "tokiforge watch --poll 200 & webpack serve",
    "build": "tokiforge build && webpack"
  }
}
```

## What Gets Rebuilt

When tokens change:

✅ CSS variables  
✅ JavaScript modules  
✅ TypeScript types  
✅ SCSS variables  
✅ JSON exports

## Real-Time Updates in Browser

Watch integrates with your dev server's hot reload:

```typescript
// tokens.ts is auto-updated
import { tokens } from "./dist/tokens.js";

// Changes reflect immediately in browser
console.log(tokens.colors.primary); // Updated value
```

## Performance Tips

### Reduce Poll Interval

For faster file watching on SSDs:

```bash
tokiforge watch --poll 50
```

### Ignore Large Files

Configure in `tokiforge.config.json`:

```json
{
  "watch": {
    "ignore": ["node_modules/**", "dist/**"],
    "poll": 100
  }
}
```

## Combining with Other Commands

### Watch + Lint

```bash
tokiforge watch --verbose && tokiforge lint
```

### Watch + TypeScript Check

```bash
# Terminal 1
tokiforge watch

# Terminal 2
tsc --watch --noEmit
```

## Integration with Design Systems

### Team Workflow

1. Designer updates tokens in code repo
2. `tokiforge watch` detects changes
3. Types auto-generate
4. Tests run
5. Component library updates
6. Live preview reflects changes

### CI/CD Connection

When pushing changes:

```yaml
- name: Build token exports
  run: tokiforge build

- name: Verify no uncommitted changes
  run: git diff --exit-code
```

## Troubleshooting

### Changes not detected

```bash
# Increase poll interval
tokiforge watch --poll 500
```

### Too many rebuilds

```bash
# Debounce is automatic, but you can adjust timing
tokiforge watch --poll 200
```

### File lock issues on Windows

```bash
# Try increasing poll interval
tokiforge watch --poll 1000
```

## Related Commands

- [`tokiforge build`](/cli/commands#build) - One-time build
- [`tokiforge dev`](/cli/commands#dev) - Development server with preview
- [`tokiforge validate`](/cli/commands#validate) - Validate tokens

## Next Steps

- Use `tokiforge build` for production builds
- Combine with CI/CD for automated exports
- See [Configuration](/cli/configuration) for advanced options
