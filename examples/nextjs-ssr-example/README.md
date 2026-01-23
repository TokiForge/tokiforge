# Next.js SSR Example with TokiForge

This example demonstrates how to use TokiForge with Next.js App Router including:

- ✅ Server-Side Rendering (SSR)
- ✅ Static Site Generation (SSG)
- ✅ Hydration-safe theme switching
- ✅ Cookie-based theme persistence
- ✅ Zero FOUC (Flash of Unstyled Content)
- ✅ Critical CSS inline injection

## Features

### SSR Support

The theme is detected and applied on the server, preventing any flash of unstyled content:

```typescript
// app/layout.tsx
const cookieStore = cookies();
const theme = cookieStore.get("tokiforge-theme")?.value || "light";
```

### Hydration Safety

The theme is synchronized between server and client using:

1. Inline critical CSS in `<head>`
2. Pre-hydration script to apply theme classes
3. Cookie-based persistence

### Theme Switching

Theme changes are persisted via server actions:

```typescript
// app/actions.ts
"use server";
export async function setTheme(theme: string) {
  cookies().set("tokiforge-theme", theme);
}
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Run development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
nextjs-ssr-example/
├── app/
│   ├── layout.tsx          # Root layout with SSR theme detection
│   ├── page.tsx             # Home page
│   ├── actions.ts           # Server actions for theme switching
│   ├── ThemeProvider.tsx    # Client-side theme provider
│   └── ThemeSwitcher.tsx    # Theme switcher component
├── config/
│   └── tokens.ts            # Theme configuration
└── public/
    └── ...                  # Static assets
```

## Key Concepts

### 1. Server-Side Theme Detection

```typescript
// app/layout.tsx
import { cookies } from "next/headers";
import { SSRUtils } from "@tokiforge/core";

const cookieStore = cookies();
const theme = cookieStore.get("tokiforge-theme")?.value || "light";

// Generate inline CSS to prevent FOUC
const { style, script } = SSRUtils.generateSSRHead(themeConfig, {
  theme,
  cookieName: "tokiforge-theme",
  includeHydrationScript: true,
  minify: true,
});
```

### 2. Hydration Script

The hydration script runs before React hydrates, ensuring the theme is applied immediately:

```tsx
<script dangerouslySetInnerHTML={{ __html: script }} />
```

### 3. Client-Side Theme Provider

```tsx
"use client";
import { ThemeProvider } from "@tokiforge/react";

export function ClientThemeProvider({ children, initialTheme }) {
  return (
    <ThemeProvider config={themeConfig} initialTheme={initialTheme}>
      {children}
    </ThemeProvider>
  );
}
```

### 4. Server Actions for Theme Persistence

```typescript
"use server";
import { cookies } from "next/headers";

export async function setThemeAction(theme: string) {
  cookies().set("tokiforge-theme", theme, {
    path: "/",
    maxAge: 31536000, // 1 year
    sameSite: "lax",
  });
}
```

## Benefits

- **Zero FOUC**: Theme applied before first paint
- **SEO Friendly**: Correct theme rendered on server
- **Fast**: Inline critical CSS, no flash
- **Persistent**: Theme saved in cookies
- **Type-Safe**: Full TypeScript support

## Learn More

- [TokiForge SSR Guide](../../documentation/guide/ssr.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Server Components](https://nextjs.org/docs/getting-started/react-essentials)
