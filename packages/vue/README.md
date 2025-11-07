# @tokiforge/vue

Vue adapter for TokiForge theming (v1.0.0).

## Installation

```bash
npm install @tokiforge/vue@^1.0.0 @tokiforge/core@^1.0.0
```

## Usage

```vue
<template>
  <div :style="{ backgroundColor: 'var(--hf-color-background-default)' }">
    <button @click="toggleTheme">Switch Theme</button>
  </div>
</template>

<script setup lang="ts">
import { provideTheme, useTheme } from '@tokiforge/vue';

const themeConfig = {
  themes: [
    { name: 'light', tokens: lightTokens },
    { name: 'dark', tokens: darkTokens },
  ],
  defaultTheme: 'light',
};

provideTheme(themeConfig);
const { theme, tokens, setTheme } = useTheme();

const toggleTheme = () => {
  setTheme(theme.value === 'light' ? 'dark' : 'light');
};
</script>
```

## API

### `provideTheme(config, selector?, prefix?, defaultTheme?)`

Provides theme context to Vue components.

### `useTheme()`

Composable to access theme context.

**Returns:**
- `theme`: Reactive ref with current theme name
- `tokens`: Computed ref with current theme tokens
- `setTheme(name)`: Switch to a theme
- `nextTheme()`: Cycle to next theme
- `availableThemes`: Computed ref with available theme names
- `runtime`: ThemeRuntime instance



