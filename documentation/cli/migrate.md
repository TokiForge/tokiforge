---
title: Migrate Command | CLI Commands
description: Migrate design tokens from other design systems and token formats to TokiForge.
---

# Migrate Command

Migrate design tokens from other design systems and token formats to TokiForge.

```bash
tokiforge migrate --from <source> --input <path>
```

## Supported Sources

- `style-dictionary` - Style Dictionary exports
- `figma-tokens` - Figma Tokens plugin format
- `theo` - Salesforce Theo format
- `css-variables` - CSS custom properties
- `tailwind` - Tailwind config files
- `storybook` - Storybook design tokens

## What it does

- Reads tokens from source format
- Transforms to TokiForge structure
- Maps token names and values
- Preserves metadata and descriptions
- Generates validation report
- Creates backup of original

## Options

- `--from <source>` - Source format (required)
- `--input <path>` - Input file/directory (required)
- `--output <path>` - Output path (default: `tokens-migrated.json`)
- `--config <path>` - Migration config file
- `--backup` - Create backup of original (default: true)
- `--verbose` - Show detailed migration steps
- `--validate` - Validate after migration

## Examples

### Migrate from Style Dictionary

```bash
tokiforge migrate --from style-dictionary --input design-tokens/
# Reads: design-tokens/index.js
# Outputs: tokens-migrated.json
```

### Migrate from Figma Tokens Plugin

```bash
tokiforge migrate --from figma-tokens --input $tokens.json --verbose
# Shows mapping process
# Outputs: tokens-migrated.json
```

### Migrate from CSS Variables

```bash
tokiforge migrate --from css-variables --input src/styles/variables.css
# Extracts: --color-primary, --spacing-sm, etc.
# Outputs: tokens-migrated.json
```

### Migrate from Tailwind

```bash
tokiforge migrate --from tailwind --input tailwind.config.js
# Reads Tailwind theme config
# Outputs: tokens-migrated.json
```

## Migration Mappings

### Style Dictionary → TokiForge

```javascript
// Input: style-dictionary/tokens.json
{
  "color": {
    "primary": {
      "value": "#007AFF",
      "type": "color"
    }
  }
}

// Output: tokens-migrated.json
{
  "themes": [{
    "name": "default",
    "tokens": {
      "color": {
        "primary": {
          "value": "#007AFF",
          "type": "color"
        }
      }
    }
  }]
}
```

### CSS Variables → TokiForge

```css
/* Input: variables.css */
:root {
  --color-primary: #007aff;
  --color-secondary: #5ac8fa;
  --spacing-sm: 8px;
}
```

```json
// Output: tokens-migrated.json
{
  "themes": [
    {
      "name": "default",
      "tokens": {
        "color": {
          "primary": { "value": "#007AFF", "type": "color" },
          "secondary": { "value": "#5AC8FA", "type": "color" }
        },
        "spacing": {
          "sm": { "value": "8px", "type": "spacing" }
        }
      }
    }
  ]
}
```

### Tailwind → TokiForge

```javascript
// Input: tailwind.config.js
module.exports = {
  theme: {
    colors: {
      primary: '#007AFF',
      secondary: '#5AC8FA'
    },
    spacing: {
      sm: '8px',
      md: '16px'
    }
  }
}

// Output: tokens-migrated.json
{
  "themes": [{
    "name": "default",
    "tokens": {
      "color": {
        "primary": { "value": "#007AFF" },
        "secondary": { "value": "#5AC8FA" }
      },
      "spacing": {
        "sm": { "value": "8px" },
        "md": { "value": "16px" }
      }
    }
  }]
}
```

## Migration Config

Create `tokiforge.migrate.json` for custom mappings:

```json
{
  "from": "style-dictionary",
  "input": "design-tokens/",
  "output": "tokens-migrated.json",
  "mappings": {
    "color.primary": "colors.main",
    "color.secondary": "colors.accent"
  },
  "excludeGroups": ["deprecated"],
  "transformValues": {
    "remToPx": true,
    "colorFormat": "hex"
  }
}
```

### Use Config File

```bash
tokiforge migrate --config tokiforge.migrate.json
```

## Migration Report

After migration, a report is generated:

```
✅ Migration Complete

Source: style-dictionary
Format: Tokens JSON (2.0)
Tokens Migrated: 147

📊 Summary:
  - Colors: 32
  - Spacing: 24
  - Typography: 18
  - Sizing: 16
  - Shadows: 12
  - Borders: 15
  - Animations: 30

⚠️  Items Requiring Review:
  - 5 tokens with complex references
  - 2 custom token types not recognized

✅ Output: tokens-migrated.json
📦 Backup: tokens-original.json
```

## Post-Migration Steps

### 1. Review Migrated Tokens

```bash
cat tokens-migrated.json | jq '.themes[0].tokens' | head -50
```

### 2. Validate Structure

```bash
tokiforge validate
```

### 3. Verify Exports

```bash
tokiforge build
ls -la dist/
```

### 4. Update Code

```bash
# Replace old imports
# FROM:
// import { colors } from './style-dictionary-output'

# TO:
import { colors } from './tokens'
```

### 5. Run Tests

```bash
npm test
```

## Handling Edge Cases

### Complex Token References

Some token formats support references:

```javascript
// Before
{
  "color": {
    "primary": "#007AFF",
    "primaryDark": "{color.primary} adjusted"
  }
}

// After - review for manual updates
{
  "color": {
    "primary": { "value": "#007AFF" },
    "primaryDark": { "value": "TODO: Reference not auto-convertible" }
  }
}
```

### Custom Token Types

```bash
# Show all custom types found
tokiforge migrate --from style-dictionary --input design-tokens/ --verbose

# Review and manually map if needed
```

## Troubleshooting

### Source file not found

```bash
tokiforge migrate --from style-dictionary --input design-tokens/tokens.json
```

### Token values not recognized

```bash
# Validate source format first
tokiforge validate --source style-dictionary --input design-tokens/

# Review migration report for warnings
```

### Partial migration

```bash
# Use verbose flag to debug
tokiforge migrate --from style-dictionary --input design-tokens/ --verbose
```

## Related Commands

- [`tokiforge validate`](/cli/commands#validate) - Validate token structure
- [`tokiforge build`](/cli/commands#build) - Build exports after migration
- [`tokiforge generate:types`](/cli/generate-types) - Generate types for migrated tokens

## Next Steps

- See [Migration Guides](/migration/) for framework-specific migrations
- Check [Token Format](/guide/design-tokens) for token structure details
- Use [`tokiforge build`](/cli/commands#build) to generate exports
