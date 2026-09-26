# @tokiforge/core

## 2.4.0

### Minor Changes

- Split package exports into `@tokiforge/core/runtime` (browser theme switching, 2.7 KB gzipped), `@tokiforge/core/tools` (browser-safe build/analysis helpers), and `@tokiforge/core/node` (CLI/file I/O).
- Bundle budgets enforced with `size-limit` on tree-shaken imports.
- Modern CSS export: `color-mix()`, `@layer`, `@container`.
- Deeper DTCG parsing and prefers/container responsive breakpoints.
- Removed obsolete browser Node stubs.

## 2.2.3

### Patch Changes

- Version bump to 2.2.3.

## 2.0.2

### Patch Changes

- Version bump to 2.0.2.

## 2.0.1

### Patch Changes

- Plugin<TOptions> generic and optional optionsSchema. SSR: cookieName/cookieMaxAge in options; fixed unused cookieMaxAge in generateSSRHead.

## 2.0.0

### Major Changes

- Major version release: Updated to 2.0.0 across all packages

## 1.2.1

### Patch Changes

- Automate releases with Changesets and CI. Adds release workflows and configuration; no runtime changes.
