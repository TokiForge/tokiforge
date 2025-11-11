import { h } from 'vue';
import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import { ThemeRuntime } from '@tokiforge/core';
import ApiPlayground from '../components/ApiPlayground.vue';
import './custom.css';

// Initialize TokiForge theme for the docs site
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

const themeRuntime = new ThemeRuntime(docsThemeConfig);

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // Register playground component
    app.component('ApiPlayground', ApiPlayground);
    
    // Initialize theme runtime
    if (typeof window !== 'undefined') {
      themeRuntime.init();
    }
  },
} satisfies Theme;

