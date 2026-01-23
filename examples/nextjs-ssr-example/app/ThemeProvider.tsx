'use client';

import { ThemeProvider as BaseThemeProvider } from '@tokiforge/react';
import { themeConfig } from '../config/tokens';
import type { ReactNode } from 'react';

interface ClientThemeProviderProps {
  children: ReactNode;
  initialTheme: string;
}

/**
 * Client-side theme provider component.
 * Receives the initial theme from the server and manages theme state on the client.
 */
export function ClientThemeProvider({ children, initialTheme }: ClientThemeProviderProps) {
  return (
    <BaseThemeProvider
      config={themeConfig}
      initialTheme={initialTheme}
      selector=":root"
      prefix="hf"
    >
      {children}
    </BaseThemeProvider>
  );
}
