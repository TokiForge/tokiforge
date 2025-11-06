# CLI Configuration

Configure TokiForge CLI behavior via `tokiforge.config.json`.

## Configuration File

Create `tokiforge.config.json` in your project root (or use `tokiforge init`).

## Options

### `input`

Path to your token file.

```json
{
  "input": "./tokens.json"
}
```

### `output`

Output paths for different formats.

```json
{
  "output": {
    "css": "./dist/tokens.css",
    "js": "./dist/tokens.js",
    "ts": "./dist/tokens.ts",
    "scss": "./dist/tokens.scss",
    "json": "./dist/tokens.json"
  }
}
```

All formats are optional. Only include what you need.

### `themes`

Array of theme definitions.

```json
{
  "themes": [
    {
      "name": "light",
      "tokens": { /* tokens */ }
    },
    {
      "name": "dark",
      "tokens": { /* tokens */ }
    }
  ]
}
```

### `defaultTheme`

Default theme name.

```json
{
  "defaultTheme": "light"
}
```

### `prefix`

CSS variable prefix.

```json
{
  "prefix": "hf"
}
```

Results in: `--hf-color-primary`

### `selector`

CSS selector for theme injection.

```json
{
  "selector": ":root"
}
```

## Complete Example

```json
{
  "input": "./tokens.json",
  "output": {
    "css": "./dist/tokens.css",
    "js": "./dist/tokens.js",
    "ts": "./dist/tokens.ts"
  },
  "themes": [
    {
      "name": "light",
      "tokens": {
        "color": {
          "primary": { "value": "#7C3AED", "type": "color" }
        }
      }
    },
    {
      "name": "dark",
      "tokens": {
        "color": {
          "primary": { "value": "#8B5CF6", "type": "color" }
        }
      }
    }
  ],
  "defaultTheme": "light",
  "prefix": "hf",
  "selector": ":root"
}
```

## Environment Variables

Currently, no environment variables are supported. All configuration is via `tokiforge.config.json`.

## Next Steps

- See [Commands](/cli/commands) for command reference
- Check [Overview](/cli/overview) for workflow


