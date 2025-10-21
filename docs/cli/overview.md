# CLI Overview

The TokiForge CLI is a powerful command-line tool for managing design tokens.

## Installation

### Global Installation

```bash
npm install -g TokiForge-cli
```

### Local Usage

```bash
npx TokiForge-cli <command>
```

## Commands

### `init`

Initialize TokiForge in your project.

```bash
TokiForge init
```

Creates:
- `tokens.json` - Default token definitions
- `TokiForge.config.json` - Configuration file

### `build`

Build and export tokens to various formats.

```bash
TokiForge build
```

Generates files based on your `TokiForge.config.json`:
- CSS custom properties
- JavaScript/TypeScript exports
- SCSS variables
- JSON output

### `dev`

Start development server with live theme preview.

```bash
TokiForge dev
```

Opens a preview server at `http://localhost:3000` where you can:
- See all your themes
- Switch between themes
- Preview color tokens
- Live reload on token changes

### `lint`

Validate token consistency and accessibility.

```bash
TokiForge lint
```

Checks:
- Token structure validity
- Color contrast ratios
- Duplicate token names
- Missing references

## Configuration

Edit `TokiForge.config.json` to customize:

```json
{
  "input": "./tokens.json",
  "output": {
    "css": "./dist/tokens.css",
    "js": "./dist/tokens.js",
    "ts": "./dist/tokens.ts",
    "scss": "./dist/tokens.scss"
  },
  "themes": [
    {
      "name": "light",
      "tokens": {}
    }
  ],
  "defaultTheme": "light",
  "prefix": "hf",
  "selector": ":root"
}
```

## Workflow

1. **Initialize** - `TokiForge init`
2. **Edit tokens** - Modify `tokens.json`
3. **Preview** - `TokiForge dev`
4. **Build** - `TokiForge build`
5. **Lint** - `TokiForge lint`

## Next Steps

- See [Commands](/cli/commands) for detailed command documentation
- Learn about [Configuration](/cli/configuration) options


