# 🌈 TokiForge — The Modern Design Token & Theme Engine

> **Forge your colors. Shape your UI.**

TokiForge is a next-generation **open-source design token and theming engine** built for developers and designers who demand elegance, speed, and consistency. **Works with any framework** — React, Vue, Svelte, Angular, Next.js, Remix, Solid, Qwik, or even vanilla JavaScript. TokiForge lets you define, sync, and switch your themes effortlessly.

**Keywords:** design tokens, theme engine, theming library, CSS variables, design system, runtime theming, React theming, Vue theming, Angular theming, Svelte theming, theme switching, dark mode, light mode, color tokens, design tokens library, frontend theming, token parser, style dictionary alternative

---

## 🧩 Overview

TokiForge provides a **framework-agnostic, runtime theming system** powered by **CSS custom properties**, **design tokens**, and **live theme management**. It bridges the gap between design tools (like Figma) and production-ready codebases with zero friction.

### ⚡ Why TokiForge?

Other tools focus on either design export or complex setups. TokiForge combines:

* 🧠 **Intelligent design-token management**
* ⚙️ **Runtime theme switching** (light/dark/brand-based)
* 💅 **Framework-agnostic adapters**
* 🪄 **Figma integration and token sync**
* 🧰 **CLI + Dashboard for instant configuration**

In short — it's your **complete color and theme infrastructure**, built for the future of frontend design systems.

---

## 🏗️ Architecture

### Core Components

**1. Token Engine (`@tokiforge/core`)**

* Defines and manages design tokens (colors, typography, spacing, radii, etc.)
* Converts JSON/YAML tokens → CSS, SCSS, JS, or TS.
* Supports versioning and live reload.

**2. Runtime Engine**

* Uses CSS variables with smart fallbacks for legacy browsers.
* Enables instant theme switching without reloading or recompiling.
* Optimized for <3KB gzipped footprint.

**3. Framework Adapters**

* React: `@tokiforge/react` → useTheme(), ThemeProvider
* Vue: `@tokiforge/vue` → composables for reactivity
* Svelte: `@tokiforge/svelte` → reactive bindings
* Angular: `@tokiforge/angular` → ThemeService with Signals
* **Any Framework**: `@tokiforge/core` → Works with Next.js, Remix, Solid, Qwik, Astro, and more!
* Vanilla: pure JS API

**4. CLI Tool (`tokiforge-cli`)**

* Initialize tokens: `npx tokiforge init`
* Generate exports: `tokiforge build`
* Preview themes: `tokiforge dev`

**5. Design Integration**

* **Figma Plugin:** sync design tokens bidirectionally
* **Style Dictionary Bridge:** full compatibility with Amazon's style-dictionary
* **Accessibility Checks:** color contrast validation built-in

---

## 🧱 System Diagram

```
   ┌──────────────────────────────┐
   │         Figma Plugin         │
   │ (Design Tokens & Styles)     │
   └─────────────┬────────────────┘
                 │  Sync via API
   ┌─────────────▼───────────────┐
   │      TokiForge Core Engine   │
   │  - Token Parser/Validator   │
   │  - Runtime CSS Generator    │
   └─────────────┬───────────────┘
                 │
   ┌─────────────▼───────────────┐
   │   Framework Adapters        │
   │ (React/Vue/Svelte/Angular)  │
   └─────────────┬───────────────┘
                 │
   ┌─────────────▼───────────────┐
   │  UI Components / App Code   │
   │   Consuming TokiForge Tokens │
   └──────────────────────────────┘
```

---

## 🚀 Key Features

### 🎨 Theming

* **Static Mode** - Zero JS overhead with body class-based theming
* **Dynamic Mode** - Runtime CSS injection for flexible theming
* Light/Dark/System theme switching with automatic detection
* Custom brand themes (e.g., multiple clients)
* Contextual theming for nested components
* **Auto-generate dark themes** from light themes
* **Smooth theme transitions** with animation tokens
* **Automatic localStorage persistence** - Theme preferences saved automatically

### 🧠 Design Tokens

* JSON/YAML schema for token definition
* Auto export to CSS, JS, TS, SCSS
* Type-safe token usage
* **Smart color utilities** - auto-generate shades, tints, palettes
* **Color manipulation** - lighten, darken, saturate, desaturate

### ⚙️ Developer Experience

* `tokiforge dev` – local preview playground
* `tokiforge lint` – validates token consistency
* `tokiforge build` – generates final token bundle
* **CSS Generation Utilities** - Generate theme CSS files at build time
* **VS Code extension** - autocomplete, live preview, theme switcher
* **Hot reload** - watch tokens and auto-rebuild

### 💡 Designer Integration

* Figma → Code sync (bidirectional)
* **Accessibility dashboard** - WCAG compliance checker
* Visual token diff between versions
* **Theme playground** - shareable preview URLs

### 🌟 Advanced Features

* **AI-powered theme generator** - generate palettes from a single color
* **Accessibility helpers** - auto-fix contrast issues
* **Color palette generation** - create harmonious color schemes
* **Contrast ratio calculator** - ensure WCAG compliance

---

## 🔥 Why TokiForge is Better

| Feature                   | TokiForge | Others                    |
| ------------------------- | -------- | ------------------------- |
| Real-time theme switching | ✅        | ⚠️ Often rebuild required |
| **Zero JS overhead (static mode)** | ✅ | ❌ Always requires JS runtime |
| Multi-framework support   | ✅        | ❌ Usually React-only      |
| Type-safe token exports   | ✅        | ⚠️ Partial or manual      |
| Figma bidirectional sync  | ✅        | ❌ One-way export only     |
| CLI + Visual Playground   | ✅        | ⚠️ Missing or paid        |
| CSS-native runtime        | ✅        | ⚠️ JS-heavy runtime       |
| <3KB gzipped size         | ✅        | ❌ Bloated builds          |
| **Auto localStorage persistence** | ✅ | ❌ Manual implementation |
| **System theme detection** | ✅ | ❌ Manual implementation |
| Accessibility validation  | ✅        | ❌ Missing                 |
| **Smart color utilities** | ✅        | ❌ Manual color manipulation |
| **Auto dark theme gen**   | ✅        | ❌ Manual creation         |
| **AI palette generator**  | 🚧 Coming | ❌ Not available           |
| **VS Code extension**     | 🚧 Coming | ⚠️ Limited support         |

---

## 🏠 Local Usage

For local development and testing, see [LOCAL_USAGE.md](./LOCAL_USAGE.md) for detailed instructions.

**Quick Start:**
```bash
# Build all packages
npm run build

# Link all packages for local use
npm run link:all

# Use in your project
npm link @tokiforge/core @tokiforge/react
```

---

## 🌐 Global Usage

For global CLI installation, see [GLOBAL_USAGE.md](./GLOBAL_USAGE.md) for detailed instructions.

**Quick Start:**
```bash
# Install CLI globally from local source
npm run install:global

# Or install from npm (when published)
npm install -g tokiforge-cli

# Use anywhere
tokiforge init
tokiforge build
tokiforge dev
```

---

## 📦 Installation

Install TokiForge for your framework:

```bash
# React
npm install @tokiforge/core @tokiforge/react

# Vue
npm install @tokiforge/core @tokiforge/vue

# Angular
npm install @tokiforge/core @tokiforge/angular

# Svelte
npm install @tokiforge/core @tokiforge/svelte

# Vanilla JavaScript / Any Framework
npm install @tokiforge/core
```

## 🧠 Example Usage

**Define tokens (`tokens.json`):**

```json
{
  "color": {
    "primary": { "value": "#7C3AED" },
    "accent": { "value": "#06B6D4" },
    "text": { "value": "#F8FAFC" }
  },
  "radius": { "sm": { "value": "4px" }, "lg": { "value": "12px" } }
}
```

**Use in React:**

```tsx
import { useTheme } from '@tokiforge/react';

export function Button() {
  const { tokens, setTheme } = useTheme();
  return (
    <button
      style={{
        backgroundColor: tokens.color.primary,
        borderRadius: tokens.radius.lg,
      }}
      onClick={() => setTheme('dark')}
    >
      Switch Theme
    </button>
  );
}
```

**Smart Color Utilities:**

```tsx
import { ColorUtils } from '@tokiforge/core';

// Auto-generate shades from a base color
const shades = ColorUtils.generateShades('#7C3AED', 10);
// Returns: { '0': '#000000', '100': '#...', ..., '900': '#ffffff' }

// Generate accessible colors (WCAG compliant)
const accessible = ColorUtils.findAccessibleColor('#000000', '#ffffff', 'AA');
// Automatically adjusts color if contrast is insufficient

// Auto-generate dark theme from light theme
const darkTheme = ColorUtils.generateDarkTheme(lightTokens);
// Intelligently inverts colors while maintaining design intent

// Generate harmonious color palette
const palette = ColorUtils.generatePalette('#7C3AED', 5);
// Creates complementary colors for your design system
```

---

## 🧠 Philosophy

TokiForge was designed around three guiding principles:

1. **Universal Compatibility:** Works with any stack — web, mobile, or design tools.
2. **Declarative Design:** Define tokens once, use everywhere.
3. **Performance + Simplicity:** Lightweight, fast, and developer-first.

---

## 🧬 Roadmap (2026)

* [x] MVP: Core engine + React adapter
* [x] CLI tooling
* [x] Vue/Svelte/Angular adapters
* [x] **Smart color utilities** - lighten, darken, generate shades
* [x] **Auto dark theme generation**
* [x] **Angular 17+ support** with Signals and SSR
* [ ] **VS Code Extension** - autocomplete & live preview
* [ ] **Theme Playground** - shareable preview URLs
* [ ] **Accessibility Dashboard** - WCAG compliance checker
* [ ] **Figma Plugin** - bidirectional sync
* [ ] **AI-powered palette generator**
* [ ] **Visual Token Studio** - web-based editor
* [ ] **Tailwind CSS plugin**
* [ ] **Storybook integration**

---

## 🌟 Community & Contribution

Join our open-source family at [github.com/tokiforge/tokiforge](https://github.com/tokiforge/tokiforge) ❤️

### How to Contribute

1. Fork the repo
2. Create a feature branch (`feat/runtime-optimization`)
3. Submit a PR with examples

We welcome designers, frontend devs, and design-system engineers.

### Star Us on GitHub

If you find TokiForge useful, please consider giving us a ⭐ on [GitHub](https://github.com/tokiforge/tokiforge). Your support helps us grow!

---

## 💬 License

MIT License — free for personal and commercial use.

---

## ❓ Frequently Asked Questions (FAQ)

### What is TokiForge?

TokiForge is a framework-agnostic design token and theming engine that enables runtime theme switching using CSS custom properties. It works with React, Vue, Svelte, Angular, and any other JavaScript framework.

### How does TokiForge compare to Style Dictionary?

TokiForge provides runtime theme switching capabilities that Style Dictionary doesn't offer. While Style Dictionary focuses on build-time token transformation, TokiForge adds a lightweight runtime engine (<3KB) for dynamic theme management.

### Does TokiForge support dark mode?

Yes! TokiForge has built-in support for light/dark themes and can automatically generate dark themes from light theme tokens using smart color utilities.

### Is TokiForge production-ready?

Yes, TokiForge is production-ready with support for React, Vue, Svelte, and Angular. It's optimized for performance with a <3KB gzipped runtime footprint.

### Can I use TokiForge with TypeScript?

Absolutely! TokiForge is written in TypeScript and provides full type safety for design tokens and theme configurations.

### Does TokiForge work with SSR (Server-Side Rendering)?

Yes, TokiForge is SSR-safe and works with Next.js, Remix, Angular SSR, and other SSR frameworks. The Angular adapter specifically supports `@angular/ssr`.

### How do I install TokiForge?

```bash
npm install @tokiforge/core @tokiforge/react  # For React
npm install @tokiforge/core @tokiforge/vue   # For Vue
npm install @tokiforge/core @tokiforge/angular # For Angular
npm install @tokiforge/core @tokiforge/svelte # For Svelte
```

### What browsers does TokiForge support?

TokiForge uses CSS custom properties (CSS variables) which are supported in all modern browsers. It includes fallbacks for legacy browser support.

---

## 🧠 Credits

Built with 💜 by the TokiForge Community — inspired by the intersection of **design and code**.

> *TokiForge — The future of frontend theming begins here.*



