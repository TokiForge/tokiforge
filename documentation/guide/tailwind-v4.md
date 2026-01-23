---
title: Tailwind CSS v4 Integration | Guide
description: Complete guide to using TokiForge with Tailwind CSS v4. Learn how to integrate design tokens with Tailwind, use CSS variables, and configure theme customization.
---

# Tailwind CSS v4 Integration

Use TokiForge design tokens with Tailwind CSS v4 for seamless theme switching and design system consistency.

## What's New in Tailwind v4

Tailwind CSS v4 introduces:

- ✨ New CSS-first configuration
- ✨ CSS variables integration
- ✨ Simplified theming
- ✨ Built-in `@theme` directive
- ✨ Better performance

## Installation

```bash
npm install -D tailwindcss@latest @tokiforge/tailwind @tokiforge/core
```

## Basic Setup

### Step 1: Generate Tailwind Config

```bash
tokiforge build --format tailwind
# Generates: dist/tailwind.config.js
```

### Step 2: Configure Tailwind

#### `tailwind.config.js`

```javascript
import { generateTailwindConfig } from "@tokiforge/tailwind";
import { themeConfig } from "./src/config/tokens";

export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: generateTailwindConfig(themeConfig, {
    useCSSVariables: true,
    prefix: "tw-",
  }),
  plugins: [],
};
```

### Step 3: Import Styles

#### `src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@theme {
  /* Theme tokens automatically injected */
}
```

## Using Design Tokens with Tailwind

### CSS Variables

```typescript
// tokens.json
{
  "themes": [{
    "name": "light",
    "tokens": {
      "color": {
        "primary": { "value": "#007AFF" },
        "secondary": { "value": "#5AC8FA" }
      }
    }
  }]
}
```

```jsx
// React Component
export function Button() {
  return (
    <button
      className="
        bg-[var(--color-primary)]
        text-white
        px-4
        py-2
        rounded
      "
    >
      Click me
    </button>
  );
}
```

### Tailwind Utility Classes

```javascript
// tailwind.config.js
import { generateTailwindConfig } from "@tokiforge/tailwind";

export default {
  theme: generateTailwindConfig(themeConfig, {
    useCSSVariables: false, // Use raw values instead of CSS variables
  }),
};
```

```jsx
// Now use Tailwind classes directly
<button className="bg-primary text-white px-4 py-2 rounded">Click me</button>
```

## Advanced Configuration

### Custom Theme Mapping

```javascript
// tailwind.config.js
import { generateTailwindConfig } from "@tokiforge/tailwind";

const config = generateTailwindConfig(themeConfig, {
  themeMappings: {
    colors: {
      primary: "color.brand.primary",
      secondary: "color.brand.secondary",
      surface: "color.neutral.background",
      text: "color.neutral.text",
    },
    spacing: {
      xs: "spacing.extra-small",
      sm: "spacing.small",
      md: "spacing.medium",
      lg: "spacing.large",
      xl: "spacing.extra-large",
    },
  },
});

export default {
  theme: config,
};
```

### Prefix Configuration

```javascript
// tailwind.config.js
export default {
  prefix: "tw-",
  theme: generateTailwindConfig(themeConfig, {
    prefix: "token-", // CSS variable prefix
  }),
};
```

```css
/* Generates:
   --token-color-primary: #007AFF;
   --token-color-secondary: #5AC8FA;
*/
```

### Responsive Design

```javascript
// Use token breakpoints in Tailwind
const config = generateTailwindConfig(themeConfig, {
  screens: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
  },
});
```

## Dynamic Theme Switching

### CSS Variables Method

```typescript
// src/lib/theme.ts
import { ThemeRuntime } from "@tokiforge/core";
import { themeConfig } from "./tokens";

export const themeRuntime = new ThemeRuntime(themeConfig);

export function setTheme(themeName: string) {
  themeRuntime.applyTheme(themeName);
  // CSS variables update automatically
  document.documentElement.style.colorScheme =
    themeName === "dark" ? "dark" : "light";
}
```

```jsx
// React Component
import { setTheme } from "@/lib/theme";

export function ThemeSwitcher() {
  return (
    <select onChange={(e) => setTheme(e.target.value)}>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  );
}
```

### Tailwind v4 Theme Directive

```css
/* src/styles/theme.css */
@theme {
  --color-primary: #007aff;
  --color-primary-dark: #004ebf;
  --color-secondary: #5ac8fa;
  --color-secondary-dark: #0084ff;

  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;
}
```

## Responsive Variants

```jsx
// Use with CSS variables
<div
  className="
  bg-[var(--color-primary)]
  sm:bg-[var(--color-secondary)]
  md:text-[var(--font-size-lg)]
  dark:bg-[var(--color-primary-dark)]
"
>
  Responsive content
</div>
```

## Extending Tailwind

### Add Custom Utilities

```javascript
// tailwind.config.js
import plugin from "tailwindcss/plugin";

export default {
  theme: generateTailwindConfig(themeConfig),
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        ".flex-center": {
          "@apply flex items-center justify-center": {},
        },
        ".text-truncate": {
          "@apply truncate": {},
        },
      });
    }),
  ],
};
```

### Add Custom Components

```css
/* src/index.css */
@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark;
  }

  .btn-secondary {
    @apply px-4 py-2 bg-secondary text-white rounded hover:bg-secondary-dark;
  }
}
```

## Dark Mode Support

### Automatic with CSS Variables

```javascript
// tailwind.config.js
export default {
  darkMode: "class", // or 'media'
  theme: generateTailwindConfig(themeConfig, {
    useCSSVariables: true,
  }),
};
```

```jsx
// Tailwind automatically uses dark: prefix
<div
  className="
  bg-white
  dark:bg-slate-900
  text-black
  dark:text-white
"
>
  Content
</div>
```

### Custom Dark Mode Setup

```javascript
// tokens.json
{
  "themes": [
    {
      "name": "light",
      "tokens": { /* light theme */ }
    },
    {
      "name": "dark",
      "tokens": { /* dark theme */ }
    }
  ]
}
```

```typescript
// src/lib/theme.ts
function setDarkMode(isDark: boolean) {
  const theme = isDark ? "dark" : "light";
  themeRuntime.applyTheme(theme);

  if (isDark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}
```

## Performance Optimization

### PurgeCSS Configuration

```javascript
// tailwind.config.js
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/**/*.html"],
  theme: generateTailwindConfig(themeConfig),
  safelist: [
    // Classes that might be dynamically added
    "dark",
    "motion-reduce",
  ],
};
```

### JIT Mode

JIT is enabled by default in Tailwind v4:

```javascript
// No configuration needed - works out of the box
export default {
  theme: generateTailwindConfig(themeConfig),
};
```

## Production Build

### Optimize CSS Size

```bash
# Build with minification
npm run build

# Check CSS size
du -h dist/styles.css
```

### Monitor CSS Output

```javascript
// Add to your build script
import { execSync } from "child_process";

const result = execSync("wc -c dist/styles.css");
console.log("CSS file size:", result.toString());
```

## Integration with Next.js

```javascript
// app/globals.css
@tailwind base;
@tailwind components;
@tailwind utilities;

@theme {
  /* TokiForge tokens */
}
```

```javascript
// tailwind.config.js
import type { Config } from 'tailwindcss';
import { generateTailwindConfig } from '@tokiforge/tailwind';
import { themeConfig } from '@/config/tokens';

export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  theme: generateTailwindConfig(themeConfig),
} satisfies Config;
```

## Common Issues

### CSS Variables Not Working

Check that `useCSSVariables: true` is set:

```javascript
const config = generateTailwindConfig(themeConfig, {
  useCSSVariables: true,
});
```

### Colors Not Applying

Ensure tokens are properly formatted:

```json
{
  "color": {
    "primary": {
      "value": "#007AFF",
      "type": "color"
    }
  }
}
```

### Dark Mode Not Switching

Verify the selector matches your setup:

```javascript
export default {
  darkMode: "class", // Add this if using class-based dark mode
  theme: generateTailwindConfig(themeConfig),
};
```

## Migration from Tailwind v3

### Update Config Syntax

```javascript
// Before (v3)
module.exports = {
  theme: {
    colors: {
      /* ... */
    },
  },
};

// After (v4)
export default {
  theme: generateTailwindConfig(themeConfig),
};
```

### CSS Imports

```css
/* Before (v3) */
@import "tailwindcss/base";
@import "tailwindcss/components";
@import "tailwindcss/utilities";

/* After (v4) */
@tailwind base;
@tailwind components;
@tailwind utilities;

@theme {
  /* New theme directive */
}
```

## Best Practices

1. **Use CSS variables** for dynamic theming
2. **Organize tokens** by category (colors, spacing, etc.)
3. **Test responsive** behavior across breakpoints
4. **Monitor bundle** size during builds
5. **Use dark mode** with CSS variables for best performance
6. **Regenerate** Tailwind config when tokens change
7. **Document** custom utilities and components

## Related Resources

- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs)
- [Tailwind Configuration](https://tailwindcss.com/docs/configuration)
- [Tailwind Plugin Guide](/guide/tailwind-plugin)
- [Design Tokens Guide](/guide/design-tokens)
- [Theming Guide](/guide/theming)

## Troubleshooting

### Build Errors

```bash
# Clear Tailwind cache
rm -rf node_modules/.cache

# Rebuild
npm run build
```

### Hot Reload Not Working

Ensure your `tailwind.config.js` path is correct in `content`:

```javascript
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Include all source files
    "./public/**/*.html",
  ],
};
```

## Next Steps

- Check [Dynamic Theming](/guide/theming) guide
- Explore [Performance Optimization](/guide/performance-optimization)
- Review [Tailwind Plugin Documentation](/guide/tailwind-plugin)
