# @tokiforge/astro

Astro integration for TokiForge theming.

## Installation

```bash
npm install @tokiforge/astro @tokiforge/core astro
```

## Usage

### astro.config.mjs

```js
import { defineConfig } from 'astro/config';
import tokiforge from '@tokiforge/astro';

export default defineConfig({
  integrations: [
    tokiforge({
      config: {
        themes: [
          { name: 'light', tokens: { /* ... */ } },
          { name: 'dark', tokens: { /* ... */ } },
        ],
        defaultTheme: 'light',
      },
      generateStaticCSS: true, // Optional: generate static CSS files
    }),
  ],
});
```

### Layout.astro

```astro
---
import { getThemeFromCookies } from '@tokiforge/astro';
const theme = getThemeFromCookies(Astro.cookies) || 'light';
---

<html data-theme={theme}>
  <body>
    <slot />
  </body>
</html>
```

### Theme Switcher Component

```astro
---
// ThemeSwitcher.astro
---

<select id="theme-switcher">
  <option value="light">Light</option>
  <option value="dark">Dark</option>
</select>

<script>
  const switcher = document.getElementById('theme-switcher');
  switcher?.addEventListener('change', async (e) => {
    const theme = (e.target as HTMLSelectElement).value;
    await window.__tokiforge.applyTheme(theme, ':root', 'hf');
    document.cookie = `tokiforge-theme=${theme}; path=/; max-age=31536000`;
  });
</script>
```

## Features

- ✅ Astro 4.0+ support
- ✅ Framework-agnostic
- ✅ Cookie-based persistence
- ✅ Static CSS generation option
- ✅ TypeScript support

## License

AGPL-3.0
