# @tokiforge/remix

Remix integration for TokiForge theming with session-based persistence.

## Installation

```bash
npm install @tokiforge/remix @tokiforge/core @remix-run/react @remix-run/node
```

## Usage

### Setup (app/root.tsx)

```tsx
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { ThemeProvider } from '@tokiforge/remix';
import { createThemeSessionStorage } from '@tokiforge/remix/server';

const themeStorage = createThemeSessionStorage(process.env.SESSION_SECRET!);

export async function loader({ request }: LoaderFunctionArgs) {
  const theme = await themeStorage.getTheme(request);
  return json({ theme });
}

export default function App() {
  const { theme } = useLoaderData<typeof loader>();

  return (
    <html>
      <body>
        <ThemeProvider config={config} initialTheme={theme || undefined}>
          <Outlet />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Theme Switching Action

```tsx
import { redirect, type ActionFunctionArgs } from '@remix-run/node';

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const theme = formData.get('theme') as string;
  
  const setCookie = await themeStorage.setTheme(request, theme);
  
  return redirect(request.headers.get('Referer') || '/', {
    headers: { 'Set-Cookie': setCookie },
  });
}
```

### Using Theme in Components

```tsx
import { useTheme } from '@tokiforge/remix';
import { Form } from '@remix-run/react';

export function ThemeSwitcher() {
  const { theme, availableThemes } = useTheme();

  return (
    <Form method="post">
      <select name="theme" defaultValue={theme}>
        {availableThemes.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
      <button type="submit">Switch Theme</button>
    </Form>
  );
}
```

## API

### Client (`@tokiforge/remix`)

#### `ThemeProvider`
Provider component for theme context.

#### `useTheme()`
Hook to access theme context.

### Server (`@tokiforge/remix/server`)

#### `createThemeSessionStorage(secret)`
Creates session storage for theme persistence.

## Features

- ✅ Remix 2.0+ support
- ✅ Session-based theme persistence
- ✅ Form action integration
- ✅ Flash-free hydration
- ✅ TypeScript support

## License

AGPL-3.0
