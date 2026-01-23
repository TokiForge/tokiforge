import type { ThemeConfig } from '@tokiforge/core';

// Same theme config as Next.js example for consistency
export const themeConfig: ThemeConfig = {
  themes: [
    {
      name: 'light',
      tokens: {
        color: {
          primary: { value: '#7C3AED', type: 'color' },
          secondary: { value: '#EC4899', type: 'color' },
          background: { value: '#FFFFFF', type: 'color' },
          surface: { value: '#F9FAFB', type: 'color' },
          text: {
            primary: { value: '#111827', type: 'color' },
            secondary: { value: '#6B7280', type: 'color' },
          },
          border: { value: '#E5E7EB', type: 'color' },
        },
        spacing: {
          sm: { value: '8px', type: 'dimension' },
          md: { value: '16px', type: 'dimension' },
          lg: { value: '24px', type: 'dimension' },
        },
      },
    },
    {
      name: 'dark',
      tokens: {
        color: {
          primary: { value: '#A78BFA', type: 'color' },
          secondary: { value: '#F472B6', type: 'color' },
          background: { value: '#111827', type: 'color' },
          surface: { value: '#1F2937', type: 'color' },
          text: {
            primary: { value: '#F9FAFB', type: 'color' },
            secondary: { value: '#D1D5DB', type: 'color' },
          },
          border: { value: '#374151', type: 'color' },
        },
        spacing: {
          sm: { value: '8px', type: 'dimension' },
          md: { value: '16px', type: 'dimension' },
          lg: { value: '24px', type: 'dimension' },
        },
      },
    },
  ],
  defaultTheme: 'light',
};
