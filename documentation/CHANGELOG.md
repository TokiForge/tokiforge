# Changelog

## v2.0.1 - Patch Release (2026-03-04)

- Frontend audit: playground ThemeRuntime/effect cleanup, React ThemeContext single init, Remix/Next effect deps and cleanup, error boundaries, a11y (tab ARIA/keyboard, button types, labels), Prettier, reduced `any`/`unknown` in catch.
- Plugin options: Tailwind (baseSelector, strict, includeUtilities, excludePaths, tokens, debug, themeMappings), theme providers (storageKey, persist, onThemeChange), SSR (cookieName, cookieMaxAge), core Plugin<TOptions> + optionsSchema.
- Fix: unused cookieMaxAge destructure in generateSSRHead removed.

## v2.0.0 - Major Release: Production-Ready Design Token Engine

**Release Date**: January 23, 2026

### Overview

TokiForge 2.0.0 represents a major milestone in design token management. This release consolidates all features from the 1.x series into a stable, production-ready package with comprehensive framework support, advanced accessibility features, and powerful developer tools.

### **Complete Feature Ecosystem**

#### Performance & Bundle Optimization

- **Multi-Tier Caching**: Memory, localStorage, IndexedDB, Service Worker
- **Lazy Loading**: Progressive chunk loading with CDN distribution
- **Compression**: Automatic Gzip/Brotli compression
- **Tiny Bundle**: Core <3KB gzipped, framework adapters <2KB each

#### Universal Framework Support

- **React 16.8+**: Hooks API with `useTheme`, `useToken`, SSR support
- **Vue 3.0+**: Composition API with reactivity system integration
- **Svelte 5.0+**: Runes support with reactive stores
- **Angular 17+**: Signals-based with dependency injection
- **Next.js 14+**: App Router, Server Components, SSR utilities
- **Remix 2.0+**: Full-stack with cookie persistence
- **Astro 4.0+**: Static generation with islands
- **Solid.js 1.8+**: Fine-grained reactivity
- **SvelteKit 2.0+**: SSR with form actions
- **Vanilla JS**: Framework-agnostic core

#### Advanced Token System

- **Token Functions**: `darken()`, `lighten()`, `mix()`, `alpha()`, math operations
- **Expressions**: CSS `calc()` support with token references
- **Smart References**: Fallback chains `{token || fallback || default}`
- **Component Scoping**: Isolated token namespaces per component
- **Theming API**: Fluent builder for programmatic theme creation
- **Type Safety**: Full TypeScript with autocomplete and IntelliSense

#### Accessibility & Compliance

- **High Contrast**: WCAG AAA compliance with auto-enhancement
- **Reduced Motion**: System preference respect with CSS injection
- **Color Blind Modes**: Protanopia, deuteranopia, tritanopia support
- **Font Scaling**: Large text support with system detection
- **Contrast Checking**: Automated WCAG validation
- **Keyboard Navigation**: Full keyboard accessibility

#### Developer Experience

- **CLI Tools**: `init`, `build`, `validate`, `analyze`, `diff`, `watch`, `migrate`
- **Token Analytics**: Usage tracking, bundle impact, dead token detection
- **CI/CD Ready**: GitHub Actions, GitLab CI, automated PR validation
- **Visual Regression**: Playwright integration for theme testing
- **Hot Reload**: Watch mode with instant updates
- **Error Messages**: Actionable error messages with suggestions

#### Integrations & Ecosystem

- **Figma Sync**: Bidirectional sync with conflict resolution
- **Storybook Addon**: Theme switcher, token viewer, documentation
- **Tailwind Plugin**: Generate config from tokens
- **Design Tools**: Sketch, Adobe XD adapters
- **CMS Integration**: Headless CMS token management
- **Version Control**: Token versioning with deprecation tracking

#### SSR & Production Features

- **SSRUtils**: FOUC prevention with `<ThemeScript>`
- **Cookie Persistence**: Server-side theme detection
- **Critical CSS**: Inline critical styles for performance
- **Hydration Safe**: No client-server mismatch
- **CDN Ready**: Distribute tokens via CDN
- **Edge Compatible**: Works on Cloudflare, Vercel Edge

### **By The Numbers**

- **16 Packages**: Complete ecosystem coverage
- **<3KB**: Core package size (gzipped)
- **<1ms**: Theme switch performance
- **500+**: Test cases across packages
- **100+**: Documentation pages
- **10+**: Framework integrations
- **WCAG AAA**: Accessibility compliance

### **Upgrade Guide**

#### From 1.x to 2.0.0

**No Breaking API Changes** - All 1.x APIs remain compatible!

```bash
# Update packages
npm install @tokiforge/core@2.0.0
npm install @tokiforge/react@2.0.0  # or your framework
```

**What's Changed:**

- Version numbers unified to 2.0.0
- Internal dependencies updated to ^2.0.0
- CDN URLs: `@tokiforge/core@2.0.0`
- Enhanced TypeScript definitions
- Improved tree-shaking

**Migration Checklist:**

- [ ] Update package.json versions
- [ ] Update CDN URLs (if using)
- [ ] Run `npm install`
- [ ] Test theme switching
- [ ] Verify SSR (if applicable)
- [ ] Update CI/CD scripts

### **Use Cases**

**Perfect for:**

- **Design Systems**: Multi-brand, multi-theme design systems
- **Enterprise Apps**: Whitelabeling, tenant-specific themes
- **Dark Mode**: Light/dark/auto theme switching
- **Accessibility**: WCAG-compliant color systems
- **Component Libraries**: Theme-aware UI components
- **Multi-Platform**: Web, mobile, desktop consistency
- **Prototyping**: Rapid theme experimentation
- **Data Visualization**: Dynamic color palettes

### **Documentation**

- [Full Documentation](https://tokiforge.github.io/tokiforge)
- [Quick Start Guide](https://tokiforge.github.io/tokiforge/guide/quick-start)
- [API Reference](https://tokiforge.github.io/tokiforge/api)
- [Examples](https://github.com/TokiForge/tokiforge/tree/main/examples)
- [Video Tutorials](https://tokiforge.github.io/tokiforge/tutorials)

### **Acknowledgments**

Thank you to all contributors, testers, and early adopters who helped shape TokiForge 2.0.0!

---

## v1.2.0 - New Features

### Performance Features

- ✅ **Caching Integration**: Built-in caching support in ThemeRuntime

  - Memory, localStorage, IndexedDB, and Service Worker strategies
  - Multi-tier caching with CacheManager
  - Automatic cache management

- ✅ **Lazy Loading**: Progressive token chunk loading

  - `loadChunk()` method for on-demand loading
  - CDN support for token distribution
  - Preloading capabilities

- ✅ **Compression**: Token compression utilities
  - Gzip and Brotli compression
  - Base64 encoding support
  - Automatic compression for localStorage

### Accessibility Features

- ✅ **High Contrast Mode**: Automatic detection and support

  - System preference detection
  - Color enhancement for WCAG AAA compliance
  - Theme variant support

- ✅ **Reduced Motion**: Respect user motion preferences

  - Automatic CSS injection
  - Disables animations and transitions
  - System preference detection

- ✅ **Color Blind Mode**: Support for color vision deficiencies

  - Protanopia, deuteranopia, tritanopia support
  - Automatic color transformations
  - Manual mode control

- ✅ **Font Size Scaling**: Support for larger font sizes
  - System preference detection
  - Manual scaling control
  - Configurable base size

### Advanced Token Features

- ✅ **Token Functions**: Computed token values

  - Color functions: `darken()`, `lighten()`, `mix()`, `alpha()`
  - Math functions: `add()`, `subtract()`, `multiply()`, `divide()`
  - Unit functions: `px()`, `rem()`, `em()`
  - Custom function registration

- ✅ **Token Expressions**: Mathematical expressions

  - Basic operations: `+`, `-`, `*`, `/`
  - CSS `calc()` support
  - Token reference integration

- ✅ **References with Fallbacks**: Safe token references

  - Syntax: `{token.path || fallback}`
  - Multiple fallback levels
  - Type-safe fallbacks

- ✅ **Token Scoping**: Component-scoped tokens

  - Create scoped token sets
  - Extract component tokens
  - Apply scope metadata

- ✅ **Theming API**: Programmatic theme creation

  - Fluent builder pattern
  - Theme extension and overriding
  - Variant creation

- ✅ **Validation Plugins**: Custom validation rules

  - Plugin registration system
  - Token-level validation
  - Global validation support

- ✅ **Transformation Pipeline**: Transform tokens before export
  - Chainable transformations
  - Built-in transformations
  - Custom transformation steps

### Integrations

- ✅ **Storybook Addon**: Theme management in Storybook

  - Theme switcher in toolbar
  - Token viewer panel
  - Automatic initialization

- ✅ **Enhanced Figma Sync**: Improved Figma integration

  - Conflict resolution strategies
  - Sync status detection
  - Better error handling

- ✅ **Design Tool Adapters**: Sketch and Adobe XD support

  - Export/import tokens
  - Color style conversion
  - Plugin-ready architecture

- ✅ **CMS Integration**: Headless CMS support

  - Contentful adapter
  - Strapi adapter
  - Sanity adapter
  - Custom adapter base class

- ✅ **Design System Tools**: Zeroheight and InVision DSM
  - Push/pull tokens
  - Sync with merge strategies
  - API integration

### Documentation Updates

- ✅ New guide: Performance Optimization
- ✅ New guide: Accessibility Features
- ✅ New guide: Advanced Token Features
- ✅ New guide: Integrations
- ✅ Updated API documentation
- ✅ Updated examples
