# Diff Command

The `tokiforge diff` command compares two token files and displays detailed information about changes, including visual diff output, change summaries, and intelligent migration suggestions.

## Basic Usage

```bash
tokiforge diff <old-file> <new-file> [options]
```

### Examples

```bash
# Basic comparison
tokiforge diff tokens.old.json tokens.new.json

# Compact output format
tokiforge diff tokens.old.json tokens.new.json --format compact

# With migration suggestions (default)
tokiforge diff tokens.old.json tokens.new.json --format detailed

# Generate JSON report
tokiforge diff tokens.old.json tokens.new.json --format json

# Output to file
tokiforge diff tokens.old.json tokens.new.json --output diff-report.md

# Strict mode (fail on breaking changes)
tokiforge diff tokens.old.json tokens.new.json --strict

# Skip migration suggestions
tokiforge diff tokens.old.json tokens.new.json --no-migrations
```

## Options

### `--format <type>`

Output format for the diff report.

**Values:**

- `compact` - Brief summary view (default: abbreviated)
- `detailed` - Full report with complete change details
- `json` - Structured JSON output

**Default:** `detailed`

**Example:**

```bash
tokiforge diff old.json new.json --format compact
```

### `--no-migrations`

Skip generation of migration suggestions. Useful for CI/CD pipelines where you only want to see what changed.

**Default:** Migrations are shown (enabled)

**Example:**

```bash
tokiforge diff old.json new.json --no-migrations
```

### `--strict`

Fail with exit code 1 if breaking changes are detected. Useful for CI/CD pipelines to prevent deployments with breaking changes.

**Default:** Disabled (warnings only)

**Example:**

```bash
tokiforge diff old.json new.json --strict
```

### `--output <file>`

Write the diff report to a file instead of stdout.

**Formats:**

- `.md` - Markdown format (recommended)
- `.json` - JSON format
- `.html` - HTML format

**Example:**

```bash
tokiforge diff old.json new.json --output CHANGELOG.md
tokiforge diff old.json new.json --format json --output diff.json
```

## Output Examples

### Compact Output

```
📊 Token Diff Summary:
  ➕ Added: 5
  ➖ Removed: 2
  ✏️  Changed: 3
  ⚠️  Breaking Changes: 2
```

### Detailed Output

```
============================================================
  📊 Token Diff Report
============================================================

✨ Added Tokens (5):
   ✅ color.brand.primary
   ✅ color.brand.secondary
   ✅ spacing.2xl
   ✅ typography.display
   ✅ shadow.lg

🗑️  Removed Tokens (2):
   ❌ color.deprecated.old
   ❌ spacing.legacy

📝 Changed Tokens (3):
   🔄 color.primary
      #007bff → #0056b3
   🔄 spacing.md
      16px → 1rem
   🔄 typography.body

────────────────────────────────────────────────────────────
Summary:
  Total Changes: 10
  Breaking Changes: 2
============================================================
```

### Migration Suggestions

```
🔄 Migration Suggestions (3):
────────────────────────────────────────────────────────────

1. ↪️ RENAMED
   Path: color.primary → color.brand.primary
   Reason: Token appears to be renamed from color.primary to color.brand.primary
   Action: Update references: color.primary → color.brand.primary

2. 🔀 REPLACED
   Path: spacing.legacy → spacing.md
   Reason: Token structure reorganized
   Action: Replace: spacing.legacy → spacing.md

3. ⚠️ DEPRECATED
   Path: color.old
   Reason: Token exists but newer version available
   Action: Consider using the new token structure

────────────────────────────────────────────────────────────
```

### Breaking Changes

```
⚠️  Breaking Changes Detected (2):

  • Removed token: color.deprecated.old
  • Removed token: spacing.legacy
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Token Validation

on: [pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Compare tokens
        run: |
          tokiforge diff \
            tokens.json \
            src/tokens/latest.json \
            --format detailed \
            --output diff-report.md

      - name: Check for breaking changes
        run: |
          tokiforge diff \
            tokens.json \
            src/tokens/latest.json \
            --strict
```

### Pre-commit Hook Example

```bash
#!/bin/bash
# .git/hooks/pre-commit

if git diff --cached --name-only | grep -q "tokens.json"; then
  echo "🔍 Checking token changes..."

  # Get the old version from git
  git show HEAD:tokens.json > /tmp/old-tokens.json 2>/dev/null

  if [ -f /tmp/old-tokens.json ]; then
    if ! tokiforge diff /tmp/old-tokens.json tokens.json --no-migrations; then
      echo "❌ Token validation failed"
      rm /tmp/old-tokens.json
      exit 1
    fi
    rm /tmp/old-tokens.json
  fi
fi
```

## Output Formats

### Markdown Format (Default)

Recommended for documentation and reports:

```markdown
# Token Diff Report

Generated: 2024-01-23T10:30:00Z

## Summary

- Added: 5
- Removed: 2
- Changed: 3
- Breaking Changes: 2

## Added Tokens

- `color.brand.primary`
- `color.brand.secondary`
  ...
```

### JSON Format

Useful for automated processing:

```json
{
  "added": ["color.brand.primary", "color.brand.secondary"],
  "removed": ["color.deprecated.old"],
  "changed": [
    {
      "path": "color.primary",
      "old": "#007bff",
      "new": "#0056b3"
    }
  ],
  "stats": {
    "totalAdded": 5,
    "totalRemoved": 2,
    "totalChanged": 3,
    "breakingChanges": 2
  }
}
```

### HTML Format

For web-based review:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Token Diff Report</title>
  </head>
  <body>
    <h1>📋 Token Diff Report</h1>
    <!-- Full formatted HTML report -->
  </body>
</html>
```

## Migration Suggestions

The diff command automatically generates migration suggestions based on:

- **Renamed tokens**: Detects when tokens appear to be renamed (same values, different paths)
- **Replaced tokens**: Identifies restructured token paths
- **Deprecated tokens**: Warns about tokens that may need updating
- **Breaking changes**: Flags removed or significantly changed tokens

## Exit Codes

- `0` - No changes or non-breaking changes detected
- `1` - Breaking changes detected (in strict mode) or errors occurred

## See Also

- [generate:changelog](#) - Generate version-based changelogs
- [migrate](#) - Migrate tokens from other formats
- [validate](#) - Validate token syntax and accessibility
