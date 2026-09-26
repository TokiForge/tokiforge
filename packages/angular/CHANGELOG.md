# @tokiforge/angular

## 3.0.0

### Minor Changes

- [#23](https://github.com/TokiForge/tokiforge/pull/23) [`f11ae0e`](https://github.com/TokiForge/tokiforge/commit/f11ae0eac810d8d2ba9b8c96a2476df6104eaefa) Thanks [@toozuuu](https://github.com/toozuuu)! - Split `@tokiforge/core` into `/runtime` (2.7 KB gzipped theme switching), `/tools` (browser-safe build/analysis helpers), and `/node` entries with `size-limit` budgets enforced in CI, modern CSS export (`color-mix`, `@layer`, `@container`), ThemeController on Vue/Angular/Emotion/styled-components, CLI responsive/state CSS, Storybook `register`, Astro static CSS write, Tailwind peer `^3 || ^4`, and adapter option parity (`watchSystemTheme`, `storageKey`, `SSRUtils`).

### Patch Changes

- [#22](https://github.com/TokiForge/tokiforge/pull/22) [`6e6e343`](https://github.com/TokiForge/tokiforge/commit/6e6e3439efbe93d3996f773e5f7a98405fed374b) Thanks [@toozuuu](https://github.com/toozuuu)! - New shared ThemeController, DTCG format support, composite tokens, OKLCH color engine, APCA contrast, light-dark() export, View Transitions, `tokiforge docs` styleguide generator — plus critical fixes: full-path CSS variable naming (`--hf-color-primary`), chained token reference resolution, shorthand hex parsing, initial-theme application in every framework adapter, `'use client'` preserved in the Next.js bundle, and a CLI that no longer crashes on launch (ESM/CJS mismatch).

- Updated dependencies [[`6e6e343`](https://github.com/TokiForge/tokiforge/commit/6e6e3439efbe93d3996f773e5f7a98405fed374b), [`f11ae0e`](https://github.com/TokiForge/tokiforge/commit/f11ae0eac810d8d2ba9b8c96a2476df6104eaefa)]:
  - @tokiforge/core@2.5.0

## 2.4.0

### Minor Changes

- Service wraps shared `ThemeController`.
- Version bump to 2.4.0; depends on `@tokiforge/core@^2.4.0`.
- Angular unit tests enabled.

## 2.2.3

### Patch Changes

- Version bump; @tokiforge/core@^2.4.0.

## 2.0.2

### Patch Changes

- Version bump; @tokiforge/core@^2.0.2.

## 2.0.1

### Patch Changes

- Version bump; @tokiforge/core@^2.0.1.

## 2.0.0

### Major Changes

- Major version release: Updated to 2.0.0 with updated dependencies

### Updated dependencies

- @tokiforge/core@2.0.0

## 1.2.1

### Patch Changes

- Automate releases with Changesets and CI. Adds release workflows and configuration; no runtime changes.

- Updated dependencies []:
  - @tokiforge/core@1.2.1
