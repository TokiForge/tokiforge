# TokiForge VS Code extension

Language helpers for TokiForge-style token JSON files (`tokens.json`, `theme.json`, paths containing `token`).

## Features

- **Hover**: Token path and resolved value for dotted paths (e.g. `color.primary`).
- **Completions**: Token paths while typing inside quoted strings (including `$resolve` targets).
- **Diagnostics**: Invalid hex colors for tokens typed as `color`.
- **Quick fix**: Normalize shorthand `#RGB` to `#RRGGBB`.

This package is **not** published to the Marketplace by default. Build a VSIX locally:

```bash
pnpm --filter tokiforge-vscode package
```

Then install the generated `.vsix` via VS Code → Extensions → “Install from VSIX…”. Marketplace publish remains optional (`publisher: tokiforge`).

## Development

```bash
pnpm install
pnpm run compile
# or
pnpm run package
```

Press **F5** in VS Code with this folder opened (`packages/vscode-tokiforge`) to launch an Extension Development Host.

## Configuration

| Setting | Default | Description |
|--------|---------|-------------|
| `tokiforge.enable` | `true` | Master switch for TokiForge features. |
| `tokiforge.tokenFilePattern` | `**/{tokens,...}.json` | Reserved for future workspace indexing. |

## Implementation note

The extension does **not** bundle `@tokiforge/core` (avoids pulling unrelated tooling into the extension host). Parsing uses `jsonc-parser` and the same leaf-shape heuristic as core tokens (`value` + optional `type`).
