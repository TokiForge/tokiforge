# Changelog

All notable changes to TokiForge will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[1.1.1]: https://github.com/tokiforge/tokiforge/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/tokiforge/tokiforge/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/tokiforge/tokiforge/compare/v0.2.1...v1.0.0
[0.2.1]: https://github.com/tokiforge/tokiforge/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/tokiforge/tokiforge/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/tokiforge/tokiforge/releases/tag/v0.1.0

