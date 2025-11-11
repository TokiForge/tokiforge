# TokenParser API Reference

Complete API reference for the `TokenParser` class from `@tokiforge/core`.

## Overview

`TokenParser` is a static utility class for parsing, validating, and processing design token files. It supports JSON and YAML formats, token validation, and reference expansion.

## Import

```typescript
import { TokenParser } from '@tokiforge/core';
```

## Methods

### `TokenParser.parse(filePath, options?)`

Parse a design token file (JSON or YAML) and return validated tokens.

**Signature:**

```typescript
static parse(
  filePath: string,
  options?: TokenParserOptions
): DesignTokens
```

**Parameters:**

- `filePath: string` - Path to the token file (`.json`, `.yaml`, or `.yml`)
- `options?: TokenParserOptions` - Parser options

**Options:**

```typescript
interface TokenParserOptions {
  validate?: boolean;        // Validate token structure (default: true)
  expandReferences?: boolean; // Expand {token.path} references (default: true)
}
```

**Returns:** `DesignTokens` - Parsed and processed design tokens

**Example:**

```typescript
import { TokenParser } from '@tokiforge/core';

const tokens = TokenParser.parse('./tokens.json');

const yamlTokens = TokenParser.parse('./tokens.yaml');

const tokens = TokenParser.parse('./tokens.json', {
  validate: false,
});

const tokens = TokenParser.parse('./tokens.json', {
  expandReferences: false,
});
```

**Supported Formats:**

- `.json` - JSON format
- `.yaml` - YAML format
- `.yml` - YAML format (alternative extension)

**Throws:**

- `Error` if file doesn't exist
- `Error` if file format is invalid
- `Error` if tokens fail validation (when `validate: true`)

### `TokenParser.validate(tokens)`

Validate token structure and throw an error if invalid.

**Signature:**

```typescript
static validate(tokens: DesignTokens): void
```

**Parameters:**

- `tokens: DesignTokens` - Design tokens to validate

**Throws:**

- `Error` if token structure is invalid

**Validation Rules:**

- All token values must be strings or numbers
- Token objects must have a `value` property
- Nested structures must be valid objects

**Example:**

```typescript
import { TokenParser } from '@tokiforge/core';

try {
  TokenParser.validate(tokens);
  console.log('✅ Tokens are valid!');
} catch (error) {
  console.error('❌ Invalid tokens:', error.message);
}
```

**Error Messages:**

- `Invalid token value at {path}: must be string or number` - When a token value is not a string or number

### `TokenParser.expandReferences(tokens)`

Expand token references in the format `{token.path}` to their actual values.

**Signature:**

```typescript
static expandReferences(tokens: DesignTokens): DesignTokens
```

**Parameters:**

- `tokens: DesignTokens` - Design tokens with references

**Returns:** `DesignTokens` - Tokens with references expanded

**Reference Syntax:**

```json
{
  "color": {
    "primary": { "value": "#7C3AED", "type": "color" },
    "accent": { "value": "{color.primary}", "type": "color" }
  }
}
```

After expansion:
```json
{
  "color": {
    "primary": { "value": "#7C3AED", "type": "color" },
    "accent": { "value": "#7C3AED", "type": "color" }
  }
}
```

**Example:**

```typescript
import { TokenParser } from '@tokiforge/core';

const tokensWithRefs = {
  color: {
    primary: { value: '#7C3AED', type: 'color' },
    accent: { value: '{color.primary}', type: 'color' },
  },
};

const expanded = TokenParser.expandReferences(tokensWithRefs);
```

**Throws:**

- `Error` if a reference is not found
- `Error` if a reference path is invalid

**Error Messages:**

- `Token reference not found: {path}` - When a referenced token doesn't exist
- `Invalid token reference: {path}` - When a reference path is malformed

## Usage Examples

### Basic Parsing

```typescript
import { TokenParser } from '@tokiforge/core';

const tokens = TokenParser.parse('./tokens.json');
```

### Parse with Custom Options

```typescript
import { TokenParser } from '@tokiforge/core';

const tokens = TokenParser.parse('./tokens.json', {
  validate: false,
  expandReferences: true,
});
```

### Manual Validation

```typescript
import { TokenParser } from '@tokiforge/core';

const tokens = TokenParser.parse('./tokens.json', {
  validate: false,
});

try {
  TokenParser.validate(tokens);
} catch (error) {
  console.error('Validation failed:', error);
}
```

### Manual Reference Expansion

```typescript
import { TokenParser } from '@tokiforge/core';

const tokens = TokenParser.parse('./tokens.json', {
  expandReferences: false,
});

const expanded = TokenParser.expandReferences(tokens);
```

### Error Handling

```typescript
import { TokenParser } from '@tokiforge/core';

try {
  const tokens = TokenParser.parse('./tokens.json');
} catch (error) {
  if (error.message.includes('not found')) {
    console.error('File not found');
  } else if (error.message.includes('Invalid token')) {
    console.error('Token validation failed');
  } else {
    console.error('Parse error:', error);
  }
}
```

## Token File Format

### JSON Format

```json
{
  "color": {
    "primary": {
      "value": "#7C3AED",
      "type": "color"
    },
    "accent": {
      "value": "{color.primary}",
      "type": "color"
    }
  },
  "spacing": {
    "md": {
      "value": "16px",
      "type": "dimension"
    }
  }
}
```

### YAML Format

```yaml
color:
  primary:
    value: "#7C3AED"
    type: color
  accent:
    value: "{color.primary}"
    type: color
spacing:
  md:
    value: "16px"
    type: dimension
```

## Best Practices

1. **Always validate in production** - Use `validate: true` (default) to catch errors early
2. **Expand references** - Use `expandReferences: true` (default) for easier token usage
3. **Handle errors** - Wrap parsing in try-catch blocks
4. **Use TypeScript** - Get type safety with `DesignTokens` type

## Related

- See [TokenExporter API](/api/token-exporter) for exporting tokens
- Check [Design Tokens Guide](/guide/design-tokens) for token structure
- View [Core API](/api/core) for complete overview

