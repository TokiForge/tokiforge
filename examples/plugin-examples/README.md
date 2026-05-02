# TokiForge plugin examples

Minimal **[Plugin](https://www.npmjs.com/package/@tokiforge/core)** implementations showing how to ship **custom exporters** for design tools. These are reference shapes—Framer, Sketch, and Adobe XD each expect different native formats; swap the string builders for their official APIs or file layouts.

| File | Purpose |
|------|---------|
| `plugins/framer.mjs` | Tokens → Framer-flavored TypeScript theme module |
| `plugins/sketch.mjs` | Tokens → Sketch palette JSON (colors only demo) |
| `plugins/adobe-xd.mjs` | Tokens → XD-friendly CSS variables snippet |
| `register-demo.mjs` | Registers plugins with `pluginManager` and prints one export |

## Run

From repo root (after `pnpm install`):

```bash
cd examples/plugin-examples
pnpm run demo
```

### Scaffold a new plugin file

```bash
pnpm run new-plugin -- my-brand
```

Creates `plugins/custom-my-brand.mjs` exporting a minimal JSON manifest plugin.

## Publishing your own plugin

Use `@tokiforge/core`’s `Plugin` interface (`name`, `exporter`, optional `validator`, optional `optionsSchema`) and register via `pluginManager.register()` or wire into your CLI/build pipeline.

See the [Plugin development guide](../../documentation/guide/plugin-development.md) for the full workflow.
