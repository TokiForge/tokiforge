---
title: Best Practices Guide | TokiForge
description: Learn how to organize, name, and maintain design tokens effectively. Best practices for token structure, naming conventions, and design system management.
---

# Best Practices Guide

Learn how to organize, name, and maintain design tokens effectively.

## Token Organization

### Hierarchical Structure

Organize tokens in a three-tier hierarchy:

```
Core Tokens (Primitives)
    ↓
Semantic Tokens
    ↓
Component Tokens
```

#### 1. Core Tokens (Primitives)

Raw values without context. These are your building blocks.

```typescript
const coreTokens = {
  color: {
    blue: {
      50: { value: '#eff6ff' },
      500: { value: '#3b82f6' },
      900: { value: '#1e3a8a' },
    },
    gray: {
      50: { value: '#f9fafb' },
      500: { value: '#6b7280' },
      900: { value: '#111827' },
    },
  },
  spacing: {
    1: { value: '0.25rem' },
    4: { value: '1rem' },
    8: { value: '2rem' },
  },
};
```

#### 2. Semantic Tokens

Context-aware tokens that reference core tokens.

```typescript
const semanticTokens = {
  color: {
    primary: { value: '{color.blue.500}' },
    background: { value: '{color.gray.50}' },
    text: { value: '{color.gray.900}' },
    error: { value: '{color.red.500}' },
  },
  spacing: {
    sm: { value: '{spacing.1}' },
    md: { value: '{spacing.4}' },
    lg: { value: '{spacing.8}' },
  },
};
```

#### 3. Component Tokens

Specific to UI components.

```typescript
const componentTokens = {
  button: {
    primary: {
      background: { value: '{color.primary}' },
      text: { value: 'white' },
      padding: { value: '{spacing.md} {spacing.lg}' },
    },
  },
  card: {
    background: { value: '{color.background}' },
    padding: { value: '{spacing.lg}' },
    borderRadius: { value: '8px' },
  },
};
```

---

## Naming Conventions

### General Rules

✅ **DO:**
- Use descriptive, meaningful names
- Follow consistent patterns
- Use semantic names for context
- Keep names concise but clear

❌ **DON'T:**
- Use implementation details in names (`button-blue-500`)
- Mix naming conventions
- Use abbreviations unless universally understood
- Create overly deep nesting (max 3-4 levels)

### Recommended Patterns

```typescript
// ✅ Good
color.text.primary
color.background.surface
spacing.component.button.padding

// ❌ Bad
color.text1
color.bg
sp.btn.pd
```

---

## Theming Strategies

### Light/Dark Theme Pattern

```typescript
const config = {
  themes: [
    {
      name: 'light',
      tokens: {
        color: {
          background: { value: '#ffffff' },
          text: { value: '#000000' },
          primary: { value: '#3b82f6' },
        },
      },
    },
    {
      name: 'dark',
      tokens: {
        color: {
          background: { value: '#1f2937' },
          text: { value: '#ffffff' },
          primary: { value: '#60a5fa' }, // Lighter for dark mode
        },
      },
    },
  ],
};
```

### Multi-Brand Strategy

```typescript
const config = {
  themes: [
    {
      name: 'brand-a',
      tokens: {
        color: {
          primary: { value: '#3b82f6' },
          secondary: { value: '#8b5cf6' },
        },
        typography: {
          fontFamily: { value: 'Inter, sans-serif' },
        },
      },
    },
    {
      name: 'brand-b',
      tokens: {
        color: {
          primary: { value: '#ef4444' },
          secondary: { value: '#f59e0b' },
        },
        typography: {
          fontFamily: { value: 'Roboto, sans-serif' },
        },
      },
    },
  ],
};
```

---

## Version Control

### Token Versioning

Track token changes with version metadata:

```typescript
const tokens = {
  color: {
    primary: {
      value: '#3b82f6',
      version: { major: 2, minor: 1, patch: 0 },
      description: 'Primary brand color',
    },
  },
};
```

### Deprecation Process

1. **Mark as deprecated** with migration info:

```typescript
const tokens = {
  color: {
    oldPrimary: {
      value: '#2563eb',
      deprecated: true,
      version: {
        major: 1,
        minor: 0,
        patch: 0,
        deprecated: true,
        migration: 'Use color.primary instead',
      },
    },
    primary: {
      value: '#3b82f6',
      version: { major: 2, minor: 0, patch: 0 },
    },
  },
};
```

2. **Provide migration period** (at least 2-3 releases)
3. **Remove deprecated tokens** in next major version

---

## Team Collaboration

### Design-Dev Handoff

1. **Design System Documentation**
   - Document token purpose and usage
   - Provide visual examples
   - Include accessibility requirements

2. **Token Review Process**
   - Design team proposes tokens
   - Dev team reviews implementation feasibility
   - Jointly approve additions/changes

3. **Naming Alignment**
   - Establish naming convention document
   - Regular sync meetings
   - Shared vocabulary

### Code Review Checklist

- [ ] Token names follow conventions
- [ ] No hardcoded values (use tokens)
- [ ] Semantic tokens used appropriately
- [ ] Documentation updated
- [ ] Version incremented if needed
- [ ] Backward compatibility maintained

---

## Maintenance

### Regular Audits

**Quarterly:**
- Review unused tokens
- Check for duplicate values
- Validate naming consistency
- Update documentation

**Before Major Releases:**
- Clean up deprecated tokens
- Consolidate similar tokens
- Update version numbers
- Generate migration guide

### Token Consolidation

**Example: Finding duplicates**

```typescript
import { TokenScanner } from '@tokiforge/core';

const duplicates = TokenScanner.findDuplicates(tokens);
// [{
//   value: '#3b82f6',
//   paths: ['color.primary', 'color.button.background']
// }]
```

**Solution:** Use references

```typescript
const improved = {
  color: {
    primary: { value: '#3b82f6' },
    button: "
{
      background: { value: '{color.primary}' }, // Reference instead of duplicate
    },
  },
};
```

---

## Anti-Patterns to Avoid

### ❌ Magic Numbers

```typescript
// Bad
const tokens = {
  spacing: {
    buttonPadding: { value: '12px' }, // Where does 12 come from?
  },
};
```

```typescript
// Good
const tokens = {
  spacing: {
    base: { value: '4px' },
    buttonPadding: { value: 'calc({spacing.base} * 3)' },
  },
};
```

### ❌ Overly Specific Tokens

```typescript
// Bad - too specific
const tokens = {
  button: {
    primary: {
      hoverBackgroundOnTuesdayInDarkMode: { value: '#...' },
    },
  },
};
```

```typescript
// Good - use states and themes
const tokens = {
  button: {
    primary: {
      background: {
        value: '#3b82f6',
        states: {
          hover: '#2563eb',
        },
      },
    },
  },
};
```

### ❌ Inconsistent Naming

```typescript
// Bad - mixed conventions
const tokens = {
  colorPrimary: { value: '#...' },
  'background-color': { value: '#...' },
  TextCol: { value: '#...' },
};
```

```typescript
// Good - consistent convention
const tokens = {
  color: {
    primary: { value: '#...' },
    background: { value: '#...' },
    text: { value: '#...' },
  },
};
```

---

## Quick Reference

| Category | Convention | Example |
|----------|-----------|---------|
| Core Tokens | Descriptive, scale-based | `color.blue.500`, `spacing.4` |
| Semantic | Context-based | `color.primary`, `spacing.md` |
| Component | Component.property | `button.background`, `card.padding` |
| States | Use `states` object | `{ states: { hover: '...' } }` |
| Responsive | Use `responsive` object | `{ responsive: { md: '...' } }` |

---

## Tools & Automation

### Linting

Use `TokenValidator` to enforce rules:

```typescript
import { TokenValidator } from '@tokiforge/core';

const errors = TokenValidator.validate(tokens, {
  customValidators: [
    (token, path) => {
      if (path[0] === 'color' && !token.value.startsWith('#')) {
        return 'Color tokens must use hex format';
      }
      return null;
    },
  ],
});
```

### Documentation Generation

Auto-generate docs from tokens:

```typescript
import { TokenDocGenerator } from '@tokiforge/core';

const markdown = TokenDocGenerator.generateMarkdown(tokens);
// Generates formatted markdown with token tables
```

---

## Summary

✅ **Remember:**
1. Use three-tier hierarchy (Core → Semantic → Component)
2. Follow consistent naming conventions
3. Version and document token changes
4. Regular audits and cleanup
5. Collaborate with design team
6. Avoid anti-patterns (magic numbers, overly specific tokens)

👉 **Next:** [Performance Guide](/guides/performance) | [Migration Guides](/migration/)
