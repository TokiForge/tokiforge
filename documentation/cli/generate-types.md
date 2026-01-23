---
title: Generate Types | CLI Commands
description: Generate TypeScript type definitions from your design tokens automatically using the TokiForge CLI.
---

# Generate Types Command

Generate TypeScript type definitions from your design tokens automatically.

```bash
tokiforge generate:types
```

## What it does

- Reads `tokens.json` configuration
- Generates TypeScript types matching your token structure
- Creates type-safe token access
- Supports both union types and strict enums
- Generates JSDoc comments from token descriptions

## Output

Creates `tokens.types.ts` (or configured path) containing:

- Token value types
- Token category types
- Theme type definitions
- Type-safe token accessors

## Options

- `--output <path>` - Output file path (default: `tokens.types.ts`)
- `--format <format>` - Type format: `types` or `enums` (default: `types`)
- `--strict` - Enforce strict type checking

## Examples

### Basic Usage

```bash
tokiforge generate:types
# Generates: tokens.types.ts
```

### Custom Output Path

```bash
tokiforge generate:types --output src/types/design-tokens.ts
```

### Enum Format

```bash
tokiforge generate:types --format enums
# Generates enum-style types for theme names and token categories
```

### Strict Type Checking

```bash
tokiforge generate:types --strict
# Enforces all token properties must be explicitly typed
```

## Generated Type Examples

### Default Types Output

```typescript
// tokens.types.ts
export type TokenValue = string | number | boolean;

export type ThemeName = "light" | "dark" | "high-contrast";

export interface ColorTokens {
  primary: TokenValue;
  secondary: TokenValue;
  background: TokenValue;
  text: TokenValue;
}

export interface SpacingTokens {
  xs: TokenValue;
  sm: TokenValue;
  md: TokenValue;
  lg: TokenValue;
  xl: TokenValue;
}

export interface DesignTokens {
  colors: ColorTokens;
  spacing: SpacingTokens;
}

export const getTokenType = (token: string): string => {
  // Token type lookup helper
};
```

### Enum Format Output

```typescript
// tokens.types.ts
export enum Theme {
  Light = "light",
  Dark = "dark",
  HighContrast = "high-contrast",
}

export enum ColorToken {
  Primary = "color.primary",
  Secondary = "color.secondary",
  Background = "color.background",
  Text = "color.text",
}

export enum SpacingToken {
  XS = "spacing.xs",
  SM = "spacing.sm",
  MD = "spacing.md",
  LG = "spacing.lg",
  XL = "spacing.xl",
}
```

## Usage in Your Code

### TypeScript Components

```typescript
import type { DesignTokens, ThemeName } from "./tokens.types";
import { useTheme } from "@tokiforge/react";

export function MyComponent() {
  const { tokens, setTheme } = useTheme<DesignTokens>();

  // Full type safety!
  const primaryColor: string = tokens.colors.primary;
  const spacing: string = tokens.spacing.md;

  return <div style={{ color: primaryColor, padding: spacing }}>Content</div>;
}
```

### Theme Switching with Types

```typescript
import { ThemeName } from "./tokens.types";

const validTheme: ThemeName = "light"; // ✅ Type-safe
const invalidTheme: ThemeName = "invalid"; // ❌ TypeScript error
```

## Integration with CI/CD

### GitHub Actions

```yaml
- name: Generate token types
  run: tokiforge generate:types

- name: Verify types
  run: tsc --noEmit
```

## Tips

- **Commit generated types** to version control for team consistency
- **Regenerate** whenever token structure changes
- **Use with eslint** to enforce token usage patterns
- **Combine** with `tokiforge build` in your build pipeline

## Related Commands

- [`tokiforge build`](/cli/commands#build) - Build and export tokens
- [`tokiforge validate`](/cli/commands#validate) - Validate token structure
- [`tokiforge watch`](/cli/commands#watch) - Watch for token changes

## Troubleshooting

### Types not updating

```bash
# Clear cache and regenerate
tokiforge generate:types --force
```

### Export mismatch errors

```bash
# Ensure tokens.json is valid
tokiforge validate

# Then regenerate
tokiforge generate:types --strict
```

### TypeScript compilation errors

Check that your `tsconfig.json` includes the generated types file path in `include`:

```json
{
  "include": ["src/**/*", "tokens.types.ts"]
}
```
