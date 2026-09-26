---
'@tokiforge/core': minor
'@tokiforge/react': minor
'@tokiforge/vue': minor
'@tokiforge/svelte': minor
'@tokiforge/angular': minor
'@tokiforge/nextjs': minor
'@tokiforge/remix': minor
'@tokiforge/solid': minor
'@tokiforge/sveltekit': minor
'@tokiforge/astro': minor
'@tokiforge/storybook': minor
'@tokiforge/emotion': minor
'@tokiforge/styled-components': minor
'@tokiforge/tailwind': minor
'@tokiforge/figma': minor
'@tokiforge/cms': minor
'@tokiforge/design-tools': minor
'@tokiforge/design-systems': minor
'tokiforge-cli': minor
---

Split `@tokiforge/core` into `/runtime` (2.7 KB gzipped theme switching), `/tools` (browser-safe build/analysis helpers), and `/node` entries with `size-limit` budgets enforced in CI, modern CSS export (`color-mix`, `@layer`, `@container`), ThemeController on Vue/Angular/Emotion/styled-components, CLI responsive/state CSS, Storybook `register`, Astro static CSS write, Tailwind peer `^3 || ^4`, and adapter option parity (`watchSystemTheme`, `storageKey`, `SSRUtils`).
