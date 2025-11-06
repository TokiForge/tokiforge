# Changelog

All notable changes to TokiForge will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

## [0.2.0] - 2026-01-06

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

## [0.1.0] - Initial Release

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

[0.2.1]: https://github.com/tokiforge/tokiforge/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/tokiforge/tokiforge/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/tokiforge/tokiforge/releases/tag/v0.1.0

