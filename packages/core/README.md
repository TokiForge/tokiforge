# @tokiforge/core

Core design token engine for TokiForge v1.1.0.

## Installation

```bash
npm install @tokiforge/core@^1.1.0
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

## New Features (v1.1.0)

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



