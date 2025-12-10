# @tokiforge/sveltekit

SvelteKit integration for TokiForge theming with SSR support.

## Installation

```bash
npm install @tokiforge/sveltekit @tokiforge/core svelte @sveltejs/kit
```

## Usage

### +layout.server.ts

```ts
import { getThemeFromCookie } from '@tokiforge/sveltekit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ cookies }) => {
  const theme = cookies.get('tokiforge-theme') || 'light';
  return { theme };
};
```

### +layout.svelte

```svelte
<script lang="ts">
  import { createThemeStore } from '@tokiforge/sveltekit';
  export let data;

  const themeStore = createThemeStore(config, { ssrTheme: data.theme });
  const { theme, setTheme, availableThemes } = themeStore;
</script>

<select value={$theme} on:change={(e) => setTheme(e.currentTarget.value)}>
  {#each $availableThemes as t}
    <option value={t}>{t}</option>
  {/each}
</select>

<slot />
```

## Features

- ✅ SvelteKit 2.0+ support
- ✅ SSR-aware theme store
- ✅ Cookie-based persistence
- ✅ Flash-free hydration
- ✅ TypeScript support

## License

AGPL-3.0
