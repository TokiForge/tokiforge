<template>
  <div class="app">
    <h1>🌈 TokiForge Vue Example (Using Plugin)</h1>
    <p>This uses the @tokiforge/vue plugin with ThemeRuntime.</p>
    <button @click="toggleTheme" class="theme-button">
      Switch to {{ theme === 'light' ? 'Dark' : 'Light' }} Theme
    </button>
    
    <div class="tokens-section">
      <h2>Current Theme: {{ theme }}</h2>
      <p>Available themes: {{ availableThemes.join(', ') }}</p>
      <details>
        <summary>Theme Tokens (from runtime)</summary>
        <pre>{{ JSON.stringify(themeTokens, null, 2) }}</pre>
      </details>
    </div>
  </div>
</template>

<script setup lang="ts">
import { provideTheme } from '@tokiforge/vue';
import tokens from './tokens.json';

const themeConfig = {
  themes: [
    {
      name: 'light',
      tokens: {
        ...tokens,
        color: {
          ...tokens.color,
          text: {
            primary: { value: '#1E293B', type: 'color' },
            secondary: { value: '#64748B', type: 'color' },
          },
        },
      },
    },
    {
      name: 'dark',
      tokens: {
        ...tokens,
        color: {
          ...tokens.color,
          text: {
            primary: { value: '#F8FAFC', type: 'color' },
            secondary: { value: '#CBD5E1', type: 'color' },
          },
          background: {
            default: { value: '#0F172A', type: 'color' },
            muted: { value: '#1E293B', type: 'color' },
          },
        },
      },
    },
  ],
  defaultTheme: 'light',
};

const { theme, tokens: themeTokens, setTheme, availableThemes } = provideTheme(themeConfig);

const toggleTheme = () => {
  setTheme(theme.value === 'light' ? 'dark' : 'light');
};
</script>

<style scoped>
.app {
  min-height: 100vh;
  padding: 2rem;
  background-color: var(--hf-color-background-default);
  color: var(--hf-color-text-primary);
  transition: background-color 0.3s, color 0.3s;
}

.theme-button {
  background-color: var(--hf-color-primary);
  color: #FFFFFF;
  border-radius: var(--hf-radius-lg);
  padding: var(--hf-spacing-md) var(--hf-spacing-lg);
  border: none;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.2s;
}

.theme-button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.tokens-section {
  margin-top: 2rem;
  padding: var(--hf-spacing-lg);
  background-color: var(--hf-color-background-muted);
  border-radius: var(--hf-radius-md);
}

pre {
  margin-top: 1rem;
  padding: 1rem;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: var(--hf-radius-sm);
  overflow: auto;
  max-height: 300px;
}
</style>

