# TokiForge Documentation

This is the documentation site for TokiForge v1.2.0, built with [VitePress](https://vitepress.dev/).

## New Features in v1.2.0

- **Performance Optimization**: Caching, lazy loading, and compression integrated into ThemeRuntime
- **Accessibility**: High contrast mode, reduced motion, color blind support, font size scaling
- **Advanced Token Features**: Functions, expressions, references with fallbacks, scoping, theming API, validation plugins, transformation pipeline
- **Integrations**: Storybook addon, enhanced Figma sync, Sketch/Adobe XD adapters, CMS integration (Contentful, Strapi, Sanity), Zeroheight, InVision DSM

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
