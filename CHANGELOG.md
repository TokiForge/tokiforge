# Changelog

All notable changes to TokiForge will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.4] - 2026-05-19 (Monorepo Alignment & Recovery)

### Fixed

- **Playground (Dynamic HMR Imports)**: Added a robust `lazyWithRetry()` helper utility to handle browser-cache dynamic chunk failures (black screen crashes) on hot reload/redeployments.
- **Dependency Resolvers**: Standardized and aligned root ESLint to `^9.39.2` to resolve ERESOLVE installation tree conflicts and peer restrictions.
- **Port Alignment**: Aligned Playwright E2E configuration to match standard playground port `5173`.

### Added

- **SEO Metadata Playgrounds**: Injected rich web application JSON-LD schemas, OpenGraph card protocols, Twitter Card tags, and canonical indices into the visual playground.

### Changed

- **Monorepo Alignment**: Aligned all 19 workspace `package.json` package release footprints and cross-package workspace dependencies to `v2.2.4`.
- **Ecosystem Cleanups**: Cleaned up conflicting lockfiles (`package-lock.json`) and untracked output caches (`playwright-report/` and `test-results/`).

## [2.2.3] - 2026-05-19 (Maintenance Update)

### Fixed

- **React ThemeContext**: Marked component props as read-only, eliminated the unused `suppressHydrationWarning` prop definition to comply with SonarLint standard `S6767`, and resolved duplicate React/TypeScript type conflicts on the `children` prop.
- **Analytics HTML Reporter**: Fixed syntax errors caused by direct JavaScript loops and nested operations inside template literals by refactoring `generateHTMLReport` to pre-compute markup strings safely.

### Refactored

- **Cognitive Complexity**: Reduced high cognitive complexity across validator, exporter, responsive token, and semantic token resolver systems (`cicd-validator.ts`, `ios-exporter.ts`, `react-native-exporter.ts`, `responsive-tokens.ts`, `semantic-tokens.ts`) by decomposing monolithic functions into highly cohesive sub-methods.
- **Performance & Optimization**: Refactored the internal state logic in React `ThemeProvider` to use React `useRef` for static `ThemeRuntime` initialization, implemented clean nullish coalescing assignments (`??=`), and memoized the context value to eliminate duplicate consumer component re-renders.

### Changed

- **Monorepo**: All packages and documentation version aligned to 2.2.3; dependency and install examples updated.

## [2.0.2] - 2026-05-02

### Changed

- **Monorepo**: All packages and documentation version aligned to 2.0.2; dependency and install examples updated.

## [2.0.1] - 2026-03-04

### Fixed

- **Playground**: ThemeRuntime no longer re-created every render; held in state with effect-based init/destroy.
- **React ThemeContext**: Single init effect with proper cleanup (removed duplicate `runtime.init()`).
- **Remix/Next theme providers**: Effect dependencies fixed; refs used to avoid stale closures; `runtime.destroy()` on cleanup.
- **Build**: Removed unused `cookieMaxAge` destructure in `generateSSRHead` (ssr-utils) to fix TS6133.

### Added

- **Playground**: Error boundary, lazy-loaded tab panels, virtualized token list (threshold 50), memoized runtime/flatTokens, manualChunks (react-vendor, tokiforge), tab a11y (ARIA + keyboard), `type="button"` on buttons, label associations.
- **Theme providers (React/Vue/Next/Remix)**: `storageKey`, `persist`, `onThemeChange`; React also supports initial theme from localStorage.
- **Tailwind plugin**: `baseSelector`, `strict`, `includeUtilities`, `excludePaths`, `customUtilityPrefix`, `tokens` (inline), `debug`, `themeMappings.boxShadow` (and lineHeight/animation in types).
- **SSR**: `cookieName` and `cookieMaxAge` in `SSRThemeOptions` and `generateSSRHead` options.
- **Core**: Generic `Plugin<TOptions>` and optional `optionsSchema` on Plugin interface.
- **Root**: Prettier config and `format` script.

### Changed

- **Playground**: Replaced `any` with proper types / `unknown` in catch; design-systems catch blocks use `unknown` + narrow.
- **Examples**: Error boundaries (react-example, nextjs-ssr-example), `type="button"` on buttons.

## [2.0.0] - 2026-01-23

### Major Release Highlights

TokiForge 2.0.0 is a major milestone release that brings together all the powerful features developed in v1.x into a stable, production-ready package. This release marks the maturity of TokiForge as a comprehensive design token and theming solution.

### Complete Feature Set

#### **Performance & Optimization**

- **Caching System**: Multi-tier caching with Memory, localStorage, IndexedDB, and Service Worker strategies
- **Lazy Loading**: Progressive token chunk loading with CDN support and preloading
- **Compression**: Built-in Gzip and Brotli compression for optimized bundle sizes
- **Bundle Size**: Core package remains under 3KB gzipped

#### **Accessibility Features**

- **High Contrast Mode**: Automatic WCAG AAA compliance with system preference detection
- **Reduced Motion**: Respects user motion preferences with automatic CSS injection
- **Color Blind Support**: Protanopia, deuteranopia, and tritanopia color transformations
- **Font Scaling**: System preference detection with manual scaling controls
- **WCAG Compliance**: Built-in contrast checking and validation

#### **Advanced Token Features**

- **Token Functions**: Color functions (`darken`, `lighten`, `mix`, `alpha`) and math operations
- **Expressions**: Mathematical expressions with CSS `calc()` support
- **Smart References**: Token references with fallback chains (`{token.path || fallback}`)
- **Token Scoping**: Component-level token isolation and management
- **Theming API**: Fluent builder pattern for programmatic theme creation
- **Validation Plugins**: Custom validation rules with plugin system
- **Transformation Pipeline**: Chainable token transformations before export

#### **Framework Support**

- **React**: Full hooks support with `useTheme`, `useToken`, and `ThemeProvider`
- **Vue 3**: Composition API with `useTheme` and `useToken` composables
- **Svelte 5**: Reactive stores with full Runes support
- **Angular 17+**: Signals-based reactivity with dependency injection
- **Next.js 14+**: App Router with SSR utilities and `<ThemeScript>`
- **Remix**: Server-side rendering with cookie-based persistence
- **Astro**: Static site generation with island architecture support
- **Solid.js**: Fine-grained reactivity with signal-based theming
- **SvelteKit**: Full-stack framework support with SSR

#### **Developer Tools**

- **Powerful CLI**: Initialize, build, validate, analyze, diff, and watch tokens
- **TypeScript Support**: Full type safety with autocomplete and IntelliSense
- **Token Analytics**: Usage tracking and bundle impact analysis
- **CI/CD Integration**: Automated validation for PRs with visual regression testing
- **Figma Sync**: Bidirectional sync with conflict resolution
- **Storybook Addon**: Theme switcher and token viewer in Storybook
- **Design Tool Adapters**: Sketch and Adobe XD integration

#### **SSR & Production Ready**

- **SSR Utilities**: FOUC prevention with hydration-safe theme switching
- **Cookie Persistence**: Server-side theme detection and management
- **Critical CSS**: Inline critical theme styles for optimal loading
- **CDN Support**: Token distribution via CDN with version management
- **Multi-tenant**: Support for multiple design systems in one application

### **Migration from 1.x**

#### Breaking Changes

- All package versions updated to 2.0.0
- Internal dependencies now use ^2.0.0 range
- CDN URLs updated to `@tokiforge/core@2.0.0`

#### Upgrade Path

```bash
# Update all packages
npm install @tokiforge/core@2.0.0 @tokiforge/react@2.0.0
# Or with other frameworks
npm install @tokiforge/core@2.0.0 @tokiforge/vue@2.0.0
```

### **Package Updates**

- All 16 packages updated to 2.0.0
- Unified dependency versions across ecosystem
- Improved package exports and module resolution
- Enhanced TypeScript definitions

### **What's Next**

- Visual regression testing enhancements
- Design token registry for team collaboration
- Enhanced IDE extensions (VSCode, WebStorm)
- Real-time Figma collaboration
- Advanced analytics and usage insights

### Changed

- **Major Version Bump**: Updated all packages to 2.0.0
- **Dependencies**: Updated all @tokiforge internal dependencies to ^2.0.0
- **Breaking Change**: This version introduces a new major release with updated package versions

## [1.2.0] - 2025-12-10

### Added

- Performance optimization features (caching, lazy loading, compression)
- Accessibility features (high contrast, reduced motion, color blind support, font scaling)
- Advanced token features (functions, expressions, references with fallbacks, scoping, theming API)
- Integrations (Storybook, enhanced Figma sync, design tools, CMS, design system tools)

## [1.1.2] - 2025-11-12

### Fixed

- **Vue Package**: Fixed package.json exports configuration - removed redundant `default` field from exports that was causing resolution issues
- **Angular Package**: Fixed package.json exports configuration - removed redundant `default` field and duplicate `typings` field
- **Package Exports**: Standardized all packages to use modern export pattern (`type: module` with `.cjs`/`.js` extensions)
- **TypeScript Errors**: Fixed all 12 TypeScript compilation errors:
  - Added missing `generateReport()` method to `TokenAnalytics` class
  - Added missing `exportJSON()` method to `FigmaDiff` class
  - Added missing `validateAliases()` method to `TokenParser` class
  - Added missing `getContrastRatio()` method to `ColorUtils` class
  - Added missing `generateReport()` method to `CICDValidator` class
  - Fixed unused variables in `accessibility-utils.ts`, `token-exporter.ts`, and `token-versioning.ts`
  - Updated CLI commands to use correct API methods and type annotations

### Changed

- **Version Bump**: All packages updated from 1.1.1 to 1.1.2
- **Package Exports**: Standardized all framework packages (React, Svelte, Angular, Tailwind, Figma) to use modern export pattern matching Core and Vue packages
- **Export Structure**: All packages now consistently use:
  - `"type": "module"` for explicit ESM support
  - `index.cjs` for CommonJS exports
  - `index.js` for ESM exports
  - Proper `exports` field without redundant `default` entries
- **Dependencies**: All internal dependencies updated to `@tokiforge/core@^1.1.2`
- **Documentation**: Updated all documentation files to reflect version 1.1.2

### Technical Improvements

- **Package Consistency**: All packages now use the same modern export pattern for better compatibility with modern bundlers (Vite, Webpack 5+, Rollup)
- **Export Best Practices**: Removed problematic `default` field from exports to follow Node.js package exports best practices
- **Type Safety**: Maintained full TypeScript support with proper type definitions

## [1.1.1] - 2025-11-12

### Fixed

- **Core Package**: Fixed Vitest configuration timeout issue on Windows - changed from forks to threads pool to resolve "Timeout starting forks runner" error

### Changed

- **Version Bump**: All packages updated from 1.1.0 to 1.1.1
- **Documentation**: Updated all documentation files to reflect version 1.1.1
- **Dependencies**: All internal dependencies updated to `@tokiforge/core@^1.1.1`

### Technical Improvements

- **Code Cleanup**: Removed unnecessary comments from source files (tsup configs, stub files, example files)
- **Documentation**: Removed unnecessary comments and markdown sections from documentation
- **Release Template**: Updated release template to be version-agnostic
- **Test Configuration**: Improved Vitest configuration for better Windows compatibility and explicit test file patterns

## [1.1.0] - 2025-11-11

### Fixed

- **Vue Package**: Fixed package.json exports to match actual build output - changed from `index.mjs`/`index.js` to `index.cjs`/`index.js` to correctly handle ESM/CJS exports when `"type": "module"` is set (resolves "Failed to resolve entry" errors)
- **Vue Package**: Fixed localStorage mock in test environment to properly handle all required methods
- **Vue Package**: Improved error handling for localStorage access with better fallback support
- **Vue Package**: Fixed error handling tests to properly catch Vue setup function errors using errorHandler
- **Vue Package**: Enhanced production code quality by removing test-specific comments
- **Core Package**: Fixed package.json exports to match actual build output (index.js for ESM, index.cjs for CJS)
- **Build System**: Fixed `build:all` script to work correctly with npm workspaces
- **Build System**: Added `build:all` stubs to all workspace packages to prevent npm workspace script resolution issues

### Changed

- **Version Bump**: All packages updated from 1.0.0 to 1.1.0
- **Dependency Updates**: All internal dependencies updated to `@tokiforge/core@^1.1.0`
- **Code Quality**: Improved error handling and code cleanup across Vue package
- **Build Scripts**: Updated `build:all` script to include playground and documentation packages

### Technical Improvements

- **Package Exports**: Fixed Vue package exports to correctly handle ESM/CJS module resolution when `"type": "module"` is set, matching Core package configuration
- **Test Reliability**: All Vue package tests now pass consistently
- **Production Ready**: Removed unnecessary comments and improved code maintainability
- **Error Handling**: Better error handling for localStorage operations in various environments
- **Build System**: Improved build script organization and workspace compatibility

## [1.0.0] - 2025-11-07

### Added

#### Token Versioning & Deprecation Support

- **Token Versioning**: Track token versions with metadata (introduced, deprecated, removed dates)
- **Deprecation Management**: Detect and filter deprecated tokens
- **Migration Helpers**: Automated token migration with replacement tracking
- **Version Validation**: Validate token versions against minimum requirements

#### Scoped Component Themes

- **Per-Component Theming**: Scoped token namespaces for individual components
- **Component Theme Registration**: Register and manage component-specific themes
- **Scoped CSS Generation**: Generate CSS with component-scoped variable names

#### Plugin API

- **Extensible Plugin System**: Create custom exporters, validators, and formatters
- **Plugin Manager**: Centralized plugin registration and management
- **Custom Exporters**: Build custom token export formats
- **Custom Validators**: Create token validation rules
- **Custom Formatters**: Transform tokens with custom logic

#### Accessibility Dashboard

- **Contrast Ratio Calculations**: WCAG-compliant contrast checking
- **Accessibility Metrics**: WCAG AA/AAA compliance checking
- **Motion Preference Detection**: Respect user motion preferences
- **Color-Blind Safety Checks**: Verify color combinations for accessibility
- **Accessibility Reports**: Comprehensive accessibility analysis

#### Responsive & State-Aware Tokens

- **Breakpoint-Based Tokens**: Responsive token variations by breakpoint
- **State-Based Tokens**: Hover, active, focus, disabled, loading states
- **Responsive CSS Generation**: Generate media query-based CSS
- **State CSS Generation**: Generate state-based CSS classes
- **Token Flattening**: Flatten tokens for specific breakpoints or states

#### Figma ↔ Code Diff Tool

- **Token Comparison**: Compare Figma and codebase tokens
- **Diff Reports**: Detailed reports of added, removed, and changed tokens
- **Color Tolerance**: Configurable color comparison with tolerance
- **JSON Export**: Export diff results as JSON

#### CI/CD Integration

- **Automated Validation**: Token validation in CI pipelines
- **Accessibility Checks**: Automated accessibility compliance checking
- **Deprecation Detection**: Automated deprecation warnings
- **Figma Sync Validation**: Automated Figma sync checks
- **Exit Codes**: Proper exit codes for CI integration

#### Design Token Analytics

- **Usage Tracking**: Track token usage across projects
- **Bundle Impact Analysis**: Analyze token impact on bundle size
- **Unused Token Detection**: Identify unused tokens
- **Coverage Reports**: Token usage coverage metrics
- **Size Estimation**: Estimate token size impact

#### Versioned Token Registry

- **Multi-Team Support**: Manage tokens across multiple teams
- **Version Management**: Track token versions per team
- **Token Tagging**: Organize tokens with tags
- **Conflict Detection**: Detect token conflicts between teams
- **Registry Merging**: Merge multiple token registries

#### IDE Extension Support

- **Token Hover Information**: Hover previews for tokens
- **Autocomplete Support**: Token path autocomplete
- **Token Documentation**: Generate token documentation
- **Context-Aware Suggestions**: Smart token suggestions based on context
- **VSCode Integration**: Ready for VSCode extension development

#### CLI Enhancements

- **validate Command**: CI/CD token validation
- **figma:diff Command**: Compare Figma and code tokens
- **analytics Command**: Generate token analytics reports
- **Enhanced Error Messages**: Better error reporting and diagnostics

#### Tailwind CSS Integration

- **Tailwind Config Generation**: Generate Tailwind config from tokens
- **CSS Variable Support**: Use CSS variables in Tailwind config
- **Token Mapping**: Custom theme key mappings

#### Figma Integration

- **Pull Tokens from Figma**: Sync tokens from Figma files
- **Push Tokens to Figma**: Sync tokens to Figma (limited API support)
- **Figma API Client**: Full Figma API integration

### Changed

- **Version Bump**: All packages updated from 0.2.1 to 1.0.0
- **Breaking Changes**: Some API changes for better consistency
- **Type System**: Enhanced type definitions for new features
- **Documentation**: Comprehensive documentation updates

### Technical Improvements

- **Modular Architecture**: Better separation of concerns
- **Performance Optimizations**: Improved token parsing and processing
- **Type Safety**: Enhanced TypeScript types throughout
- **Error Handling**: Better error messages and diagnostics
- **Code Quality**: Improved code organization and maintainability

## [0.2.1] - 2025-11-06

### Changed

- **Version Bump**: All packages updated from 0.2.0 to 0.2.1
- **Dependency Updates**: All internal dependencies updated to `@tokiforge/core@^0.2.1`
- **Documentation**: All documentation files updated with v0.2.1 version references
  - Updated installation commands across all guides
  - Updated CDN links to reflect new version
  - Updated version badges in all documentation pages

### Fixed

- **Git Ignore**: Comprehensive `.gitignore` updates to prevent unnecessary files from being committed
  - Added recursive patterns for build outputs (`dist/`, `build/`)
  - Added patterns for documentation build outputs (`.vitepress/dist/`, `.vitepress/cache/`)
  - Added patterns for example build outputs
  - Added patterns for source maps and cache directories
  - Improved VS Code extension output exclusions

## [0.2.0] - 2025-10-06

### Added

- **Angular 17+ Support**: Full Angular adapter with `ThemeService` using Angular Signals
  - SSR-safe implementation with `@angular/ssr` support
  - Angular 19+ recommended for full Signals support
  - Standalone component support
  - Complete example project in `examples/angular-example`
- **SEO Optimization**: Comprehensive SEO improvements
  - Enhanced meta tags and Open Graph tags for documentation
  - Structured data (JSON-LD) for better search engine visibility
  - FAQ section in README for long-tail keyword optimization
  - Improved package.json descriptions and keywords
- **Documentation Improvements**:
  - Added FAQ section covering common questions
  - Enhanced installation instructions for all frameworks
  - Improved framework comparison and feature descriptions

### Fixed

- **Build Warnings**: Resolved all build warnings across examples
  - Fixed Node.js built-in module stubs for browser compatibility
  - Removed unnecessary comments from stub files
  - Fixed Vite CJS deprecation warnings by using ES modules
  - Updated bundle size budgets for Angular example
- **TypeScript Configuration**:
  - Fixed Svelte example tsconfig.json to work independently
  - Updated root tsconfig.json to properly exclude examples
  - Resolved TypeScript declaration file errors
- **Example Projects**:
  - Fixed light theme text visibility issues
  - Standardized button styling across all examples
  - Improved color contrast for better accessibility
  - Fixed React example button visibility and styling

### Changed

- **Version Bump**: All packages updated from 0.1.0 to 0.2.0
- **Peer Dependencies**: Updated to reference `@tokiforge/core@^0.2.0`
- **Vite Configurations**: Migrated to ES modules syntax for all Vite-based examples
- **Code Cleanup**: Removed unnecessary comments from stub files and configs

### Technical Improvements

- Angular `ThemeService` simplified to use runtime browser detection instead of `PLATFORM_ID` injection
- All examples now use consistent stub implementations for Node.js built-ins
- Improved error handling and type safety across framework adapters

## [0.1.0] - 2025-09-01

### Added

- Core design token engine (`@tokiforge/core`)
- React adapter (`@tokiforge/react`)
- Vue adapter (`@tokiforge/vue`)
- Svelte adapter (`@tokiforge/svelte`)
- CLI tool (`tokiforge-cli`)
- Runtime theme switching with CSS variables
- Smart color utilities (lighten, darken, generate shades)
- Auto dark theme generation
- Token parser and exporter
- Framework-agnostic theming system
- Complete documentation and examples

[1.1.2]: https://github.com/tokiforge/tokiforge/compare/v1.1.1...v1.1.2
[1.1.1]: https://github.com/tokiforge/tokiforge/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/tokiforge/tokiforge/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/tokiforge/tokiforge/compare/v0.2.1...v1.0.0
[0.2.1]: https://github.com/tokiforge/tokiforge/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/tokiforge/tokiforge/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/tokiforge/tokiforge/releases/tag/v0.1.0
