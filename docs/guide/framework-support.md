# Framework Support

TokiForge is **framework-agnostic** and works with **any frontend framework** or even vanilla JavaScript!

## How It Works

TokiForge uses **CSS custom properties** (CSS variables) under the hood, which are supported by all modern browsers and work with any framework that can use CSS.

## Officially Supported Frameworks

We provide dedicated adapters for these popular frameworks:

### React
```bash
npm install @tokiforge/react
```
- Full React hooks support
- `ThemeProvider` component
- `useTheme()` hook
- See [React Guide](/guide/react)

### Vue
```bash
npm install @tokiforge/vue
```
- Vue 3 Composition API
- `provideTheme()` composable
- `useTheme()` composable
- See [Vue Guide](/guide/vue)

### Svelte
```bash
npm install @tokiforge/svelte
```
- Svelte stores
- `createThemeStore()` function
- Reactive theme management
- See [Svelte Guide](/guide/svelte)

## Works With Any Framework

Since TokiForge uses CSS variables, it works with **any framework**:

### Angular

```typescript
import { ThemeRuntime } from '@tokiforge/core';

@Component({
  selector: 'app-root',
  template: `<div class="app">...</div>`,
  styles: [`
    .app {
      background: var(--hf-color-background-default);
      color: var(--hf-color-text-primary);
    }
  `]
})
export class AppComponent {
  runtime = new ThemeRuntime(config);
  
  ngOnInit() {
    this.runtime.init();
  }
}
```

### Next.js

```tsx
// Works with both Pages Router and App Router
import { ThemeProvider } from '@tokiforge/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ThemeProvider config={themeConfig}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Remix

```tsx
// app/root.tsx
import { ThemeProvider } from '@tokiforge/react';

export default function App() {
  return (
    <html>
      <body>
        <ThemeProvider config={themeConfig}>
          <Outlet />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Solid.js

```tsx
import { createSignal, onMount } from 'solid-js';
import { ThemeRuntime } from '@tokiforge/core';

function App() {
  const [theme, setTheme] = createSignal('light');
  const runtime = new ThemeRuntime(config);
  
  onMount(() => {
    runtime.init();
    runtime.applyTheme(theme());
  });
  
  return (
    <div style={{ background: 'var(--hf-color-background-default)' }}>
      Content
    </div>
  );
}
```

### Qwik

```tsx
import { ThemeRuntime } from '@tokiforge/core';
import { useVisibleTask$ } from '@builder.io/qwik';

export default component$(() => {
  const runtime = new ThemeRuntime(config);
  
  useVisibleTask$(() => {
    runtime.init();
  });
  
  return (
    <div style={{ background: 'var(--hf-color-background-default)' }}>
      Content
    </div>
  );
});
```

### Preact

```tsx
import { useTheme } from '@tokiforge/react';
// Works with Preact via React compatibility layer
```

### Astro

```astro
---
// Component script
import { ThemeRuntime } from '@tokiforge/core';

const runtime = new ThemeRuntime(config);
---

<div style="background: var(--hf-color-background-default)">
  Content
</div>

<script>
  // Client-side hydration
  if (typeof window !== 'undefined') {
    runtime.init();
  }
</script>
```

### Web Components / Lit

```typescript
import { ThemeRuntime } from '@tokiforge/core';
import { LitElement, css, html } from 'lit';

class MyElement extends LitElement {
  static styles = css`
    :host {
      background: var(--hf-color-background-default);
      color: var(--hf-color-text-primary);
    }
  `;
  
  connectedCallback() {
    super.connectedCallback();
    const runtime = new ThemeRuntime(config);
    runtime.init();
  }
  
  render() {
    return html`<div>Content</div>`;
  }
}
```

### Vanilla JavaScript

```html
<script type="module">
  import { ThemeRuntime } from '@tokiforge/core';
  
  const runtime = new ThemeRuntime({
    themes: [{ name: 'default', tokens: myTokens }],
  });
  
  runtime.init();
</script>

<style>
  body {
    background: var(--hf-color-background-default);
    color: var(--hf-color-text-primary);
  }
</style>
```

## Why It Works Everywhere

1. **CSS Variables** - Native browser feature, no JS required for rendering
2. **Runtime Engine** - Pure JavaScript, framework-agnostic
3. **No Dependencies** - Core package has no framework dependencies
4. **Universal API** - Same API works across all frameworks

## Framework-Specific Features

### Server-Side Rendering (SSR)

TokiForge is SSR-safe and works with:
- Next.js
- Remix
- SvelteKit
- Nuxt
- Astro
- Any SSR framework

The runtime automatically detects server environments:

```typescript
if (typeof window !== 'undefined') {
  runtime.init(); // Only runs in browser
}
```

### Static Site Generation (SSG)

Works with:
- Next.js (Static Export)
- Gatsby
- Astro
- Vite SSG
- Any SSG tool

CSS variables are injected at build time or runtime.

## Using Core Package Directly

For frameworks without official adapters, use the core package:

```bash
npm install @tokiforge/core
```

```typescript
import { ThemeRuntime } from '@tokiforge/core';

const runtime = new ThemeRuntime({
  themes: [
    { name: 'light', tokens: lightTokens },
    { name: 'dark', tokens: darkTokens },
  ],
  defaultTheme: 'light',
});

// Initialize
runtime.init();

// Use CSS variables in your styles
// var(--hf-color-primary)
```

## Creating Custom Adapters

You can create custom adapters for any framework:

```typescript
// Example: Custom adapter pattern
import { ThemeRuntime } from '@tokiforge/core';

export function createThemeAdapter(config) {
  const runtime = new ThemeRuntime(config);
  
  return {
    init() {
      runtime.init();
    },
    getTheme() {
      return runtime.getCurrentTheme();
    },
    setTheme(name) {
      runtime.applyTheme(name);
    },
    // Framework-specific logic here
  };
}
```

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Full support

CSS custom properties are supported in all modern browsers (IE11 not supported).

## Next Steps

- See [Getting Started](/guide/getting-started) for installation
- Check [Core API](/api/core) for direct usage
- Explore [Examples](/examples/react) for framework examples


