<div align="center">

# 🌈 TokiForge

**Framework-agnostic design token engine for React, Vue, Angular, Svelte & vanilla JS**

[![GitHub stars](https://img.shields.io/github/stars/TokiForge/tokiforge?style=social)](https://github.com/TokiForge/tokiforge/stargazers)
[![npm version](https://img.shields.io/npm/v/@tokiforge/core?label=version)](https://www.npmjs.com/package/@tokiforge/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)
[![Bundle Size](https://img.shields.io/badge/bundle%20size-%3C3KB-green.svg)](https://bundlephobia.com/package/@tokiforge/core)

[Documentation](https://tokiforge.github.io/tokiforge) • [Examples](./examples) • [Report Bug](https://github.com/TokiForge/tokiforge/issues) • [Request Feature](https://github.com/TokiForge/tokiforge/issues)

</div>

---

## ✨ Features

- 🚀 **Framework-agnostic** - Works with React, Vue, Angular, Svelte, Next.js, Remix, Solid, Qwik, or vanilla JS
- 🎨 **Runtime theme switching** - Change themes instantly without page reload
- 📦 **Lightweight** - Less than 3KB gzipped
- 🔒 **Full TypeScript support** - Type-safe tokens with autocomplete
- 🛠️ **Powerful CLI** - Initialize, build, validate, and analyze tokens
- 🎯 **CSS custom properties** - Native browser support with smart fallbacks
- 🌓 **Dark mode ready** - Built-in light/dark theme support
- 🔄 **Token versioning** - Track versions, deprecations, and migrations
- 🎭 **Component theming** - Scoped themes for individual components
- 🔌 **Plugin system** - Extensible with custom exporters and validators
- ♿ **Accessibility** - Built-in WCAG compliance checking and contrast analysis
- 📱 **Responsive tokens** - Breakpoint and state-aware token variations
- 🔍 **Figma sync** - Compare and sync tokens with Figma designs
- ✅ **CI/CD ready** - Automated validation for PRs and pipelines
- 📊 **Analytics** - Token usage tracking and bundle impact analysis
- 📚 **Multi-team support** - Versioned token registry for design systems
- 💻 **IDE support** - Autocomplete and hover previews (VSCode ready)
- 🎨 **Tailwind integration** - Generate Tailwind config from tokens

---

## 🚀 Quick Start

### Installation

```bash
# React
npm install @tokiforge/core @tokiforge/react

# Vue
npm install @tokiforge/core @tokiforge/vue

# Angular
npm install @tokiforge/core @tokiforge/angular

# Svelte
npm install @tokiforge/core @tokiforge/svelte

# Vanilla JS / Any Framework
npm install @tokiforge/core
```

### Basic Usage

**1. Define your tokens (`tokens.json`):**

```json
{
  "color": {
    "primary": { "value": "#7C3AED", "type": "color" },
    "accent": { "value": "#06B6D4", "type": "color" },
    "text": {
      "primary": { "value": "#1F2937", "type": "color" },
      "secondary": { "value": "#6B7280", "type": "color" }
    }
  },
  "spacing": {
    "sm": { "value": "8px", "type": "dimension" },
    "md": { "value": "16px", "type": "dimension" },
    "lg": { "value": "24px", "type": "dimension" }
  },
  "radius": {
    "sm": { "value": "4px", "type": "dimension" },
    "lg": { "value": "12px", "type": "dimension" }
  }
}
```

**2. Use in React:**

```tsx
import { ThemeProvider, useToken } from '@tokiforge/react';
import tokens from './tokens.json';

function App() {
  return (
    <ThemeProvider tokens={tokens} defaultTheme="light">
      <Button />
    </ThemeProvider>
  );
}

function Button() {
  const primaryColor = useToken('color.primary');
  const spacing = useToken('spacing.md');
  const radius = useToken('radius.lg');
  
  return (
    <button
      style={{
        backgroundColor: primaryColor,
        padding: spacing,
        borderRadius: radius,
      }}
    >
      Click me
    </button>
  );
}
```

**3. Switch themes at runtime:**

```tsx
import { useTheme } from '@tokiforge/react';

function ThemeSwitcher() {
  const { setTheme, currentTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme(currentTheme === 'light' ? 'dark' : 'light')}>
      Switch to {currentTheme === 'light' ? 'dark' : 'light'} mode
    </button>
  );
}
```

👉 **[View full documentation →](https://tokiforge.dev)**

---

## 🎯 Why TokiForge?

| Feature | TokiForge | Others |
|---------|-----------|--------|
| Runtime theme switching | ✅ | ⚠️ Often requires rebuild |
| Framework-agnostic | ✅ | ❌ Usually framework-specific |
| TypeScript support | ✅ | ⚠️ Partial or manual |
| Bundle size | ✅ <3KB | ❌ Often larger |
| CSS custom properties | ✅ | ⚠️ JS-heavy runtime |
| Zero JS overhead (static mode) | ✅ | ❌ Always requires JS |

---

## 📦 Packages

| Package | Description | npm |
|---------|-------------|-----|
| `@tokiforge/core` | Core engine (works with any framework) | [![npm](https://img.shields.io/npm/v/@tokiforge/core)](https://www.npmjs.com/package/@tokiforge/core) |
| `@tokiforge/react` | React adapter with hooks | [![npm](https://img.shields.io/npm/v/@tokiforge/react)](https://www.npmjs.com/package/@tokiforge/react) |
| `@tokiforge/vue` | Vue 3 composables | [![npm](https://img.shields.io/npm/v/@tokiforge/vue)](https://www.npmjs.com/package/@tokiforge/vue) |
| `@tokiforge/angular` | Angular service with Signals | [![npm](https://img.shields.io/npm/v/@tokiforge/angular)](https://www.npmjs.com/package/@tokiforge/angular) |
| `@tokiforge/svelte` | Svelte stores | [![npm](https://img.shields.io/npm/v/@tokiforge/svelte)](https://www.npmjs.com/package/@tokiforge/svelte) |
| `tokiforge-cli` | CLI tool for token management | [![npm](https://img.shields.io/npm/v/tokiforge-cli)](https://www.npmjs.com/package/tokiforge-cli) |

---

## 🏗️ Architecture

```
┌──────────────────────────────┐
│      Design Tokens (JSON)    │
│   (colors, spacing, etc.)    │
└─────────────┬────────────────┘
              │
┌─────────────▼───────────────┐
│   TokiForge Core Engine     │
│  - Token Parser/Validator    │
│  - Runtime CSS Generator     │
│  - Theme Manager             │
└─────────────┬───────────────┘
              │
┌─────────────▼───────────────┐
│   Framework Adapters        │
│ (React/Vue/Angular/Svelte)  │
└─────────────┬───────────────┘
              │
┌─────────────▼───────────────┐
│   Your Application          │
│   Using Design Tokens       │
└──────────────────────────────┘
```

---

## 🎨 Framework Examples

### React

```tsx
import { ThemeProvider, useToken } from '@tokiforge/react';

function App() {
  return (
    <ThemeProvider tokens={tokens}>
      <Component />
    </ThemeProvider>
  );
}
```

### Vue

```vue
<script setup>
import { useToken } from '@tokiforge/vue';

const primaryColor = useToken('color.primary');
</script>
```

### Angular

```typescript
import { ThemeService } from '@tokiforge/angular';

constructor(private themeService: ThemeService) {
  const primaryColor = this.themeService.getToken('color.primary');
}
```

### Svelte

```svelte
<script>
  import { useToken } from '@tokiforge/svelte';
  const primaryColor = useToken('color.primary');
</script>
```

### Vanilla JS

```javascript
import { ThemeRuntime } from '@tokiforge/core';

const runtime = new ThemeRuntime(tokens);
const primaryColor = runtime.getToken('color.primary');
runtime.applyTheme('dark');
```

👉 **[View complete examples →](./examples)**

---

## 🛠️ CLI Tool

Install the CLI globally:

```bash
npm install -g tokiforge-cli
```

**Commands:**

```bash
# Initialize a new token file
tokiforge init

# Build tokens to CSS/SCSS/JS
tokiforge build

# Start development server with live preview
tokiforge dev

# Validate token schema
tokiforge lint

# Validate tokens for CI/CD
tokiforge validate [--strict] [--figma]

# Compare Figma ↔ Code tokens
tokiforge figma:diff --token TOKEN --file-key KEY

# Generate token analytics
tokiforge analytics
```

---

## 📚 Documentation

- **[Getting Started](https://tokiforge.dev/guide/getting-started)** - Quick setup guide
- **[Installation](https://tokiforge.dev/guide/installation)** - Framework-specific setup
- **[React Guide](https://tokiforge.dev/guide/react)** - React integration
- **[Vue Guide](https://tokiforge.dev/guide/vue)** - Vue integration
- **[Angular Guide](https://tokiforge.dev/guide/angular)** - Angular integration
- **[Svelte Guide](https://tokiforge.dev/guide/svelte)** - Svelte integration
- **[Examples](./examples)** - Complete example projects

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. ⭐ **Star the project** - It helps others discover TokiForge
2. 🐛 **Report bugs** - Open an issue on GitHub
3. 💡 **Suggest features** - Share your ideas
4. 🔧 **Submit PRs** - Fix bugs or add features
5. 📖 **Improve docs** - Help make documentation better

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

**Quick start for contributors:**

```bash
# Clone the repo
git clone https://github.com/TokiForge/tokiforge.git
cd tokiforge

# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm test
```

---

## ❓ FAQ

<details>
<summary><b>What is TokiForge?</b></summary>

TokiForge is a framework-agnostic design token and theming engine that enables runtime theme switching using CSS custom properties. It works with React, Vue, Svelte, Angular, and any other JavaScript framework.
</details>

<details>
<summary><b>How does TokiForge compare to Style Dictionary?</b></summary>

TokiForge provides runtime theme switching capabilities that Style Dictionary doesn't offer. While Style Dictionary focuses on build-time token transformation, TokiForge adds a lightweight runtime engine (<3KB) for dynamic theme management.
</details>

<details>
<summary><b>Does TokiForge support dark mode?</b></summary>

Yes! TokiForge has built-in support for light/dark themes and can automatically generate dark themes from light theme tokens.
</details>

<details>
<summary><b>Is TokiForge production-ready?</b></summary>

Yes, TokiForge is production-ready with support for React, Vue, Svelte, and Angular. It's optimized for performance with a <3KB gzipped runtime footprint.
</details>

<details>
<summary><b>Can I use TokiForge with TypeScript?</b></summary>

Absolutely! TokiForge is written in TypeScript and provides full type safety for design tokens and theme configurations.
</details>

<details>
<summary><b>Does TokiForge work with SSR?</b></summary>

Yes, TokiForge is SSR-safe and works with Next.js, Remix, Angular SSR, and other SSR frameworks.
</details>

---

## 🗺️ Roadmap

### ✅ Completed (v1.0.0)
- [x] Core engine + React adapter
- [x] Vue/Svelte/Angular adapters
- [x] CLI tooling
- [x] TypeScript support
- [x] Token versioning & deprecation
- [x] Component theming
- [x] Plugin system
- [x] Accessibility dashboard
- [x] Responsive & state-aware tokens
- [x] Figma sync & diff tool
- [x] CI/CD integration
- [x] Token analytics
- [x] Versioned token registry
- [x] IDE support (API ready)
- [x] Tailwind CSS integration

### 🚧 In Progress (v1.1.0+)
- [ ] Enhanced semantic tokens & aliasing
- [ ] Multi-platform exporters (iOS, Android, React Native)
- [ ] Type generation CLI (`generate:types`)
- [ ] Enhanced Tailwind plugin format
- [ ] CLI enhancements (`migrate`, `watch`)
- [ ] Zero-JS + SSR improvements
- [ ] Enhanced Figma integration (Tokens Studio)

### 📋 Planned
- [ ] VS Code extension
- [ ] Visual playground enhancements
- [ ] CI/Visual regression integration
- [ ] Enhanced usage analytics
- [ ] Community plugin examples

📖 **[View Full Roadmap →](./ROADMAP.md)** | **[Implementation Plan →](./IMPLEMENTATION_PLAN.md)**

---

## 📄 License

MIT License — free for personal and commercial use.

---

## 🙏 Acknowledgments

Built with 💜 by the TokiForge Community.

Inspired by the intersection of **design and code**.

---

<div align="center">

**⭐ If you find TokiForge useful, please consider giving it a star on GitHub! ⭐**

[![Star History Chart](https://api.star-history.com/svg?repos=TokiForge/tokiforge&type=Date)](https://star-history.com/#TokiForge/tokiforge&Date)

Made with ❤️ by [TokiForge Community](https://github.com/TokiForge)

</div>
