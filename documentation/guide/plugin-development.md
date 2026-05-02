---
title: Plugin development | Guide
description: Register custom exporters and validators with TokiForge's Plugin interface and pluginManager.
---

# Plugin development

TokiForge uses a small **[`Plugin`](/api/core#pluginmanager)** contract on `@tokiforge/core`:

```typescript
export interface Plugin<TOptions = PluginOptions> {
  name: string;
  exporter?: (tokens: DesignTokens, options?: TOptions) => string;
  validator?: (tokens: DesignTokens, options?: TOptions) => boolean | { valid: boolean; errors: string[] };
  optionsSchema?: Record<string, unknown>;
}
```

Register instances with **`pluginManager.register(plugin)`**, then call **`pluginManager.export(tokens, pluginName)`** or **`pluginManager.validate(tokens, pluginName)`**.

## Minimal exporter

```typescript
import type { DesignTokens, Plugin } from '@tokiforge/core';
import { pluginManager } from '@tokiforge/core';

const cssVars: Plugin = {
  name: 'css-vars',
  exporter(tokens: DesignTokens) {
    const lines = [':root {'];
    // …walk tokens and emit --token-path
    lines.push('}');
    return lines.join('\n');
  },
};

pluginManager.register(cssVars);
```

## CLI integration

Point your build script at the same registration code, or generate a small entry file that registers plugins then calls `pluginManager.export` and writes stdout to disk. The TokiForge CLI `build` flow can be extended similarly for custom pipelines.

## Examples in this repo

See **[`examples/plugin-examples`](https://github.com/TokiForge/tokiforge/tree/main/examples/plugin-examples)** for Framer-style TS, Sketch palette JSON, and Adobe XD–oriented CSS snippets (`pnpm run demo` from that package).

## Validation and `optionsSchema`

Use **`validator`** to enforce structural rules. Optional **`optionsSchema`** documents plugin options for tooling (JSON Schema–style object); the CLI can surface errors when options do not match.

## Publishing a reusable plugin npm package

1. Publish a package that depends on `@tokiforge/core` and exports `Plugin` objects.
2. Consumers `register()` your plugins at startup or in a config file that their CLI imports.

## Security

Exporters run with full access to token data; only load plugins from trusted sources.
