# Remix SSR Example with TokiForge

This example demonstrates how to use TokiForge with Remix including:

- ✅ Server-Side Rendering (SSR)
- ✅ Hydration-safe theme switching
- ✅ Cookie-based theme persistence
- ✅ Zero FOUC (Flash of Unstyled Content)
- ✅ Critical CSS inline injection via loaders

## Features

### SSR Support

The theme is detected from cookies in the root loader:

```typescript
// app/root.tsx
export async function loader({ request }: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const theme = SSRUtils.getThemeFromCookie(cookieHeader) || "light";
  return json({ theme });
}
```

### Hydration Safety

The theme is applied before React hydrates using:

1. Inline critical CSS in document head
2. Pre-hydration script
3. Cookie persistence

### Theme Switching

Theme changes are persisted via actions:

```typescript
// app/routes/set-theme.tsx
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const theme = formData.get("theme") as string;

  return json(
    { success: true },
    {
      headers: {
        "Set-Cookie": SSRUtils.generateThemeCookie(theme),
      },
    }
  );
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

3. Open [http://localhost:5173](http://localhost:5173)

## Project Structure

```
remix-ssr-example/
├── app/
│   ├── root.tsx                # Root component with SSR theme detection
│   ├── routes/
│   │   ├── _index.tsx          # Home page
│   │   └── set-theme.tsx       # Theme action endpoint
│   ├── components/
│   │   ├── ThemeProvider.tsx   # Client theme provider
│   │   └── ThemeSwitcher.tsx   # Theme switcher component
│   └── config/
│       └── tokens.ts            # Theme configuration
└── public/
    └── ...                      # Static assets
```

## Key Concepts

### 1. Root Loader for Theme Detection

```typescript
// app/root.tsx
export async function loader({ request }: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const theme = SSRUtils.getThemeFromCookie(cookieHeader) || "light";

  const { style, script } = SSRUtils.generateSSRHead(themeConfig, {
    theme,
    minify: true,
  });

  return json({ theme, style, script });
}
```

### 2. Inline CSS in Document

```tsx
<html lang="en" suppressHydrationWarning data-theme={data.theme}>
  <head>
    <style dangerouslySetInnerHTML={{ __html: data.style }} />
    {data.script && (
      <script dangerouslySetInnerHTML={{ __html: data.script }} />
    )}
  </head>
</html>
```

### 3. Theme Action

```typescript
// app/routes/set-theme.tsx
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const theme = formData.get("theme") as string;

  return json(
    { success: true },
    {
      headers: {
        "Set-Cookie": SSRUtils.generateThemeCookie(theme, "tokiforge-theme"),
      },
    }
  );
}
```

### 4. Client-Side Theme Switcher

```tsx
import { useFetcher } from "@remix-run/react";

export function ThemeSwitcher() {
  const fetcher = useFetcher();

  const handleThemeChange = (theme: string) => {
    fetcher.submit({ theme }, { method: "post", action: "/set-theme" });
  };

  // ...
}
```

## Benefits

- **Zero FOUC**: Theme applied before first paint
- **SEO Friendly**: Correct theme rendered on server
- **Fast**: Inline critical CSS, no flash
- **Persistent**: Theme saved in cookies
- **Type-Safe**: Full TypeScript support
- **Progressive Enhancement**: Works without JavaScript

## Learn More

- [TokiForge SSR Guide](../../documentation/guide/ssr.md)
- [Remix Documentation](https://remix.run/docs)
- [Remix Loaders & Actions](https://remix.run/docs/en/main/guides/data-loading)
