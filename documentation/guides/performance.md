---
title: Performance Guide | TokiForge
description: Optimize TokiForge for maximum performance in production applications. Learn about bundle size optimization, caching strategies, and performance best practices.
---

# Performance Guide

Optimize TokiForge for maximum performance in production applications.

## Bundle Size Optimization

### Tree-Shaking

TokiForge is built with tree-shaking in mind. Import only what you need:

```typescript
// ✅ Good - tree-shakeable
import { ThemeRuntime, TokenExporter } from '@tokiforge/core';

// ❌ Bad - imports everything
import * as TokiForge from '@tokiforge/core';
```

### Framework Adapters

Each framework adapter adds ~2-5KB (gzipped):

| Package | Size (minified + gzipped) |
|---------|---------------------------|
| @tokiforge/core | ~8KB |
| @tokiforge/vue | ~3KB |
| @tokiforge/react | ~2.5KB |
| @tokiforge/angular | ~4KB |

**Recommendation:** Only install the adapter you need.

---

## Runtime Performance

### Static vs Dynamic Mode

Choose the right mode for your use case:

#### Static Mode

**Best for:** Simple websites, static sites, minimal theme switching

```typescript
provideTheme(config, {
  mode: 'static',
  bodyClassPrefix: 'theme',
});
```

**Pros:**
- ⚡ Faster initial load (no CSS injection)
- 📦 Smaller runtime overhead
- 🎨 Pre-generated CSS classes

**Cons:**
- Limited to class-based switching
- No runtime token access

**Performance:** ~0ms overhead

#### Dynamic Mode

**Best for:** Complex apps, frequent theme changes, runtime token access

```typescript
provideTheme(config, {
  mode: 'dynamic',
 selector: ':root',
  prefix: 'hf',
});
```

**Pros:**
- 🔥 Full token access
- 🎯 CSS variable updates
- 🚀 Smooth transitions

**Cons:**
- Slight overhead for CSS injection

**Performance:** ~5-10ms initial setup, <1ms for theme changes

---

## Lazy Loading Themes

For apps with many themes, lazy load them:

```typescript
const config = {
  themes: [
    {
      name: 'light',
      tokens: lightTokens, // Loaded immediately
    },
    {
      name: 'dark',
      tokens: async () => {
        const { default: darkTokens } = await import('./themes/dark');
        return darkTokens;
      },
    },
    {
      name: 'ocean',
      tokens: async () => {
        const { default: oceanTokens } = await import('./themes/ocean');
        return oceanTokens;
      },
    },
  ],
};
```

**Benefits:**
- 📉 Reduced initial bundle size
- ⚡ Faster first load
- 🎯 Load themes on-demand

**Trade-off:** Slight delay when switching to lazy-loaded theme (first time only)

---

## Token Memoization

TokiForge automatically memoizes token lookups and CSS generation:

```typescript
// First call - generates CSS (5-10ms)
runtime.applyTheme('dark', ':root', 'hf');

// Subsequent calls - uses cache (<1ms)
runtime.applyTheme('dark', ':root', 'hf');
```

**Cache invalidation:** Automatic when themes change

---

## SSR Optimization

### Server-Side Theme Detection

Prevent flash of unstyled content (FOUC):

#### Vue/Nuxt

```typescript
// server/middleware/theme.ts
export default defineEventHandler((event) => {
  const themeCookie = getCookie(event, 'theme') || 'light';
  event.context.theme = themeCookie;
});
```

```vue
<!-- app.vue -->
<script setup>
const { theme } = useRequestEvent();

provideTheme(config, {
  defaultTheme: theme,
});
</script>
```

#### Next.js

```typescript
// app/layout.tsx
import { cookies } from 'next/headers';
import { ThemeProvider } from '@tokiforge/nextjs';

export default function RootLayout({ children }) {
  const theme = cookies().get('theme')?.value || 'light';

  return (
    <html>
      <body>
        <ThemeProvider config={config} initialTheme={theme}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Result:** Zero flash, seamless hydration

---

## Build Performance

### Token Compilation

For large token sets, pre-compile tokens:

```typescript
// build/compile-tokens.ts
import { TokenExporter } from '@tokiforge/core';
import { writeFileSync } from 'fs';

const css = TokenExporter.exportCSS(tokens, {
  selector: ':root',
  prefix: 'hf',
});

writeFileSync('public/tokens.css', css);
```

**Benefits:**
- 🏗️ Faster builds (cached)
- 📦 Smaller runtime bundle
- ⚡ No runtime compilation

### Parallel Processing

For multiple themes:

```typescript
import { TokenExporter } from '@tokiforge/core';
import { writeFile } from 'fs/promises';

const themes = ['light', 'dark', 'ocean', 'sunset'];

await Promise.all(
  themes.map(async (themeName) => {
    const css = TokenExporter.exportCSS(themeTokens[themeName], {
      selector: `[data-theme="${themeName}"]`,
      prefix: 'hf',
    });
    await writeFile(`public/themes/${themeName}.css`, css);
  })
);
```

---

## Benchmarks

### Theme Switching Performance

Tested on modern hardware (M1 MacBook Pro):

| Operation | Static Mode | Dynamic Mode |
|-----------|-------------|--------------|
| Initial Load | 0ms | 8ms |
| Theme Switch | 2ms | 0.5ms |
| Token Access | N/A | <0.1ms |

### Bundle Sizes (Production)

| App Type | TokiForge + Adapter | Impact |
|----------|---------------------|--------|
| Small SPA | ~10KB (gzipped) | +1.5% |
| Medium App | ~12KB (gzipped) | +0.8% |
| Large App | ~15KB (gzipped) | +0.3% |

---

## Optimization Checklist

### Development
- [ ] Use tree-shakeable imports
- [ ] Choose appropriate mode (static vs dynamic)
- [ ] Lazy load non-essential themes
- [ ] Pre-compile tokens for production

### Production
- [ ] Enable minification
- [ ] Use gzip/brotli compression
- [ ] Implement SSR theme detection
- [ ] Cache theme CSS files
- [ ] Use CDN for static assets

### Monitoring
- [ ] Track theme switch timings
- [ ] Monitor bundle size
- [ ] Measure First Contentful Paint (FCP)
- [ ] Check Largest Contentful Paint (LCP)

---

## Advanced Techniques

### Virtual CSS

For extremely large token sets (1000+ tokens), use virtual CSS:

```typescript
// Only inject currently visible tokens
const visibleTokens = filterVisibleTokens(allTokens, viewport);
runtime.applyTokens(visibleTokens);
```

### Web Workers

Offload token processing to web workers:

```typescript
// worker.ts
import { TokenExporter } from '@tokiforge/core';

self.onmessage = ({ data }) => {
  const css = TokenExporter.exportCSS(data.tokens, data.options);
  self.postMessage({ css });
};
```

```typescript
// main.ts
const worker = new Worker('./worker.ts');
worker.postMessage({ tokens, options });
worker.onmessage = ({ data }) => {
  injectCSS(data.css);
};
```

**Use case:** Processing very large token sets without blocking main thread

---

## Performance Tips

### Colors

```typescript
// ✅ Fast - hex colors
color: { value: '#3b82f6' }

// ⚠️  Slower - computed colors
color: { value: 'rgb(59, 130, 246)' }
```

### Tokens Organization

```typescript
// ✅ Fast - shallow nesting
{
  button: {
    background: { value: '#...' }
  }
}

// ⚠️ Slower - deep nesting
{
  components: {
    interactive: {
      buttons: {
        variants: {
          primary: {
            background: { value: '#...' }
          }
        }
      }
    }
  }
}
```

**Recommendation:** Max 3-4 levels of nesting

---

## Measuring Performance

### Browser DevTools

```typescript
performance.mark('theme-start');
await runtime.applyTheme('dark');
performance.mark('theme-end');

performance.measure('theme-switch', 'theme-start', 'theme-end');
const measure = performance.getEntriesByName('theme-switch')[0];
console.log(`Theme switch took ${measure.duration}ms`);
```

### Lighthouse

Run Lighthouse audits:
- Performance score should remain >90
- First Contentful Paint <1.8s
- Time to Interactive <3.9s

---

## Real-World Example

### Before Optimization

```typescript
// All themes loaded upfront
const config = {
  themes: [light, dark, ocean, sunset, retro, neon],
};

// Bundle size: 45KB
// Initial load: 120ms
```

### After Optimization

```typescript
// Only essential theme loaded
const config = {
  themes: [
    { name: 'light', tokens: lightTokens },
    { name: 'dark', tokens: () => import('./dark') },
    { name: 'ocean', tokens: () => import('./ocean') },
    // ... rest lazy loaded
  ],
};

// Static mode for simple use case
provideTheme(config, { mode: 'static' });

// Pre-compiled CSS in production
// <link rel="stylesheet" href="/themes/light.css">

// Bundle size: 12KB (-73%)
// Initial load: 8ms (-93%)
```

---

## Summary

**Key Takeaways:**
1. Choose static mode for simple apps, dynamic for complex ones
2. Lazy load non-essential themes
3. Implement SSR theme detection
4. Pre-compile tokens in production
5. Monitor performance with DevTools

**Expected Performance:**
- Initial load: <10ms
- Theme switch: <1ms
- Bundle impact: <15KB

👉 **Next:** [Best Practices](/guides/best-practices) | [Troubleshooting](/guide/troubleshooting)
