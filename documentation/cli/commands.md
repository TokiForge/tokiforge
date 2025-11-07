# CLI Commands

Complete reference for all TokiForge CLI commands.

## init

Initialize TokiForge in your project.

```bash
tokiforge init
```

### What it does

- Creates `tokens.json` with default tokens
- Creates `tokiforge.config.json` with configuration
- Sets up project structure

### Options

None currently. Run from your project directory.

### Example

```bash
mkdir my-project
cd my-project
tokiforge init
```

## build

Build and export tokens to various formats.

```bash
tokiforge build
```

### What it does

- Reads `tokens.json` (or configured input file)
- Validates token structure
- Exports to formats specified in `tokiforge.config.json`
- Outputs to configured directories

### Output Formats

- CSS custom properties
- JavaScript modules
- TypeScript modules
- SCSS variables
- JSON

### Example

```bash
tokiforge build
# Generates files in dist/ directory
```

## dev

Start development server with live theme preview.

```bash
tokiforge dev
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
tokiforge dev
# Opens http://localhost:3000
```

## lint

Validate token consistency and accessibility.

```bash
tokiforge lint
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
tokiforge lint
# ✅ All tokens are valid!
```

## validate

Validate tokens for CI/CD pipelines with comprehensive checks.

```bash
tokiforge validate [options]
```

### What it does

- Validates token syntax and structure
- Checks token references
- Validates token format
- Checks for deprecated tokens
- Validates accessibility compliance (WCAG AA/AAA)
- Compares with Figma tokens (optional)

### Options

- `--strict` - Treat warnings as errors
- `--no-accessibility` - Skip accessibility checks
- `--no-deprecated` - Skip deprecation checks
- `--figma` - Check against Figma tokens
- `--figma-token <token>` - Figma access token
- `--figma-file-key <key>` - Figma file key
- `--min-accessibility <level>` - Minimum accessibility level (AA or AAA, default: AA)

### Exit Codes

- `0` - All checks passed
- `1` - Validation failed

### Example

```bash
# Basic validation
tokiforge validate

# Strict validation with Figma sync check
tokiforge validate --strict --figma --figma-token TOKEN --figma-file-key KEY
```

## figma:diff

Compare Figma tokens with code tokens.

```bash
tokiforge figma:diff --token <token> --file-key <key>
```

### What it does

- Pulls tokens from Figma
- Compares with local token file
- Generates detailed diff report
- Exports diff as JSON

### Required Options

- `--token <token>` - Figma personal access token
- `--file-key <key>` - Figma file key

### Exit Codes

- `0` - No mismatches found
- `1` - Mismatches detected

### Example

```bash
tokiforge figma:diff --token YOUR_TOKEN --file-key FILE_KEY
```

## analytics

Generate token usage analytics and bundle impact report.

```bash
tokiforge analytics
```

### What it does

- Analyzes token usage
- Calculates bundle impact
- Identifies unused tokens
- Generates coverage reports
- Estimates token sizes

### Output

- Console report with usage statistics
- JSON file: `token-analytics.json`

### Example

```bash
tokiforge analytics
# 📊 Generating token analytics...
# ✅ Analytics saved to: token-analytics.json
```

## Global Options

All commands support:

- `-V, --version` - Show version
- `-h, --help` - Show help

## Next Steps

- See [Configuration](/cli/configuration) for setup options
- Check [Overview](/cli/overview) for workflow


