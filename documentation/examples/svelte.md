# Svelte Example

> **TokiForge v1.1.0**

Complete Svelte example using TokiForge.

## Setup

```bash
npm install @tokiforge/svelte@^1.1.0 @tokiforge/core@^1.1.0 svelte
```

## Code

### App.svelte

```svelte
<script>
  import { createThemeStore } from '@tokiforge/svelte';
  import ThemeSwitcher from './ThemeSwitcher.svelte';
  import Card from './Card.svelte';
  import Button from './Button.svelte';

  const lightTokens = {
    color: {
      primary: { value: '#7C3AED', type: 'color' },
      accent: { value: '#06B6D4', type: 'color' },
      text: {
        primary: { value: '#1F2937', type: 'color' },
        secondary: { value: '#6B7280', type: 'color' },
      },
      background: {
        default: { value: '#FFFFFF', type: 'color' },
        muted: { value: '#F9FAFB', type: 'color' },
      },
    },
    radius: {
      sm: { value: '4px', type: 'dimension' },
      md: { value: '8px', type: 'dimension' },
      lg: { value: '12px', type: 'dimension' },
    },
    spacing: {
      xs: { value: '4px', type: 'dimension' },
      sm: { value: '8px', type: 'dimension' },
      md: { value: '16px', type: 'dimension' },
      lg: { value: '24px', type: 'dimension' },
    },
  };

  const darkTokens = {
    ...lightTokens,
    color: {
      ...lightTokens.color,
      text: {
        primary: { value: '#F8FAFC', type: 'color' },
        secondary: { value: '#CBD5E1', type: 'color' },
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

  const themeStore = createThemeStore(themeConfig);
</script>

<div class="app">
  <h1>TokiForge Svelte Example</h1>
  <p>This demonstrates theme switching with Svelte.</p>
  
  <ThemeSwitcher {themeStore} />
  <Card {themeStore} />
  <Button {themeStore} />
</div>

<style>
  .app {
    min-height: 100vh;
    padding: 2rem;
    background-color: var(--hf-color-background-default);
    color: var(--hf-color-text-primary);
    transition: background-color 0.3s, color 0.3s;
  }

  h1 {
    margin-bottom: 1rem;
  }

  p {
    margin-bottom: 2rem;
    color: var(--hf-color-text-secondary);
  }
</style>
```

### ThemeSwitcher.svelte

```svelte
<script>
  import type { ThemeStore } from '@tokiforge/svelte';

  export let themeStore: ThemeStore;
</script>

<div class="theme-switcher">
  <label>
    Theme:
    <select
      value={$themeStore.theme}
      on:change={(e) => themeStore.setTheme(e.target.value)}
    >
      {#each $themeStore.availableThemes as themeName}
        <option value={themeName}>{themeName}</option>
      {/each}
    </select>
  </label>
  <button on:click={() => themeStore.nextTheme()}>
    Next Theme
  </button>
</div>

<style>
  .theme-switcher {
    display: flex;
    gap: var(--hf-spacing-md);
    align-items: center;
    margin-bottom: var(--hf-spacing-lg);
  }

  select {
    padding: var(--hf-spacing-sm) var(--hf-spacing-md);
    border-radius: var(--hf-radius-md);
    border: 1px solid var(--hf-color-text-secondary);
    background-color: var(--hf-color-background-default);
    color: var(--hf-color-text-primary);
  }

  button {
    padding: var(--hf-spacing-md) var(--hf-spacing-lg);
    border-radius: var(--hf-radius-lg);
    border: none;
    background-color: var(--hf-color-primary);
    color: #FFFFFF;
    cursor: pointer;
    font-weight: 600;
  }
</style>
```

### Card.svelte

```svelte
<script>
  import type { ThemeStore } from '@tokiforge/svelte';

  export let themeStore: ThemeStore;
</script>

<div class="card">
  <h2>Card Component</h2>
  <p>This card uses CSS variables for theming.</p>
  <p>Try switching themes to see the colors change instantly!</p>
</div>

<style>
  .card {
    background-color: var(--hf-color-background-muted);
    color: var(--hf-color-text-primary);
    border-radius: var(--hf-radius-lg);
    padding: var(--hf-spacing-lg);
    margin-bottom: var(--hf-spacing-md);
    transition: background-color 0.3s, color 0.3s;
  }

  h2 {
    margin-top: 0;
    margin-bottom: var(--hf-spacing-md);
  }

  p {
    margin-bottom: var(--hf-spacing-sm);
    color: var(--hf-color-text-secondary);
  }
</style>
```

### Button.svelte

```svelte
<script>
  import type { ThemeStore } from '@tokiforge/svelte';

  export let themeStore: ThemeStore;

  function toggleTheme() {
    const current = $themeStore.theme;
    themeStore.setTheme(current === 'light' ? 'dark' : 'light');
  }
</script>

<button
  class="primary-button"
  on:click={toggleTheme}
  style="
    background-color: {$themeStore.tokens.color.primary.value};
    color: {$themeStore.tokens.color.text.primary.value};
    border-radius: {$themeStore.tokens.radius.lg.value};
    padding: {$themeStore.tokens.spacing.md} {$themeStore.tokens.spacing.lg};
  "
>
  Switch to {$themeStore.theme === 'light' ? 'Dark' : 'Light'} Theme
</button>

<style>
  .primary-button {
    border: none;
    cursor: pointer;
    font-size: 16px;
    font-weight: 600;
    transition: opacity 0.2s;
  }

  .primary-button:hover {
    opacity: 0.9;
  }
</style>
```

## Try It

1. Navigate to the example: `cd examples/svelte-example`
2. Install dependencies: `npm install`
3. Run dev server: `npm run dev`
4. Switch themes to see the magic! ✨

## Features Demonstrated

- ✅ Theme store creation
- ✅ Reactive theme switching
- ✅ CSS variables for styling
- ✅ Direct token access
- ✅ Svelte stores integration

## Next Steps

- See [Svelte Guide](/guide/svelte) for more details
- Check [API Reference](/api/svelte) for full API docs
- Explore [Other Examples](/examples/react)

