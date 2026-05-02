---
title: Server-Side Rendering (SSR) | Guide
description: Complete guide to using TokiForge with Next.js, Remix, and other SSR frameworks. Learn theme switching, hydration, and performance optimization for server-rendered applications.
---

# Server-Side Rendering (SSR) with TokiForge

TokiForge is fully SSR-safe and works seamlessly with Next.js, Remix, Astro, and other server-rendered frameworks.

## SSR Utilities

TokiForge provides a comprehensive `SSRUtils` class for server-side rendering that prevents FOUC (Flash of Unstyled Content) and enables hydration-safe theme switching.

### Quick Start with SSRUtils

```typescript
import { SSRUtils } from "@tokiforge/core";

// Get theme from cookies
const theme = SSRUtils.getThemeFromCookie(request.headers.get("Cookie"));

// Generate inline CSS and hydration script
const { style, script } = SSRUtils.generateSSRHead(themeConfig, {
  theme: theme || "light",
  minify: true,
  includeHydrationScript: true,
});

// In your HTML
<html data-theme={theme}>
  <head>
    <style dangerouslySetInnerHTML={{ __html: style }} />
    {script && <script dangerouslySetInnerHTML={{ __html: script }} />}
  </head>
</html>;
```

### SSRUtils API

#### generateInlineCSS()

Generate inline CSS for a specific theme:

```typescript
const css = SSRUtils.generateInlineCSS(themeConfig, {
  theme: "dark",
  selector: ":root",
  prefix: "hf",
  minify: true,
});
```

#### generateCriticalCSS()

Generate CSS for multiple themes (enables theme switching without JavaScript):

```typescript
const css = SSRUtils.generateCriticalCSS(themeConfig, {
  themes: ["light", "dark"],
  includeThemeSelectors: true, // Uses [data-theme="..."]
  minify: true,
});
```

#### getThemeFromCookie()

Extract theme from cookie string:

```typescript
const theme = SSRUtils.getThemeFromCookie(
  request.headers.get("Cookie"),
  "tokiforge-theme"
);
```

#### generateThemeCookie()

Create Set-Cookie header:

```typescript
const cookie = SSRUtils.generateThemeCookie("dark", "tokiforge-theme", {
  maxAge: 31536000,
  path: "/",
  sameSite: "Lax",
  secure: true,
});

response.headers.set("Set-Cookie", cookie);
```

#### generateHydrationScript()

Generate script to apply theme before React hydrates:

```typescript
const script = SSRUtils.generateHydrationScript(
  "tokiforge-theme",
  "theme",
  "light"
);
```

#### generateSSRHead()

All-in-one helper for SSR. Options (v2.2.3):

- `theme` – Theme name to render
- `cookieName` – Cookie name for theme persistence (default: `'tokiforge-theme'`)
- `cookieMaxAge` – Max age in seconds for the theme cookie (optional)
- `includeHydrationScript` – Include script to apply theme before hydration
- `minify` – Minify output CSS/script

```typescript
const { style, script } = SSRUtils.generateSSRHead(themeConfig, {
  theme: "light",
  cookieName: "tokiforge-theme",
  cookieMaxAge: 31536000, // 1 year
  includeHydrationScript: true,
  minify: true,
});
```

## How TokiForge Handles SSR

TokiForge detects the server environment and:

- ✅ Skips DOM operations during rendering
- ✅ Safely initializes on client hydration
- ✅ Preserves theme state during SSR
- ✅ Handles dynamic imports safely
- ✅ Supports streaming responses

## Next.js with TokiForge

### Installation

```bash
npm install @tokiforge/core @tokiforge/react @tokiforge/nextjs
```

### Basic Setup

#### `app/providers.tsx`

```typescript
"use client";

import { ThemeProvider, useTheme } from "@tokiforge/react";
import { themeConfig } from "@/config/tokens";

export function Providers({ children }: { children: React.ReactNode }) {
  return <ThemeProvider config={themeConfig}>{children}</ThemeProvider>;
}
```

#### `app/layout.tsx`

```typescript
import { Providers } from "./providers";
import { themeConfig } from "@/config/tokens";

// Preload theme to prevent flash
export const metadata = {
  title: "My App",
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const saved = localStorage.getItem('theme');
                const theme = saved || 'light';
                document.documentElement.setAttribute('data-theme', theme);
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### Components with SSR

```typescript
"use client";

import { useTheme } from "@tokiforge/react";
import type { DesignTokens } from "@/types/tokens";

export function ThemeSwitcher() {
  const { theme, setTheme, availableThemes } = useTheme<DesignTokens>();

  return (
    <select value={theme} onChange={(e) => setTheme(e.target.value)}>
      {availableThemes.map((t) => (
        <option key={t} value={t}>
          {t}
        </option>
      ))}
    </select>
  );
}
```

### Avoiding Hydration Mismatches

Use the `suppressHydrationWarning` attribute:

```typescript
export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
```

### Performance: Critical CSS

Inline critical theme CSS to prevent FOUC (Flash of Unstyled Content):

```typescript
import { getCriticalCSS } from "@tokiforge/nextjs";

export default function RootLayout({ children }) {
  const criticalCSS = getCriticalCSS(themeConfig, "light");

  return (
    <html>
      <head>
        <style dangerouslySetInnerHTML={{ __html: criticalCSS }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

## Remix with TokiForge

### Installation

```bash
npm install @tokiforge/core @tokiforge/react @tokiforge/remix
```

### Root Route Setup

#### `app/root.tsx`

```typescript
import { json } from "@remix-run/node";
import { Links, Meta, Outlet, Scripts, useLoaderData } from "@remix-run/react";
import { Providers } from "./components/providers";
import { themeConfig } from "./config/tokens";

export async function loader() {
  return json({ themeConfig });
}

export default function App() {
  const { themeConfig } = useLoaderData<typeof loader>();

  return (
    <html suppressHydrationWarning>
      <head>
        <Meta />
        <Links />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const saved = localStorage.getItem('theme');
                const theme = saved || 'light';
                document.documentElement.setAttribute('data-theme', theme);
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body>
        <Providers config={themeConfig}>
          <Outlet />
        </Providers>
        <Scripts />
      </body>
    </html>
  );
}
```

#### `app/components/providers.tsx`

```typescript
import { ThemeProvider } from "@tokiforge/react";
import type { ThemeConfig } from "@tokiforge/core";

export function Providers({
  config,
  children,
}: {
  config: ThemeConfig;
  children: React.ReactNode;
}) {
  return <ThemeProvider config={config}>{children}</ThemeProvider>;
}
```

### Action-Based Theme Switching

```typescript
// app/routes/theme.tsx
import { json, redirect } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const theme = formData.get("theme");

  // Store theme preference (e.g., in session or database)
  const cookie = `theme=${theme}; Max-Age=31536000; Path=/`;

  return redirect("/", {
    headers: {
      "Set-Cookie": cookie,
    },
  });
};

// app/components/theme-switcher.tsx
import { Form } from "@remix-run/react";

export function ThemeSwitcher() {
  return (
    <Form action="/theme" method="post">
      <select name="theme" onChange={(e) => e.currentTarget.form?.submit()}>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </Form>
  );
}
```

## Astro with TokiForge

### Installation

```bash
npm install @tokiforge/core @tokiforge/astro
```

### Setup

#### `src/layouts/Layout.astro`

```astro
---
import { initializeTheme } from '@tokiforge/astro';
import { themeConfig } from '@/config/tokens';

const theme = initializeTheme(themeConfig);
---

<!doctype html>
<html data-theme={theme.currentTheme}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <style set:html={theme.getInlineCSS()} />
  </head>
  <body>
    <slot />
  </body>
</html>
```

### Client-Side Theme Switching

```astro
---
import ThemeSwitcher from '@/components/ThemeSwitcher.tsx';
---

<ThemeSwitcher client:load />
```

## SvelteKit with TokiForge

### Installation

```bash
npm install @tokiforge/core @tokiforge/svelte @tokiforge/sveltekit
```

### Setup

#### `src/routes/+layout.svelte`

```svelte
<script>
  import { createThemeStore } from '@tokiforge/svelte';
  import { themeConfig } from '$lib/config/tokens';

  const { theme, setTheme, availableThemes } = createThemeStore(themeConfig);
</script>

<div data-theme={$theme}>
  <select on:change={(e) => setTheme(e.target.value)}>
    {#each $availableThemes as t}
      <option value={t} selected={$theme === t}>{t}</option>
    {/each}
  </select>

  <slot />
</div>
```

## Common SSR Patterns

### Theme from User Preferences

```typescript
// Get theme from request headers, session, or cookie
export async function loader({ request }: LoaderFunctionArgs) {
  const cookie = request.headers.get("cookie");
  const theme = parseThemeCookie(cookie) || "light";

  return json({ theme });
}
```

### Defer Critical Rendering

```typescript
// Next.js
export async function generateMetadata() {
  return {
    colorScheme: "light dark",
  };
}

// Remix
export async function loader() {
  return json(
    { data },
    {
      headers: {
        "Cache-Control": "public, max-age=3600",
      },
    }
  );
}
```

### Safe Hydration

```typescript
export function useThemeHydration() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // Don't render theme switcher on server
  }

  return <ThemeSwitcher />;
}
```

## Performance Optimization

### 1. Minimize FOUC (Flash of Unstyled Content)

```html
<!-- Inline critical theme CSS -->
<style>
  :root {
    --color-primary: #007aff;
    --color-background: #ffffff;
  }
</style>
```

### 2. Cache Theme Tokens

```typescript
// Cache tokens at build time
export const cached = cache(async () => {
  const tokens = await generateTokens(themeConfig);
  return tokens;
});
```

### 3. Stream HTML for Faster TTFB

```typescript
// Remix with streaming
export function RootRoute() {
  return (
    <html>
      <body>
        <Suspense fallback={<LoadingSpinner />}>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  );
}
```

### 4. Optimize Bundle Size

```typescript
// Dynamic import theme provider only on client
const ThemeProvider = dynamic(() => import("@tokiforge/react"), {
  ssr: false,
});
```

## Troubleshooting SSR

### Hydration Mismatch

```text
Error: Hydration failed because the server rendered HTML didn't match the client.
```

**Solution:** Add `suppressHydrationWarning` to root element:

```typescript
<html suppressHydrationWarning>
  <body>{children}</body>
</html>
```

### Theme Not Persisting

```typescript
// Save theme in cookies/storage on server
export async function action({ request }: ActionFunction) {
  const theme = await request.formData().get("theme");

  return json(
    { success: true },
    {
      headers: {
        "Set-Cookie": `theme=${theme}; Path=/; Max-Age=31536000`,
      },
    }
  );
}
```

### FOUC (Flash of Unstyled Content)

**Solution:** Inline critical CSS in `<head>`:

```typescript
<head>
  <style dangerouslySetInnerHTML={{ __html: criticalCSS }} />
</head>
```

### Styles Not Loading

Ensure styles are included in server render:

```typescript
import { getCSSVariables } from "@tokiforge/core";

const css = getCSSVariables(tokens);

return (
  <html>
    <head>
      <style dangerouslySetInnerHTML={{ __html: css }} />
    </head>
  </html>
);
```

## Best Practices

1. **Always use `suppressHydrationWarning`** to prevent mismatch warnings
2. **Inline critical theme CSS** to prevent FOUC
3. **Store theme preference** in cookies or database
4. **Test hydration** with production builds
5. **Use dynamic imports** for client-only components
6. **Cache tokens** at build time when possible
7. **Stream HTML** for better performance metrics
8. **Minify CSS** in production builds

## Related Guides

- [Framework Support](/guide/framework-support)
- [React with TokiForge](/guide/react)
- [Performance Optimization](/guide/performance-optimization)
- [Theming Guide](/guide/theming)

## Resources

- [Next.js App Router](https://nextjs.org/docs/app)
- [Remix Documentation](https://remix.run/docs)
- [Astro Documentation](https://docs.astro.build)
- [SvelteKit Documentation](https://kit.svelte.dev)
