# @tokiforge/core

**Framework-agnostic design token and theming engine. Runtime theme switching, CSS variables, token parsing, validation, and export. Supports React, Vue, Angular, Svelte, Next.js, Remix, and more.**

Core design token engine for TokiForge v2.4.0.

## Installation

```bash
npm install @tokiforge/core@^2.4.0
```

## Usage

### Parse Tokens (Node / CLI)

```typescript
import { TokenParser } from "@tokiforge/core/node";

const tokens = TokenParser.parse("./tokens.json");
```

### Export Tokens

```typescript
import { TokenParser } from "@tokiforge/core/node";
import { TokenExporter } from "@tokiforge/core/runtime";

const tokens = TokenParser.parse("./tokens.json");

// Export as CSS
const css = TokenExporter.exportCSS(tokens, { prefix: "hf" });

// Export as TypeScript
const ts = TokenExporter.exportTS(tokens);
```

### Runtime Theme Management

```typescript
import { ThemeRuntime } from "@tokiforge/core/runtime";

const runtime = new ThemeRuntime({
  themes: [
    { name: "light", tokens: lightTokens },
    { name: "dark", tokens: darkTokens },
  ],
  defaultTheme: "light",
});

runtime.init();
runtime.applyTheme("dark");
```

## Features (v2.4.0)

- **Split entries** - `@tokiforge/core/runtime` for browsers (theme switching: 2.7 KB gzipped), `@tokiforge/core/tools` for browser-safe build/analysis helpers, `@tokiforge/core/node` for CLI/file I/O
- **Modern CSS export** - `color-mix()`, `@layer`, `@container`, plus CSS variables and `light-dark()`
- **ThemeController** - Shared headless lifecycle used by framework adapters
- **DTCG & composites** - W3C design tokens, typography/shadow composites, prefers/container breakpoints
- **Accessibility** - WCAG contrast, APCA, high contrast, reduced motion, color blind support
- **Performance** - Multi-tier caching, lazy loading, compression; `size-limit` enforces `/runtime` ≤ 3 KB gzipped in CI

## Entry points

| Import | Contents | Use from |
| --- | --- | --- |
| `@tokiforge/core/runtime` | `ThemeRuntime`, `ThemeController`, `TokenExporter`, `ColorUtils`, `AccessibilityUtils`, types | Browser app bundles, framework adapters |
| `@tokiforge/core/tools` | `SSRUtils`, `TokenAnalytics`, `AnalyticsReporter`, `SemanticTokenManager`, `TokenVersioning`, `ResponsiveTokens`, `BrandManager`, `ComponentTheming`, `TokenRegistry`, `IDESupport`, `pluginManager`, iOS/Android/RN exporters | Build scripts, Storybook, docs sites, design tooling (browser-safe, no `fs`) |
| `@tokiforge/core/node` | Everything above + `TokenParser`, `FigmaDiff`, `CICDValidator` | CLI, Node build tools, VS Code |
| `@tokiforge/core` | Same as `/node` | Backwards-compatible default |

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
