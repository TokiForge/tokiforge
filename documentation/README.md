# TokiForge Documentation

This is the documentation site for TokiForge v2.4.0, built with [VitePress](https://vitepress.dev/).

## Features in v2.4.0

- **Runtime / Node split**: `@tokiforge/core/runtime` for apps, `@tokiforge/core/node` for CLI and file parsing
- **Modern CSS export**: `color-mix()`, `@layer`, `@container`, CSS variables, `light-dark()`
- **ThemeController**: Shared lifecycle across React, Vue, Angular, Svelte, Emotion, styled-components, and more
- **Performance**: Multi-tier caching, lazy loading, compression; <3KB runtime
- **Accessibility**: WCAG, APCA, high contrast, reduced motion, color blind modes
- **Framework support**: React, Vue, Svelte, Angular, Next.js, Remix, Astro, Solid, SvelteKit with SSR utilities
- **Integrations**: Storybook `register`, Figma sync, Sketch/Adobe XD, CMS (Contentful, Strapi, Sanity)
- **Developer tools**: CLI (init, build with responsive/state CSS, validate, analyze, diff, watch, migrate), CI/CD, Tailwind v3/v4

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Or from the project root:

```bash
npm run docs:dev
npm run docs:build
npm run docs:preview
```

## Structure

- `guide/` - User guides and tutorials
- `api/` - API reference documentation
- `examples/` - Code examples
- `cli/` - CLI documentation

## Contributing

See the main project's CONTRIBUTING.md file for guidelines on contributing to the documentation.

## Release Process

Automated releases are managed with Changesets and GitHub Actions.

- **Propose changes:** run `npm run changeset` to create a changeset with package bumps and a summary.
- **Versioning:** CI will run `npm run version` to update versions and changelogs via Changesets.
- **Build & Publish:** `release` workflow builds all workspaces and publishes to npm when changesets are present.
- **Manual publish (fallback):** `npm run publish:all` publishes individual packages without Changesets.
- **Docs:** build with `npm run docs:build`; deploy via existing `docs.yml` workflow.

Prerequisites: set `NPM_TOKEN` in repository secrets for publishing.
