---
title: Vue API Reference | TokiForge
description: Complete API reference for @tokiforge/vue package. Vue 3 composables, provideTheme, and theme management for Vue applications.
---

# Vue API Reference

Complete API reference for `@tokiforge/vue` package.

---

## provideTheme()

Provide theme context to child components.

```typescript
function provideTheme<T extends DesignTokens = DesignTokens>(
  config: ThemeConfig,
  options?: ThemeInitOptions
): ThemeContext<T>
```

**Parameters:**
- `config: ThemeConfig` - Theme configuration
- `options?: ThemeInitOptions` - Initialization options

**Returns:** `ThemeContext<T>` - Theme context object

**Example:**
```vue
<script setup>
import { provideTheme } from '@tokiforge/vue';

const { theme, tokens, setTheme, availableThemes } = provideTheme({
  themes: [
    {
      name: 'light',
      tokens: {
        color: {
          primary: { value: '#3b82f6' },
          background: { value: '#ffffff' },
        },
      },
    },
    {
      name: 'dark',
      tokens: {
        color: {
          primary: { value: '#60a5fa' },
          background: { value: '#1f2937' },
        },
      },
    },
  ],
  defaultTheme: 'light',
}, {
  mode: 'dynamic',
  persist: true,
  selector: ':root',
  prefix: 'app',
});
</script>

<template>
  <div>
    <p>Current theme: {{ theme }}</p>
    <button @click="setTheme('dark')">Switch to Dark</button>
  </div>
</template>
```

---

## useTheme()

Access theme context in child components.

```typescript
function useTheme<T extends DesignTokens = DesignTokens>(): ThemeContext<T>
```

**Returns:** `ThemeContext<T>` - Theme context object

**Throws:**
- Error if called outside of theme provider

**Example:**
```vue
<script setup>
import { useTheme } from '@tokiforge/vue';

const { theme, tokens, setTheme, nextTheme } = useTheme();

const handleThemeToggle = async () => {
  await nextTheme();
};
</script>

<template>
  <button @click="handleThemeToggle">
    Toggle Theme (Current: {{ theme }})
  </button>
</template>
```

---

## ThemeContext

Returned by `provideTheme()` and `useTheme()`.

### Properties

#### theme

```typescript
theme: Ref<string>
```

Reactive reference to current theme name.

**Example:**
```vue
<script setup>
const { theme } = useTheme();
</script>

<template>
  <p>Active theme: {{ theme }}</p>
</template>
```

---

#### tokens

```typescript
tokens: Ref<T>
```

Reactive reference to current theme tokens.

**Example:**
```vue
<script setup>
const { tokens } = useTheme();
</script>

<template>
  <div :style="{ color: tokens.color.primary.value }">
    Styled with tokens
  </div>
</template>
```

---

#### availableThemes

```typescript
availableThemes: ComputedRef<string[]>
```

Computed ref of available theme names.

**Example:**
```vue
<script setup>
const { availableThemes, setTheme } = useTheme();
</script>

<template>
  <select @change="setTheme($event.target.value)">
    <option v-for="t in availableThemes" :key="t" :value="t">
      {{ t }}
    </option>
  </select>
</template>
```

---

### Methods

#### setTheme()

```typescript
setTheme(themeName: string): Promise<void>
```

Switch to a different theme.

**Parameters:**
- `themeName: string` - Theme to switch to

**Throws:**
- Error if theme doesn't exist

**Example:**
```vue
<script setup>
const { setTheme } = useTheme();

const switchToDark = async () => {
  await setTheme('dark');
  console.log('Theme switched!');
};
</script>
```

---

#### nextTheme()

```typescript
nextTheme(): Promise<void>
```

Switch to the next theme in rotation.

**Example:**
```vue
<script setup>
const { nextTheme } = useTheme();
</script>

<template>
  <button @click="nextTheme">Next Theme</button>
</template>
```

---

#### generateCSS()

```typescript
generateCSS(themeName?: string): string
```

Generate CSS for a theme (static mode only).

**Parameters:**
- `themeName?: string` - Theme name (defaults to current)

**Returns:** `string` - CSS output

**Example:**
```vue
<script setup>
const { generateCSS } = useTheme();

const downloadCSS = () => {
  const css = generateCSS('dark');
  const blob = new Blob([css], { type: 'text/css' });
  // ... download logic
};
</script>
```

---

## ThemeInitOptions

Configuration options for theme initialization.

```typescript
interface ThemeInitOptions {
  selector?: string;        // CSS selector (default: ':root')
  prefix?: string;          // Variable prefix (default: 'hf')
  mode?: 'dynamic' | 'static'; // Mode (default: 'dynamic')
  persist?: boolean;        // LocalStorage persistence (default: true)
  watchSystemTheme?: boolean; // Watch system theme (default: false)
  bodyClassPrefix?: string; // Class prefix for static mode (default: 'theme')
  defaultTheme?: string;    // Override default theme
}
```

### mode Options

#### Dynamic Mode (Recommended)

```vue
<script setup>
provideTheme(config, {
  mode: 'dynamic',
  selector: ':root',
  prefix: 'app',
});
</script>
```

**Features:**
- CSS variables injected at runtime
- Theme switching without page reload
- Full token access in components
- Smooth transitions

**Best for:** SPAs, complex applications, frequent theme changes

---

#### Static Mode

```vue
<script setup>
provideTheme(config, {
  mode: 'static',
  bodyClassPrefix: 'theme',
});
</script>
```

**Features:**
- Class-based theme switching
- Pre-generated CSS classes
- Smaller runtime overhead

**Best for:** Static sites, simple applications

---

## Composable Patterns

### Theme Switcher

```vue
<script setup>
import { useTheme } from '@tokiforge/vue';

const { theme, availableThemes, setTheme } = useTheme();
</script>

<template>
  <div class="theme-switcher">
    <button
      v-for="t in availableThemes"
      :key="t"
      :class="{ active: theme === t }"
      @click="setTheme(t)"
    >
      {{ t }}
    </button>
  </div>
</template>
```

---

### System Theme Sync

```vue
<script setup>
import { provideTheme } from '@tokiforge/vue';
import { watch } from 'vue';

const config = { /* ... */ };

const { runtime } = provideTheme(config, {
  watchSystemTheme: true, // Auto-sync with system
});
</script>
```

---

### Lazy Loading Themes

```vue
<script setup>
import { provideTheme } from '@tokiforge/vue';

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
  ],
};

provideTheme(config);
</script>
```

---

### Accessing Tokens in Script

```vue
<script setup>
import { useTheme, computed } from 'vue';

const { tokens } = useTheme();

const primaryColor = computed(() => tokens.value.color.primary.value);

console.log(primaryColor.value); // '#3b82f6'
</script>
```

---

## TypeScript Support

Full TypeScript support with generic types:

```typescript
import { provideTheme, useTheme } from '@tokiforge/vue';

interface MyTokens {
  color: {
    primary: { value: string };
    background: { value: string };
  };
  spacing: {
    sm: { value: string };
    md: { value: string };
  };
}

// Type-safe theme context
const { tokens } = provideTheme<MyTokens>(config);

// Auto-complete and type checking
tokens.value.color.primary.value; // ✅ string
tokens.value.invalid; // ❌ Type error
```

---

## SSR Support

### Nuxt 3

```vue
<!-- app.vue -->
<script setup>
import { provideTheme } from '@tokiforge/vue';
import { useCookie } from '#app';

const themeCookie = useCookie('theme');

provideTheme(config, {
  defaultTheme: themeCookie.value || 'light',
});
</script>
```

### Vue SSR

```typescript
// server.ts
app.get('*', (req, res) => {
  const themeCookie = req.cookies.theme || 'light';
  
  const html = renderToString(app, {
    theme: themeCookie,
  });
  
  res.send(html);
});
```

---

## See Also

- [Core API](/api/core)
- [React API](/api/react)
- [Best Practices](/guides/best-practices)
- [Performance Guide](/guides/performance)
