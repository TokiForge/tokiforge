import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { SSRUtils } from '@tokiforge/core';
import { themeConfig } from '../config/tokens';
import { ClientThemeProvider } from './ThemeProvider';
import { ErrorBoundary } from './ErrorBoundary';

export const metadata: Metadata = {
  title: 'Next.js SSR Example - TokiForge',
  description: 'Server-side rendering example with TokiForge',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get theme from cookies (server-side)
  const cookieStore = cookies();
  const theme = cookieStore.get('tokiforge-theme')?.value || 'light';

  // Generate inline CSS and hydration script to prevent FOUC
  const { style, script } = SSRUtils.generateSSRHead(themeConfig, {
    theme,
    cookieName: 'tokiforge-theme',
    includeHydrationScript: true,
    minify: true,
  });

  // Generate body class for theme
  const bodyClass = SSRUtils.generateBodyClass(theme, 'theme');

  return (
    <html lang="en" suppressHydrationWarning data-theme={theme}>
      <head>
        {/* Inline critical CSS to prevent FOUC */}
        <style dangerouslySetInnerHTML={{ __html: style }} />
        
        {/* Hydration script runs before React hydrates */}
        {script && <script dangerouslySetInnerHTML={{ __html: script }} />}
      </head>
      <body className={bodyClass} suppressHydrationWarning>
        <ErrorBoundary>
          <ClientThemeProvider initialTheme={theme}>
            {children}
          </ClientThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
