---
title: Performance Guide | TokiForge
description: Optimize TokiForge for maximum performance. Learn about bundle size, caching, lazy loading, compression, and performance optimization strategies.
---

# Performance Guide

Optimize TokiForge for maximum performance.

## Bundle Size

TokiForge is optimized for minimal bundle size:

- **Core**: <3KB gzipped
- **React adapter**: <2KB gzipped
- **Vue adapter**: <2KB gzipped
- **Angular adapter**: <2KB gzipped
- **Svelte adapter**: <2KB gzipped

**Note:** With static mode, you can achieve zero JavaScript overhead by generating CSS at build time!

## Runtime Performance

### CSS Variables

TokiForge uses CSS custom properties, which are:

- **Native** - No JavaScript overhead
- **Fast** - Browser-optimized
- **Instant** - Theme switching is immediate

### Theme Switching

Switching themes:

```typescript
runtime.applyTheme('dark');
```

No re-renders needed with CSS variables!

## Optimization Tips

### 1. Use Static Mode

For best performance, use static mode with body classes:

```typescript
provideTheme(themeConfig, {
  mode: 'static',
});

// Angular
themeService.init(themeConfig, {
  mode: 'static',
});
```

Static mode:
- ✅ Zero JavaScript overhead
- ✅ Instant theme switching
- ✅ Better for SSR
- ✅ Smaller bundle (no runtime injection)

### 2. Generate CSS at Build Time

Generate CSS files at build time for static sites:

```typescript
import { generateCombinedThemeCSS } from '@tokiforge/vue';
import { writeFileSync } from 'fs';

const css = generateCombinedThemeCSS(themeConfig);
writeFileSync('src/themes/generated.css', css);
```

### 3. Use CSS Variables

Prefer CSS variables over JavaScript tokens:

```css
/* ✅ Fast - CSS variables */
.button {
  background: var(--hf-color-primary);
}

/* ❌ Slower - JavaScript tokens */
.button {
  background: tokens.color.primary;
}
```

### 2. Lazy Load Themes

Load themes on demand:

```typescript
async function loadTheme(name: string) {
  const tokens = await import(`./themes/${name}.json`);
  runtime.addTheme({ name, tokens });
}
```

### 3. Cache Parsed Tokens

Parse tokens once:

```typescript
const parsedTokens = TokenParser.parse('./tokens.json');
```

### 4. Minimize Token File Size

Keep token files small:

- Remove unused tokens
- Use references instead of duplicating values
- Compress JSON (remove whitespace)

### 5. Preload Critical Themes

Preload themes you'll need:

```typescript
runtime.applyTheme('dark');
runtime.applyTheme('light');
```

## Server-Side Rendering

TokiForge works with SSR:

```typescript
if (typeof window !== 'undefined') {
  runtime.init();
}
```

## Memory Usage

TokiForge is memory-efficient:

- Themes stored in Map (O(1) lookup)
- CSS injected once per theme
- No memory leaks (proper cleanup)

## Benchmarking

Measure performance:

```typescript
console.time('theme-switch');
runtime.applyTheme('dark');
console.timeEnd('theme-switch');
```

## Best Practices

1. **Use CSS variables** - Best performance
2. **Lazy load themes** - Load on demand
3. **Cache tokens** - Parse once
4. **Minimize tokens** - Remove unused
5. **Preload critical** - Load important themes early

## Next Steps

- See [Core Concepts](/guide/core-concepts) for fundamentals
- Check [Theming Guide](/guide/theming) for theme strategies


