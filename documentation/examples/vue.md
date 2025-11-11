# Vue Example

> **TokiForge v1.1.1**

Complete Vue example using TokiForge.

## Setup

```bash
npm install @tokiforge/vue@^1.1.1 @tokiforge/core@^1.1.1 vue
```

## Code

```vue
<template>
  <div class="app">
    <header class="header">
      <h1>TokiForge Vue Example</h1>
    </header>
    
    <main class="content">
      <p>This demonstrates theme switching with Vue.</p>
      <Button variant="primary">Primary Button</Button>
      <Button variant="accent">Accent Button</Button>
    </main>
    
    <ThemeSwitcher />
  </div>
</template>

<script setup lang="ts">
import { provideTheme, useTheme } from '@tokiforge/vue';

const lightTokens = {
  color: {
    primary: { value: '#7C3AED', type: 'color' },
    accent: { value: '#06B6D4', type: 'color' },
    text: {
      primary: { value: '#1F2937', type: 'color' },
    },
    background: {
      default: { value: '#FFFFFF', type: 'color' },
      muted: { value: '#F9FAFB', type: 'color' },
    },
  },
  radius: {
    lg: { value: '12px', type: 'dimension' },
  },
};

const darkTokens = {
  ...lightTokens,
  color: {
    ...lightTokens.color,
    text: {
      primary: { value: '#F8FAFC', type: 'color' },
    },
    background: {
      default: { value: '#0F172A', type: 'color' },
      muted: { value: '#1E293B', type: 'color' },
    },
  },
};

const themeConfig = {
  themes: [
    { name: 'light', tokens: lightTokens },
    { name: 'dark', tokens: darkTokens },
  ],
  defaultTheme: 'light',
};

provideTheme(themeConfig, {
  mode: 'static',
  persist: true,
  watchSystemTheme: false,
  bodyClassPrefix: 'theme',
  prefix: 'hf',
});
const { tokens, theme, setTheme, availableThemes } = useTheme();
</script>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Button',
  props: {
    variant: {
      type: String,
      default: 'primary',
    },
  },
});
</script>

<template>
  <button
    :style="{
      backgroundColor: variant === 'accent' ? tokens.accent : tokens.primary,
      borderRadius: tokens.radius.lg,
    }"
    class="button"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { useTheme } from '@tokiforge/vue';

const { tokens } = useTheme();
</script>
```

## Features Demonstrated

- ✅ Static mode (zero JS overhead)
- ✅ Automatic localStorage persistence
- ✅ Theme switching with composables
- ✅ CSS variables for styling
- ✅ Direct token access
- ✅ CSS generation utilities

## Next Steps

- See [Vue Guide](/guide/vue) for more details
- Check [API Reference](/api/vue) for full API docs


