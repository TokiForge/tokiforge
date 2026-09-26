import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import { defineAsyncComponent } from 'vue';
import './custom.css';

const docsThemeConfig = {
  themes: [
    {
      name: 'light',
      tokens: {
        color: {
          primary: { value: '#7C3AED', type: 'color' },
          brand: { value: '#7C3AED', type: 'color' },
          'brand-light': { value: '#8B5CF6', type: 'color' },
          'brand-lighter': { value: '#A78BFA', type: 'color' },
          'brand-dark': { value: '#6D28D9', type: 'color' },
          'brand-darker': { value: '#5B21B6', type: 'color' },
        },
      },
    },
    {
      name: 'dark',
      tokens: {
        color: {
          primary: { value: '#8B5CF6', type: 'color' },
          brand: { value: '#8B5CF6', type: 'color' },
          'brand-light': { value: '#A78BFA', type: 'color' },
          'brand-lighter': { value: '#C4B5FD', type: 'color' },
          'brand-dark': { value: '#7C3AED', type: 'color' },
          'brand-darker': { value: '#6D28D9', type: 'color' },
        },
      },
    },
  ],
  defaultTheme: 'light',
};

function initDocsTheme() {
  void import('@tokiforge/core/runtime').then(({ ThemeRuntime }) => {
    const runtime = new ThemeRuntime(docsThemeConfig);
    runtime.init();
  });
}

function maybeSetupSnow() {
  // Seasonal only — skip Vue app + CSS work the rest of the year
  if (new Date().getMonth() !== 11) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  void import('./snow').then(({ setupSnow }) => setupSnow());
}

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component(
      'ApiPlayground',
      defineAsyncComponent(() => import('../components/ApiPlayground.vue'))
    );

    if (typeof window !== 'undefined') {
      initDocsTheme();
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', maybeSetupSnow, { once: true });
      } else {
        maybeSetupSnow();
      }
    }
  },
} satisfies Theme;
