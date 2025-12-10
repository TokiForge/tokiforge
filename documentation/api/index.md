---
title: API Reference Overview | TokiForge
description: Complete API reference for TokiForge design token and theming engine. Browse core APIs, framework adapters, and advanced features documentation.
---

# API Reference Overview

Welcome to the TokiForge API documentation. Navigate by category below.

---

## Core APIs

Essential classes for theme management and token processing.

- **[ThemeRuntime](/api/core#themeruntime)** - Theme lifecycle management
- **[TokenExporter](/api/core#tokenexporter)** - Export to multiple formats
- **[TokenParser](/api/core#tokenparser)** - Parse and validate tokens

[View Complete Core API →](/api/core)

---

## Framework APIs

Framework-specific integrations.

### Vue
- **[provideTheme()](/api/vue#providetheme)** - Provide theme context
- **[useTheme()](/api/vue#usetheme)** - Access theme in components

[View Vue API →](/api/vue)

### React
- **[ThemeProvider](/api/react#themeprovider)** - React context provider
- **[useTheme()](/api/react#usetheme)** - React hook

[View React API →](/api/react)

### Angular
- **[ThemeService](/api/angular#themeservice)** - Injectable service

[View Angular API →](/api/angular)

---

## Advanced APIs

Utilities for token manipulation and analysis.

### Token Features
- **[Token Functions](/api/advanced/token-functions)** - Computed tokens with functions (darken, lighten, mix, etc.)
- **[Token Expressions](/api/advanced/token-expressions)** - Mathematical expressions in tokens
- **[Token References](/api/advanced/token-references)** - References with fallback support
- **[Theming API](/api/advanced/theming-api)** - Programmatic theme creation

### Token Utilities
- **[TokenMerger](/api/advanced/token-merger)** - Merge and inherit tokens
- **[TokenImporter](/api/advanced/token-importer)** - Import from other formats
- **[TokenValidator](/api/advanced/token-validator)** - Custom validation rules
- **[TokenTransforms](/api/advanced/token-transforms)** - Transform token values
- **[TokenAnalytics](/api/advanced/token-analytics)** - Version tracking and diffs
- **[TokenDocGenerator](/api/advanced/token-doc-generator)** - Generate documentation

---

## Quick Reference

### Common Tasks

| Task | API | Example |
|------|-----|---------|
| Initialize theme | `ThemeRuntime` | `new ThemeRuntime(config)` |
| Switch theme | `setTheme()` | `await setTheme('dark')` |
| Export CSS | `TokenExporter` | `exportCSS(tokens, options)` |
| Merge tokens | `TokenMerger` | `merge(base, overrides)` |
| Validate tokens | `TokenValidator` | `validate(tokens, options)` |
| Import | `TokenImporter` | `fromStyleDictionary(sd)` |

---

## Type Definitions

All major types and interfaces:

```typescript
// Core types
interface ThemeConfig { /* ... */ }
interface DesignTokens { /* ... */ }
interface TokenValue { /* ... */ }
interface Theme { /* ... */ }

// Options
interface ThemeInitOptions { /* ... */ }
interface TokenExportOptions { /* ... */ }
interface ValidationOptions { /* ... */ }

// Context
interface ThemeContext<T> { /* ... */ }
```

[View Full Type Definitions →](/api/types)

---

## Error Reference

Custom error classes:

- `ThemeError` - Base theme error
- `ThemeNotFoundError` - Theme doesn't exist
- `TokenError` - Base token error
- `ValidationError` - Validation failed
- `ParseError` - Parsing failed
- `ExportError` - Export failed

---

## See Also

- [Getting Started](/guide/getting-started)
- [Interactive Examples](/examples/interactive/)
- [Migration Guides](/migration/)
- [Best Practices](/guides/best-practices)
