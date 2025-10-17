# Getting Started

Welcome to TokiForge! This guide will help you get up and running in minutes.

## What is TokiForge?

TokiForge is a modern design token and theming engine that lets you:

- **Define tokens once** - Use them across any framework or platform
- **Switch themes instantly** - Runtime theme switching without rebuilds
- **Export to any format** - CSS, SCSS, JS, TS, or JSON
- **Stay type-safe** - Full TypeScript support out of the box

## Installation

### Core Package

```bash
npm install @tokiforge/core
```

### Framework Adapters

Choose your framework:

```bash
# React
npm install @tokiforge/react

# Vue
npm install @tokiforge/vue

# Svelte
npm install @tokiforge/svelte
```

### CLI Tool

```bash
npm install -g TokiForge-cli
# or
npx TokiForge-cli init
```

## Quick Example

### 1. Define Your Tokens

Create a `tokens.json` file:

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
  "radius": {
    "sm": { "value": "4px", "type": "dimension" },
    "lg": { "value": "12px", "type": "dimension" }
  }
}
```

### 2. Use in Your App

**React:**

```tsx
import { ThemeProvider, useTheme } from '@tokiforge/react';

const themeConfig = {
  themes: [
    { name: 'light', tokens: tokens },
    { name: 'dark', tokens: darkTokens },
  ],
  defaultTheme: 'light',
};

function App() {
  return (
    <ThemeProvider config={themeConfig}>
      <Button />
    </ThemeProvider>
  );
}

function Button() {
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

**Vue:**

```vue
<script setup>
import { provideTheme, useTheme } from '@tokiforge/vue';

provideTheme(themeConfig);
const { tokens, setTheme } = useTheme();
</script>

<template>
  <button
    :style="{
      backgroundColor: tokens.color.primary,
      borderRadius: tokens.radius.lg,
    }"
    @click="setTheme('dark')"
  >
    Switch Theme
  </button>
</template>
```

**Svelte:**

```svelte
<script>
import { createThemeStore } from '@tokiforge/svelte';

const themeStore = createThemeStore(themeConfig);
</script>

<button
  style="background-color: var(--hf-color-primary); border-radius: var(--hf-radius-lg);"
  on:click={() => themeStore.setTheme('dark')}
>
  Switch Theme
</button>
```

## Next Steps

- Read the [Installation Guide](/guide/installation) for detailed setup
- Check out [Framework Guides](/guide/react) for framework-specific instructions
- Explore [Examples](/examples/react) to see TokiForge in action
- Learn about [Core Concepts](/guide/core-concepts) to understand how it works


