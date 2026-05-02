# TokiForge Documentation

This is the documentation site for TokiForge v2.2.3, built with [VitePress](https://vitepress.dev/).

## Features in v2.2.3

- **Production-Ready Release**: Comprehensive design token and theming engine with full framework support
- **Performance Optimization**: Multi-tier caching, lazy loading, and compression integrated into ThemeRuntime
- **Accessibility**: High contrast mode, reduced motion, color blind support (protanopia/deuteranopia/tritanopia), font size scaling, WCAG AAA compliance
- **Advanced Token Features**: Functions, expressions, references with fallbacks, component scoping, fluent theming API, validation plugins, transformation pipeline
- **Framework Support**: React, Vue, Svelte, Angular, Next.js, Remix, Astro, Solid, SvelteKit with SSR utilities
- **Integrations**: Storybook addon, enhanced Figma sync with conflict resolution, Sketch/Adobe XD adapters, CMS integration (Contentful, Strapi, Sanity), Zeroheight, InVision DSM
- **Developer Tools**: Powerful CLI (init, build, validate, analyze, diff, watch, migrate), token analytics, CI/CD integration, visual regression testing

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
