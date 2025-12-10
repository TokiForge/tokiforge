# @tokiforge/core

**Framework-agnostic design token and theming engine. Runtime theme switching, CSS variables, token parsing, validation, and export. Supports React, Vue, Angular, Svelte, Next.js, Remix, and more.**

Core design token engine for TokiForge v1.2.0.

## Installation

```bash
npm install @tokiforge/core@^1.2.0
```

## Usage

### Parse Tokens

```typescript
import { TokenParser } from '@tokiforge/core';

const tokens = TokenParser.parse('./tokens.json');
```

### Export Tokens

```typescript
import { TokenParser, TokenExporter } from '@tokiforge/core';

const tokens = TokenParser.parse('./tokens.json');

// Export as CSS
const css = TokenExporter.exportCSS(tokens, { prefix: 'hf' });

// Export as TypeScript
const ts = TokenExporter.exportTS(tokens);
```

### Runtime Theme Management

```typescript
import { ThemeRuntime } from '@tokiforge/core';

const runtime = new ThemeRuntime({
  themes: [
    { name: 'light', tokens: lightTokens },
    { name: 'dark', tokens: darkTokens },
  ],
  defaultTheme: 'light',
});

runtime.init();
runtime.applyTheme('dark');
```

## New Features (v1.2.0)

- **Performance Optimization** - Caching, lazy loading, and compression
- **Accessibility** - High contrast mode, reduced motion, color blind support, font scaling
- **Advanced Token Features** - Functions, expressions, references with fallbacks, scoping, theming API
- **Integrations** - Storybook, enhanced Figma sync, design tools, CMS, design system tools

## Previous Features (v1.1.2)

- **Token Versioning** - Track versions, deprecations, and migrations
- **Component Theming** - Scoped themes for individual components
- **Plugin System** - Extensible with custom exporters and validators
- **Accessibility** - WCAG compliance checking and contrast analysis
- **Responsive Tokens** - Breakpoint and state-aware token variations
- **Figma Sync** - Compare and sync tokens with Figma
- **CI/CD Integration** - Automated validation for pipelines
- **Analytics** - Token usage tracking and bundle impact
- **Token Registry** - Multi-team design system support
- **IDE Support** - Autocomplete and hover previews

## API

See the main [TokiForge README](../../README.md) and [API Documentation](../../documentation/api/core.md) for complete documentation.



