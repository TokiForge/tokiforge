---
title: VS Code extension | Guide
description: Use the TokiForge VS Code extension for hover, completions, and validation on token JSON files.
---

# VS Code extension

The workspace package [`packages/vscode-tokiforge`](https://github.com/TokiForge/tokiforge/tree/main/packages/vscode-tokiforge) provides editor support for TokiForge-style token files **without** loading the full `@tokiforge/core` bundle inside the extension host (parsing uses `jsonc-parser` and the same leaf shape as core: objects with `value` and optional `type`).

## Features

- **Hover** on dotted token paths (e.g. `color.brand`) when the path matches a leaf in the open file.
- **Completions** for token paths inside quoted strings (including `$resolve` targets).
- **Diagnostics** for invalid hex colors when `type` is `color`.
- **Quick fix** to expand shorthand `#RGB` to `#RRGGBB`.

Files are treated as token files when the path matches `tokens`, `theme`, `toki`, or `token` (case-insensitive).

## Build and run locally

From the repo root:

```bash
pnpm install
pnpm --filter tokiforge-vscode run compile
```

Open `packages/vscode-tokiforge` in VS Code and press **F5** to launch an Extension Development Host.

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `tokiforge.enable` | `true` | Enable TokiForge language features. |
| `tokiforge.tokenFilePattern` | `**/{tokens,tokens.*,theme,toki,tokiforge}.json` | Reserved for future workspace-wide indexing. |

## Marketplace publishing

Set `publisher` in `packages/vscode-tokiforge/package.json`, install [`@vscode/vsce`](https://www.npmjs.com/package/@vscode/vsce), then run `vsce package` from that directory. The package is marked `private` until you choose to publish.

## Relation to `IDESupport`

[`IDESupport`](/api/core#idesupport) in `@tokiforge/core` powers programmatic hover/completions in tools and CLIs. The VS Code extension mirrors the same **token path** semantics for JSON editors.
