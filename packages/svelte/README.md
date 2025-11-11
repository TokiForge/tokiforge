# @tokiforge/svelte

Svelte adapter for TokiForge theming (v1.1.0).

## Installation

```bash
npm install @tokiforge/svelte@^1.1.0 @tokiforge/core@^1.1.0
```

## Usage

```svelte
<script>
  import { createThemeStore } from '@tokiforge/svelte';

  const themeConfig = {
    themes: [
      { name: 'light', tokens: lightTokens },
      { name: 'dark', tokens: darkTokens },
    ],
    defaultTheme: 'light',
  };

  const themeStore = createThemeStore(themeConfig);

  function toggleTheme() {
    themeStore.setTheme($themeStore.theme === 'light' ? 'dark' : 'light');
  }
</script>

<div style="background-color: var(--hf-color-background-default);">
  <button on:click={toggleTheme}>
    Switch to {$themeStore.theme === 'light' ? 'Dark' : 'Light'} Theme
  </button>
</div>
```

## API

### `createThemeStore(config, selector?, prefix?, defaultTheme?)`

Creates a Svelte store for theme management.

**Returns:**
- `theme`: Writable store with current theme name
- `tokens`: Derived store with current theme tokens
- `setTheme(name)`: Switch to a theme
- `nextTheme()`: Cycle to next theme
- `availableThemes`: Derived store with available theme names
- `runtime`: ThemeRuntime instance



