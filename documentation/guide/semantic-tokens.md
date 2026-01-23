---
title: Semantic Tokens & Aliasing | Guide
description: Comprehensive guide to semantic tokens in TokiForge. Learn token aliasing, semantic layers, inheritance systems, and best practices for design system scalability.
---

# Semantic Tokens & Aliasing

Semantic tokens enable meaningful token names that abstract away implementation details. TokiForge provides a powerful layer-based system with inheritance and resolution.

## Understanding Semantic Tokens

### Primitive vs Semantic Tokens

**Primitive tokens** are low-level design values:

```json
{
  "color": {
    "gray": {
      "50": { "value": "#F9FAFB" },
      "100": { "value": "#F3F4F6" },
      "200": { "value": "#E5E7EB" }
    }
  }
}
```

**Semantic tokens** assign meaning to primitives:

```json
{
  "semantic": {
    "background": { "$resolve": "color.gray.50" },
    "surface": { "$resolve": "color.gray.100" },
    "border": { "$resolve": "color.gray.200" }
  }
}
```

## Semantic Token Layers

Semantic token layers organize tokens by purpose with optional inheritance:

```typescript
import { SemanticTokenManager, type SemanticTokenLayer } from "@tokiforge/core";

const primitiveTokens = {
  color: {
    primary: { value: "#007AFF" },
    secondary: { value: "#5AC8FA" },
    gray: {
      50: { value: "#F9FAFB" },
      100: { value: "#F3F4F6" },
      900: { value: "#111827" },
    },
  },
};

const manager = new SemanticTokenManager(primitiveTokens);

// Register a base layer
const baseLayer: SemanticTokenLayer = {
  name: "base",
  description: "Base semantic tokens for all themes",
  tokens: {
    "color.primary": "color.primary",
    "color.secondary": "color.secondary",
    "color.background": "color.gray.50",
    "color.surface": "color.gray.100",
    "color.text": "color.gray.900",
  },
};

manager.registerLayer(baseLayer);
```

## Token Resolution

### Basic Resolution

Resolve semantic tokens to their primitive values:

```typescript
// Get all resolutions for a layer
const resolutions = manager.resolveLayer("base");

for (const [semanticName, resolution] of resolutions) {
  console.log(`${semanticName}:`);
  console.log(`  → ${resolution.primitiveToken}`);
  console.log(`  = ${resolution.primitiveValue}`);
}

// Output:
// color.primary:
//   → color.primary
//   = #007AFF
// color.background:
//   → color.gray.50
//   = #F9FAFB
```

### Resolution with Conditions

Resolve tokens for specific contexts:

```typescript
import type { SemanticResolutionContext } from "@tokiforge/core";

const darkContext: SemanticResolutionContext = {
  theme: "dark",
  mode: "dark",
  contrast: "normal",
};

const resolution = manager.resolveSemantic(
  "color.background",
  "dark-theme",
  darkContext
);

console.log(resolution);
// {
//   semanticName: 'color.background',
//   primitiveToken: 'color.gray.900',
//   primitiveValue: '#111827',
//   layer: 'dark-theme',
//   resolved: true,
//   chain: ['color.gray.900']
// }
```

## Layer Inheritance

Layers can inherit from other layers to reduce duplication:

```typescript
// Base layer (defined above)
manager.registerLayer(baseLayer);

// Dark theme layer - inherits from base and overrides specific tokens
const darkLayer: SemanticTokenLayer = {
  name: "dark-theme",
  description: "Dark mode semantic tokens",
  inherit: ["base"], // Inherit from base layer
  tokens: {
    // Override background and text colors
    "color.background": "color.gray.900",
    "color.surface": "color.gray.800",
    "color.text": "color.gray.50",
    // Inherits color.primary and color.secondary from base
  },
};

manager.registerLayer(darkLayer);

// Resolve dark theme
const darkResolutions = manager.resolveLayer("dark-theme");

console.log(darkResolutions.get("color.primary"));
// {
//   primitiveToken: 'color.primary',
//   primitiveValue: '#007AFF',
//   layer: 'dark-theme',
//   chain: ['color.primary']
// }
```

## Advanced Mappings

### Conditional Mappings

Use conditions to switch tokens based on context:

```typescript
const highContrastLayer: SemanticTokenLayer = {
  name: "high-contrast",
  description: "High contrast mode",
  tokens: {
    "color.text": {
      $resolve: "color.gray.900",
      $condition: ["normal", "light"],
      $fallback: "color.gray.950", // Use if condition doesn't match
    },
  },
};

manager.registerLayer(highContrastLayer);

// Resolve with high-contrast context
const resolution = manager.resolveSemantic("color.text", "high-contrast", {
  contrast: "high",
});

console.log(resolution);
// Uses $fallback since condition doesn't match
```

### Fallback Values

Provide fallbacks for missing primitives:

```typescript
const fallbackLayer: SemanticTokenLayer = {
  name: "with-fallback",
  tokens: {
    "color.accent": {
      $resolve: "color.brand.accent", // May not exist
      $fallback: "color.primary", // Use if brand.accent missing
    },
  },
};

manager.registerLayer(fallbackLayer);

const resolution = manager.resolveSemantic("color.accent", "with-fallback");

// If color.brand.accent doesn't exist, uses color.primary
```

## Validation

### Validate Layer Structure

```typescript
const validation = manager.validate();

if (!validation.valid) {
  console.error("Validation errors:");
  validation.errors.forEach((error) => console.error(`  - ${error}`));
}

console.log("Warnings:");
validation.warnings.forEach((warning) => console.warn(`  - ${warning}`));

// Output resolution details
validation.resolutions.forEach((resolution, key) => {
  console.log(`${key}: ${resolution.resolved ? "✓" : "✗"}`);
});
```

### Specific Layer Validation

```typescript
const darkValidation = manager.validate("dark-theme");

console.log(
  `Dark theme layer is ${darkValidation.valid ? "valid" : "invalid"}`
);
```

## Documentation & Export

### Generate Documentation

```typescript
const docs = manager.getDocumentation("dark-theme");

console.log(JSON.stringify(docs, null, 2));
// Output:
// {
//   "color.background": {
//     "name": "color.background",
//     "primitiveToken": "color.gray.900",
//     "primitiveValue": "#111827",
//     "resolved": true,
//     "chain": ["color.gray.900"],
//     "conditions": undefined,
//     "fallback": undefined
//   },
//   ...
// }
```

### Export as JSON

```typescript
const json = manager.export("dark-theme", "json");
console.log(json);

// Output:
// {
//   "color.background": {
//     "value": "#111827",
//     "resolved": "color.gray.900"
//   },
//   ...
// }
```

### Export as CSS

```typescript
const css = manager.export("dark-theme", "css");
console.log(css);

// Output:
// :root[data-semantic="dark-theme"] {
//   --semantic-color-background: #111827;
//   --semantic-color-surface: #1F2937;
//   --semantic-color-text: #F9FAFB;
//   ...
// }
```

## Complete Example

Here's a complete semantic token setup:

```typescript
import { SemanticTokenManager, type SemanticTokenLayer } from "@tokiforge/core";

const primitiveTokens = {
  color: {
    primary: { value: "#007AFF" },
    secondary: { value: "#5AC8FA" },
    gray: {
      50: { value: "#F9FAFB" },
      100: { value: "#F3F4F6" },
      500: { value: "#6B7280" },
      900: { value: "#111827" },
      950: { value: "#030712" },
    },
  },
};

const manager = new SemanticTokenManager(primitiveTokens);

// Base semantic layer
const base: SemanticTokenLayer = {
  name: "base",
  description: "Base semantic tokens",
  tokens: {
    "color.primary": "color.primary",
    "color.secondary": "color.secondary",
    "color.background": "color.gray.50",
    "color.foreground": "color.gray.900",
    "color.border": "color.gray.100",
    "color.text": "color.gray.900",
    "color.muted": "color.gray.500",
  },
};

manager.registerLayer(base);

// Light theme (inherits from base)
const light: SemanticTokenLayer = {
  name: "light",
  inherit: ["base"],
  tokens: {
    // Inherits all base tokens
  },
};

manager.registerLayer(light);

// Dark theme (inherits from base, overrides colors)
const dark: SemanticTokenLayer = {
  name: "dark",
  inherit: ["base"],
  tokens: {
    "color.background": "color.gray.900",
    "color.foreground": "color.gray.50",
    "color.border": "color.gray.800",
    "color.text": "color.gray.50",
    "color.muted": "color.gray.500",
  },
};

manager.registerLayer(dark);

// High contrast theme
const highContrast: SemanticTokenLayer = {
  name: "high-contrast",
  inherit: ["dark"],
  tokens: {
    "color.foreground": "color.gray.950",
    "color.text": "color.gray.950",
  },
};

manager.registerLayer(highContrast);

// Validate all layers
const validation = manager.validate();
console.log(`All layers valid: ${validation.valid}`);

// Export CSS for each theme
const lightCSS = manager.export("light", "css");
const darkCSS = manager.export("dark", "css");
const hcCSS = manager.export("high-contrast", "css");

// Use in application
console.log(lightCSS);
console.log(darkCSS);
console.log(hcCSS);
```

## Best Practices

### 1. Naming Convention

Use consistent semantic names:

```typescript
const layer: SemanticTokenLayer = {
  name: "semantic-naming",
  tokens: {
    // ✓ Good - describes purpose
    "action.primary": "color.blue.600",
    "action.secondary": "color.gray.500",
    "feedback.success": "color.green.600",
    "feedback.error": "color.red.600",
    "surface.background": "color.gray.50",
    "surface.card": "color.white",

    // ✗ Poor - unclear purpose
    "btn-color": "color.blue.600",
    "txt-color": "color.gray.900",
  },
};
```

### 2. Layer Organization

Organize layers by abstraction level:

```typescript
// Base layer - primitive to semantic mapping
const base = {
  name: "base",
  tokens: {
    "semantic.primary": "color.primary",
    "semantic.surface": "color.gray.50",
  },
};

// Theme layer - inherits from base, applies theme
const darkTheme = {
  name: "dark-theme",
  inherit: ["base"],
  tokens: {
    "semantic.surface": "color.gray.900",
  },
};

// Accessibility layer - inherits from theme
const highContrast = {
  name: "high-contrast",
  inherit: ["dark-theme"],
  tokens: {
    "semantic.primary": "color.yellow.600", // High contrast
  },
};
```

### 3. Inheritance Strategy

Minimize duplication with inheritance:

```typescript
manager.registerLayer(base); // Foundation
manager.registerLayer({ name: "light", inherit: ["base"], tokens: {} });
manager.registerLayer({
  name: "dark",
  inherit: ["base"],
  tokens: {
    /* overrides */
  },
});
manager.registerLayer({
  name: "hc",
  inherit: ["dark"],
  tokens: {
    /* overrides */
  },
});
```

### 4. Documentation

Include descriptions for semantic layers:

```typescript
const layer: SemanticTokenLayer = {
  name: "component-buttons",
  description: "Semantic tokens for button components across all themes",
  tokens: {
    "component.button.primary.bg": "color.primary",
    "component.button.primary.text": "color.white",
  },
};
```

### 5. Validation in CI/CD

Validate before deploying:

```bash
tokiforge validate --semantic
# Checks all semantic layers for:
# - Circular inheritance
# - Unresolved references
# - Missing primitives
```

## Related Guides

- [Design Tokens Guide](/guide/design-tokens)
- [Theming Guide](/guide/theming)
- [Token Versioning](/guide/advanced-token-features)
- [Accessibility Checks](/guide/accessibility)

## API Reference

- [SemanticTokenManager](/api/core#semantictokenmanager)
- [SemanticTokenLayer](/api/core#semantictokenlayer)
- [SemanticTokenResolution](/api/core#semantictokenresolution)

## Next Steps

- Implement semantic layers in your design system
- Set up inheritance hierarchies
- Validate layers in CI/CD
- Export for different platforms
