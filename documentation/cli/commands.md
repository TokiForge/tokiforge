---
title: CLI Commands | TokiForge
description: Complete reference for all TokiForge CLI commands. Initialize, build, validate, analyze, and manage design tokens from the command line.
---

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

## generate:types

Generate TypeScript type definitions for tokens.

```bash
tokiforge generate:types [input] [output]
```

### What it does

- Reads tokens from input file
- Generates TypeScript declarations
- Creates token path constants
- Generates type-safe resolver function

### Arguments

- `input` - Input tokens file (default: `tokens.json`)
- `output` - Output TypeScript file (default: `tokens.d.ts`)

### Output

- `.d.ts` file with complete type definitions
- Token path exports for autocomplete
- TypeScript utility functions

### Example

```bash
# Generate types from tokens.json
tokiforge generate:types

# Custom paths
tokiforge generate:types ./design/tokens.json ./src/tokens.d.ts
```

Generated file:

```typescript
export const tokens = { /* ... */ };
export type TokenPath = 'colors.primary' | 'colors.secondary' | ...;
export function resolveToken(path: TokenPath): any;
```

## watch

Watch token files for changes and regenerate exports.

```bash
tokiforge watch [input] [output] [options]
```

### What it does

- Monitors token files for changes
- Auto-regenerates exports on change
- Supports debouncing
- Generates TypeScript, JSON, CSS, SCSS

### Arguments

- `input` - Input tokens file (default: `tokens.json`)
- `output` - Output directory (default: `tokens.generated`)

### Options

- `--debounce <ms>` - Debounce time in milliseconds (default: 300)

### Example

```bash
# Watch and generate
tokiforge watch

# Custom paths with faster debounce
tokiforge watch ./tokens.json ./dist --debounce 100
```

Output:

```
👀 Watching tokens.json for changes...
💾 Output directory: tokens.generated
✅ [12:34:56] Tokens updated
✅ [12:35:01] Tokens updated
```

## migrate

Migrate tokens from another format.

```bash
tokiforge migrate [input] [options]
```

### What it does

- Converts tokens from Style Dictionary, Figma Tokens, or Theo format
- Normalizes token structure
- Validates migration
- Creates backup automatically

### Arguments

- `input` - Input tokens file (default: `tokens.json`)

### Options

- `--from <format>` - Source format: `style-dictionary`, `figma-tokens`, `theo` (default: `style-dictionary`)
- `--to <file>` - Output file (defaults to input file)
- `--no-backup` - Skip creating backup

### Supported Formats

**From Style Dictionary:**

```json
{
  "color": {
    "primary": { "value": "#007AFF", "type": "color" }
  }
}
```

**From Figma Tokens:**

```json
{
  "colors": {
    "primary": { "value": "#007AFF", "type": "color" }
  }
}
```

**From Theo:**

```json
{
  "global": {
    "color": {
      "primary": { "value": "#007AFF", "type": "color" }
    }
  }
}
```

### Example

```bash
# Migrate from Style Dictionary
tokiforge migrate tokens.json --from style-dictionary

# Migrate from Figma Tokens to new file
tokiforge migrate figma-tokens.json --from figma-tokens --to tokens.json

# Migrate without backup
tokiforge migrate design-tokens.json --from theo --no-backup
```

## diff

Compare two token files with visual diff, change summary, and migration suggestions.

```bash
tokiforge diff <old-file> <new-file> [options]
```

### What it does

- Compares token files
- Shows detailed differences
- Generates migration suggestions
- Detects breaking changes
- Exports reports in multiple formats

### Options

- `--format <type>` - Output format: `compact`, `detailed`, `json` (default: `detailed`)
- `--no-migrations` - Skip migration suggestions
- `--strict` - Fail on breaking changes
- `--output <file>` - Write report to file

### Exit Codes

- `0` - No changes or non-breaking changes
- `1` - Breaking changes detected (in strict mode)

### Example

```bash
# Basic comparison
tokiforge diff old-tokens.json new-tokens.json

# Compact output
tokiforge diff old-tokens.json new-tokens.json --format compact

# With migration suggestions and output file
tokiforge diff old-tokens.json new-tokens.json --output diff-report.md

# Strict mode (fail on breaking changes)
tokiforge diff old-tokens.json new-tokens.json --strict
```

### See Also

For complete documentation, see [diff command](/cli/diff)

## generate:changelog

Generate token changelogs from versioned token files.

```bash
tokiforge generate:changelog [input] [options]
```

### What it does

- Scans directory for versioned token files
- Compares versions sequentially
- Detects breaking changes
- Categorizes modifications
- Generates formatted changelogs

### Options

- `--format <type>` - Output format: `markdown`, `json`, `html` (default: `markdown`)
- `--output <file>` - Write changelog to file

### Supported Version Formats

- `tokens-v1.0.0.json`
- `tokens-1.0.0.json`
- `tokens-v1.1.0.json`

### Exit Codes

- `0` - Changelog generated successfully
- `1` - Error occurred

### Example

```bash
# Generate markdown changelog
tokiforge generate:changelog tokens

# Generate JSON format
tokiforge generate:changelog tokens --format json

# Save to file
tokiforge generate:changelog tokens --output CHANGELOG.md

# Generate HTML for web viewing
tokiforge generate:changelog tokens --format html --output CHANGELOG.html
```

### See Also

For complete documentation, see [generate:changelog command](/cli/changelog)

## Global Options

All commands support:

- `-V, --version` - Show version
- `-h, --help` - Show help

## Next Steps

- See [Configuration](/cli/configuration) for setup options
- Check [Overview](/cli/overview) for workflow
