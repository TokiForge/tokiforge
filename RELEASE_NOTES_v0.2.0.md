# TokiForge v0.2.0 Release Notes

## 🎉 Major Release: Angular Support & SEO Optimization

We're excited to announce TokiForge v0.2.0! This release brings full Angular support, comprehensive SEO improvements, and numerous bug fixes.

## ✨ What's New

### 🅰️ Angular 17+ Support

- **Complete Angular Adapter**: Full `@tokiforge/angular` package with `ThemeService`
- **Angular Signals Integration**: Native support for Angular's reactive Signals API
- **SSR-Safe**: Works seamlessly with `@angular/ssr` (Angular Universal replacement)
- **Standalone Components**: Full support for Angular's standalone component architecture
- **Production Ready**: Tested with Angular 17, 18, and 19
- **Complete Example**: Full working example in `examples/angular-example`

### 🔍 SEO Optimization

- **Enhanced Meta Tags**: Comprehensive Open Graph and Twitter Card tags
- **Structured Data**: JSON-LD schema markup for better search visibility
- **FAQ Section**: Added to README for long-tail keyword optimization
- **Improved Keywords**: Enhanced package.json with 20+ SEO keywords
- **Documentation SEO**: Optimized VitePress documentation site

### 🐛 Bug Fixes

- **Build Warnings**: All build warnings resolved across all examples
- **TypeScript Errors**: Fixed declaration file and type errors
- **Browser Compatibility**: Proper Node.js built-in stubs for all frameworks
- **Vite Config**: Migrated to ES modules (removed CJS deprecation warnings)
- **Example Issues**: Fixed text visibility, button styling, and color contrast

### 📚 Documentation

- **FAQ Section**: 8 common questions answered
- **Installation Guide**: Framework-specific installation instructions
- **Improved Examples**: All examples now work perfectly
- **Better Navigation**: Enhanced documentation structure

## 📦 Packages Updated

All packages bumped to v0.2.0:
- `@tokiforge/core@0.2.0`
- `@tokiforge/react@0.2.0`
- `@tokiforge/vue@0.2.0`
- `@tokiforge/svelte@0.2.0`
- `@tokiforge/angular@0.2.0` (NEW!)
- `tokiforge-cli@0.2.0`

## 🚀 Quick Start

### Install for Angular

```bash
npm install @tokiforge/core @tokiforge/angular
```

### Install for Other Frameworks

```bash
# React
npm install @tokiforge/core @tokiforge/react

# Vue
npm install @tokiforge/core @tokiforge/vue

# Svelte
npm install @tokiforge/core @tokiforge/svelte
```

## 📝 Migration Guide

If you're upgrading from v0.1.0:

1. **Update dependencies**:
   ```bash
   npm install @tokiforge/core@^0.2.0 @tokiforge/react@^0.2.0
   ```

2. **No breaking changes**: All APIs remain compatible

3. **New Angular users**: Check out `examples/angular-example` for a complete example

## 🔗 Links

- [Full Changelog](./CHANGELOG.md)
- [Documentation](https://github.com/tokiforge/tokiforge)
- [GitHub Repository](https://github.com/tokiforge/tokiforge)

## 🙏 Thank You

Thank you to all contributors and users who helped make this release possible!

---

**Release Date**: January 6, 2026  
**Version**: 0.2.0

