# TokiForge Documentation

This is the documentation site for TokiForge v2.4.0, built with [VitePress](https://vitepress.dev/).

## Features in v2.4.0

- **Runtime / Tools / Node split**: `@tokiforge/core/runtime` for apps, `@tokiforge/core/tools` for browser-safe build helpers, `@tokiforge/core/node` for CLI and file parsing
- **Modern CSS export**: `color-mix()`, `@layer`, `@container`, CSS variables, `light-dark()`
- **ThemeController**: Shared lifecycle across React, Vue, Angular, Svelte, Emotion, styled-components, and more
- **Performance**: Multi-tier caching, lazy loading, compression; theme switching 2.7 KB gzipped, enforced with `size-limit`
- **Accessibility**: WCAG, APCA, high contrast, reduced motion, color blind modes
- **Framework support**: React, Vue, Svelte, Angular, Next.js, Remix, Astro, Solid, SvelteKit with SSR utilities
- **Integrations**: Storybook `register`, Figma sync, Sketch/Adobe XD, CMS (Contentful, Strapi, Sanity)
- **Developer tools**: CLI (init, build with responsive/state CSS, validate, analyze, diff, watch, migrate), CI/CD, Tailwind v3/v4

## Development

```bash
# Install dependencies (from the repo root)
pnpm install

# Start dev server (predev builds @tokiforge/core and @tokiforge/vue first)
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

Or from the project root:

```bash
pnpm docs:dev
pnpm docs:build
pnpm docs:preview
```

### How the site resolves `@tokiforge/core`

`.vitepress/config.ts` aliases `@tokiforge/core/runtime` to `packages/core/dist/runtime.js` when it exists, falling back to `packages/core/src/runtime.ts` on a fresh clone. The alias is an exact match; a plain string alias for `@tokiforge/core` would also rewrite the `/runtime` subpath and break resolution. Components import from `@tokiforge/core/runtime` only.

### Layout

- `.vitepress/config.ts` – site + Vite config
- `.vitepress/head.ts` – `<head>` tags, SEO metadata, JSON-LD
- `.vitepress/nav.ts` – nav bar and sidebar
- `.vitepress/theme/index.ts` – theme entry; `ApiPlayground` and the seasonal overlay are lazy-loaded on the client

## Structure

- `guide/` - User guides and tutorials
- `api/` - API reference documentation
- `examples/` - Code examples
- `cli/` - CLI documentation

## Contributing

See the main project's CONTRIBUTING.md file for guidelines on contributing to the documentation.

## Release Process

Automated releases are managed with Changesets and GitHub Actions.

- **Propose changes:** run `pnpm changeset` to create a changeset with package bumps and a summary.
- **Versioning:** CI will run `pnpm version` to update versions and changelogs via Changesets.
- **Build & Publish:** `release` workflow builds all workspaces and publishes to npm when changesets are present.
- **Manual publish (fallback):** `pnpm publish:all` publishes individual packages without Changesets.
- **Docs:** build with `pnpm docs:build`; deploy via existing `docs.yml` workflow.

Prerequisites: set `NPM_TOKEN` in repository secrets for publishing.
