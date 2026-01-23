# Generate Changelog Command

The `tokiforge generate:changelog` command generates comprehensive token changelogs from a directory of versioned token files. It automatically detects breaking changes, categorizes modifications, and produces formatted output in multiple formats.

## Basic Usage

```bash
tokiforge generate:changelog [input] [options]
```

### Examples

```bash
# Generate markdown changelog from tokens directory
tokiforge generate:changelog tokens

# Generate JSON changelog
tokiforge generate:changelog tokens --format json

# Generate HTML changelog for web viewing
tokiforge generate:changelog tokens --format html

# Save changelog to file
tokiforge generate:changelog tokens --output CHANGELOG.md

# With all options
tokiforge generate:changelog tokens \
  --format markdown \
  --output CHANGELOG.md
```

## Options

### `--format <type>`

Output format for the changelog.

**Values:**
- `markdown` - Markdown format (default, recommended for documentation)
- `json` - Structured JSON format (useful for automation)
- `html` - HTML format (for web viewing)

**Default:** `markdown`

**Example:**
```bash
tokiforge generate:changelog tokens --format json --output changelog.json
```

### `--output <file>`

Write the changelog to a file. If not specified, outputs to stdout.

**Extensions:**
- `.md` - Markdown format
- `.json` - JSON format
- `.html` - HTML format

**Example:**
```bash
tokiforge generate:changelog tokens --output CHANGELOG.md
```

## Directory Structure

The command expects versioned token files with one of these naming patterns:

```
tokens/
├── tokens-v1.0.0.json     # v1.0.0
├── tokens-v1.1.0.json     # v1.1.0
├── tokens-v1.2.0.json     # v1.2.0
├── tokens-v2.0.0.json     # v2.0.0
└── tokens.json            # Latest/current version (optional)
```

Or without 'v' prefix:

```
tokens/
├── tokens-1.0.0.json
├── tokens-1.1.0.json
├── tokens-1.2.0.json
└── tokens-2.0.0.json
```

### Version File Format

Each version file should be a JSON file containing:

```json
{
  "version": "v1.1.0",
  "date": "2024-01-15",
  "color": {
    "primary": "#007bff",
    "secondary": "#6c757d"
  },
  "spacing": {
    "xs": "4px",
    "sm": "8px",
    "md": "16px"
  }
}
```

Or simply the tokens without metadata (version/date extracted from filename):

```json
{
  "color": {
    "primary": "#007bff",
    "secondary": "#6c757d"
  }
}
```

## Output Examples

### Markdown Format (Default)

```markdown
# Token Changelog

## v1.1.0 - 2024-01-15

### 🚨 Breaking Changes
- Removed token: color.deprecated
- Significant value change in spacing.lg: 32px → 48px

### ✨ Added
- `color.brand.primary`
- `color.brand.secondary`
- `typography.display`

### 🗑️ Removed
- `color.deprecated`
- `color.legacy.primary`

### 📝 Changed
- `color.primary`
- `spacing.lg`
- `typography.body.font-size`

### ⚠️ Deprecated
- (none)

**Statistics**: +3 ~2 -2

---

## v1.0.0 - 2024-01-01

### ✨ Added
- `color.primary`
- `color.secondary`
- `spacing.xs`
- `spacing.sm`

**Statistics**: +4 ~0 -0
```

### JSON Format

```json
[
  {
    "version": "v1.1.0",
    "date": "2024-01-15",
    "changes": {
      "breaking": [
        "Removed token: color.deprecated",
        "Significant value change in spacing.lg: 32px → 48px"
      ],
      "added": [
        "color.brand.primary",
        "color.brand.secondary",
        "typography.display"
      ],
      "removed": [
        "color.deprecated",
        "color.legacy.primary"
      ],
      "changed": [
        "color.primary",
        "spacing.lg",
        "typography.body.font-size"
      ],
      "deprecated": []
    },
    "stats": {
      "additions": 3,
      "removals": 2,
      "modifications": 2,
      "breakingChanges": 2
    }
  },
  {
    "version": "v1.0.0",
    "date": "2024-01-01",
    "changes": {
      "breaking": [],
      "added": ["color.primary", "color.secondary", "spacing.xs", "spacing.sm"],
      "removed": [],
      "changed": [],
      "deprecated": []
    },
    "stats": {
      "additions": 4,
      "removals": 0,
      "modifications": 0,
      "breakingChanges": 0
    }
  }
]
```

### HTML Format

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Token Changelog</title>
  <style>
    body { font-family: sans-serif; max-width: 900px; margin: 0 auto; }
    .breaking { background: #fff3cd; padding: 10px; border-left: 4px solid #ffc107; }
    .added { background: #d4edda; padding: 10px; border-left: 4px solid #28a745; }
    .removed { background: #f8d7da; padding: 10px; border-left: 4px solid #dc3545; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
  </style>
</head>
<body>
  <h1>📋 Token Changelog</h1>
  <h2>v1.1.0 - 2024-01-15</h2>
  <!-- Full formatted HTML changelog -->
</body>
</html>
```

## Change Categories

### Breaking Changes 🚨

Changes that may require updates to dependent code:

- Removed tokens
- Significant value changes (>20% for numeric values)
- Type changes
- Restructured token hierarchies

### Added ✨

New tokens introduced in this version.

### Removed 🗑️

Tokens that were deleted in this version.

### Changed 📝

Existing tokens that were modified (values, properties, etc).

### Deprecated ⚠️

Tokens marked as deprecated but still functional.

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Generate Changelog

on:
  push:
    branches: [main]
    paths: ['tokens/**']

jobs:
  changelog:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: npm ci
      
      - name: Generate changelog
        run: |
          tokiforge generate:changelog tokens \
            --format markdown \
            --output CHANGELOG.md
      
      - name: Commit changes
        run: |
          git config user.name "TokiForge Bot"
          git config user.email "bot@example.com"
          git add CHANGELOG.md
          git commit -m "docs: update token changelog" || true
          git push
```

### GitLab CI Example

```yaml
generate_changelog:
  stage: build
  script:
    - npm ci
    - tokiforge generate:changelog tokens --output CHANGELOG.md
  artifacts:
    paths:
      - CHANGELOG.md
  only:
    - main
```

## Version Detection

The command automatically detects version numbers from filenames:

| Filename Pattern | Version Extracted |
|---|---|
| `tokens-v1.0.0.json` | `v1.0.0` |
| `tokens-1.0.0.json` | `v1.0.0` |
| `tokens-1.0.0.json` | `v1.0.0` |
| `tokens-v1.0.0-beta.json` | `v1.0.0` |

Files are sorted using semantic versioning rules.

## Changelog Structure

Each changelog entry contains:

- **Version**: Semantic version identifier
- **Date**: ISO 8601 date string (extracted from file metadata or filename)
- **Changes**: Categorized changes (breaking, added, removed, changed, deprecated)
- **Statistics**: Counts of each change type

## Exit Codes

- `0` - Changelog generated successfully
- `1` - Error occurred (invalid directory, no versions found, etc.)

## Best Practices

1. **Version Naming**: Use semantic versioning (v1.0.0, v1.1.0, v2.0.0)
2. **Archive Versions**: Keep old token files in a `tokens/` directory for history
3. **Metadata**: Include `version` and `date` fields in token files for accuracy
4. **Breaking Changes**: Document breaking changes clearly in release notes
5. **Automation**: Generate changelogs automatically on version releases
6. **Review**: Always review generated changelogs before publishing

## See Also

- [diff](#) - Compare two token files
- [migrate](#) - Migrate tokens from other formats
- [validate](#) - Validate token syntax and accessibility
