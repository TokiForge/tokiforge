# CLI Commands

Complete reference for all TokiForge CLI commands.

## init

Initialize TokiForge in your project.

```bash
TokiForge init
```

### What it does

- Creates `tokens.json` with default tokens
- Creates `TokiForge.config.json` with configuration
- Sets up project structure

### Options

None currently. Run from your project directory.

### Example

```bash
mkdir my-project
cd my-project
TokiForge init
```

## build

Build and export tokens to various formats.

```bash
TokiForge build
```

### What it does

- Reads `tokens.json` (or configured input file)
- Validates token structure
- Exports to formats specified in `TokiForge.config.json`
- Outputs to configured directories

### Output Formats

- CSS custom properties
- JavaScript modules
- TypeScript modules
- SCSS variables
- JSON

### Example

```bash
TokiForge build
# Generates files in dist/ directory
```

## dev

Start development server with live theme preview.

```bash
TokiForge dev
```

### What it does

- Starts local server (default: port 3000)
- Displays interactive theme preview
- Watches for token file changes
- Auto-reloads on changes

### Options

None currently. Port is fixed at 3000.

### Example

```bash
TokiForge dev
# Opens http://localhost:3000
```

## lint

Validate token consistency and accessibility.

```bash
TokiForge lint
```

### What it does

- Validates token structure
- Checks for duplicate token names
- Validates color contrast ratios
- Checks for missing references

### Exit Codes

- `0` - All checks passed
- `1` - Errors found

### Example

```bash
TokiForge lint
# ✅ All tokens are valid!
```

## Global Options

All commands support:

- `-V, --version` - Show version
- `-h, --help` - Show help

## Next Steps

- See [Configuration](/cli/configuration) for setup options
- Check [Overview](/cli/overview) for workflow


