# @tokiforge/nextjs

Next.js App Router adapter for TokiForge theming system with full RSC support.

## Installation

```bash
npm install @tokiforge/nextjs @tokiforge/core next react
```

## Usage

### App Router Setup

**1. Server-side theme detection (app/layout.tsx)**

```tsx
import { getServerTheme } from '@tokiforge/nextjs/server';
import { ThemeProvider } from '@tokiforge/nextjs';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = await getServerTheme();

  return (
    <html lang="en">
      <body>
        <ThemeProvider config={config} initialTheme={theme}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**2. Client component usage**

```tsx
'use client';

import { useTheme } from '@tokiforge/nextjs';

export function ThemeSwitcher() {
  const { theme, setTheme, availableThemes } = useTheme();

  return (
    <select value={theme} onChange={(e) => setTheme(e.target.value)}>
      {availableThemes.map((t) => (
        <option key={t} value={t}>{t}</option>
      ))}
    </select>
  );
}
```

## API

### Client (`@tokiforge/nextjs`)

#### `ThemeProvider`
RSC-compatible theme provider component.

**Props:**
- `config`: Theme configuration
- `initialTheme?`: Initial theme from server
- `selector?`: CSS selector (default: `:root`)
- `prefix?`: CSS variable prefix (default: `hf`)
- `children`: React children

#### `useTheme()`
Hook to access theme context (client components only).

### Server (`@tokiforge/nextjs/server`)

#### `getServerTheme(cookieName?)`
Get theme from cookies in Server Components.

#### `setServerTheme(theme, cookieName?)`
Set theme cookie from Server Actions.

## Features

- ✅ Next.js 14+ App Router support
- ✅ React Server Components compatible
- ✅ Cookie-based theme persistence
- ✅ Flash-free hydration
- ✅ TypeScript support
- ✅ Streaming SSR ready

## License

AGPL-3.0
