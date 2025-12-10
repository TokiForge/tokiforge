---
title: TokenValidator API | TokiForge
description: Complete API reference for TokenValidator. Validate token structure, values, and ensure consistency across your design token system.
---

# TokenValidator API

Validate token structure and values.

---

## validate()

```typescript
static validate(
  tokens: DesignTokens,
  options?: ValidationOptions
): string[]
```

Validate token structure.

**Parameters:**
- `tokens: DesignTokens` - Tokens to validate
- `options?: ValidationOptions` - Validation options

**Returns:** `string[]` - Array of error messages (empty if valid)

**Example:**
```typescript
import { TokenValidator } from '@tokiforge/core';

const errors = TokenValidator.validate(tokens, {
  checkTypes: true,
  checkCircular: true,
});

if (errors.length > 0) {
  console.error('Validation errors:', errors);
} else {
  console.log('Tokens are valid!');
}
```

---

## assertValid()

```typescript
static assertValid(
  tokens: DesignTokens,
  options?: ValidationOptions
): void
```

Validate and throw if invalid.

**Throws:**
- `ValidationError` - If validation fails

**Example:**
```typescript
try {
  TokenValidator.assertValid(tokens);
  console.log('Valid tokens');
} catch (error) {
  console.error('Invalid:', error.message);
}
```

---

## ValidationOptions

```typescript
interface ValidationOptions {
  checkTypes?: boolean;              // Validate token types
  checkCircular?: boolean;           // Check for circular references
  customValidators?: TokenValidatorFn[]; // Custom validation functions
}

type TokenValidatorFn = (
  token: TokenValue,
  path: string[]
) => string | null;
```

---

## Custom Validators

Add your own validation rules:

```typescript
const customValidators = [
  // Ensure color tokens use hex format
  (token, path) => {
    if (path[0] === 'color' && !token.value.startsWith('#')) {
      return `Color token at ${path.join('.')} must use hex format`;
    }
    return null;
  },
  
  // Ensure spacing uses rem units
  (token, path) => {
    if (path[0] === 'spacing' && !token.value.endsWith('rem')) {
      return `Spacing token at ${path.join('.')} must use rem units`;
    }
    return null;
  },
];

const errors = TokenValidator.validate(tokens, {
  customValidators,
});
```

---

## Common Validations

### Hex Colors Only

```typescript
const hexValidator = (token, path) => {
  if (token.type === 'color') {
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    if (!hexRegex.test(token.value)) {
      return `${path.join('.')}: Color must be 6-digit hex`;
    }
  }
  return null;
};
```

### No Magic Numbers

```typescript
const noMagicNumbers = (token, path) => {
  if (token.type === 'dimension') {
    const value = parseFloat(token.value);
    const validValues = [0.25, 0.5, 1, 1.5, 2, 3, 4];
    
    if (!validValues.includes(value)) {
      return `${path.join('.')}: Use standard spacing values`;
    }
  }
  return null;
};
```

### Required Descriptions

```typescript
const requireDescriptions = (token, path) => {
  if (!token.description) {
    return `${path.join('.')}: Description required`;
  }
  return null;
};
```

---

## CI/CD Integration

Use in build pipelines:

```typescript
// validate-tokens.ts
import { TokenValidator } from '@tokiforge/core';
import tokens from './tokens.json';

const errors = TokenValidator.validate(tokens, {
  checkTypes: true,
  checkCircular: true,
  customValidators: [
    // Your custom rules
  ],
});

if (errors.length > 0) {
  console.error('❌ Token validation failed:');
  errors.forEach(err => console.error(`  - ${err}`));
  process.exit(1);
}

console.log('✅ Tokens validated successfully');
```

```json
// package.json
{
  "scripts": {
    "validate": "ts-node validate-tokens.ts",
    "pretest": "npm run validate"
  }
}
```

---

## See Also

- [Best Practices](/guides/best-practices)
- [TokenParser](/api/core#tokenparser)
