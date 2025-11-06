<template>
  <div class="app">
    <h1>🌈 Enhanced TokiForge Vue Plugin</h1>
    <p>This uses the improved plugin with static mode + all features!</p>
    
    <div class="controls">
      <button @click="toggleTheme" class="theme-button">
        Switch to {{ theme === 'light' ? 'Dark' : 'Light' }} Theme
      </button>
      <button @click="nextTheme" class="theme-button secondary">
        Next Theme ({{ availableThemes.length }} available)
      </button>
    </div>
    
    <div class="info-section">
      <h2>Current Theme: {{ theme }}</h2>
      <p><strong>Mode:</strong> Static (body classes, no JS injection)</p>
      <p><strong>Features:</strong> Token parsing ✅ | References ✅ | localStorage ✅ | System theme ✅</p>
      <p><strong>Performance:</strong> Zero runtime overhead (pure CSS)</p>
    </div>

    <div class="tokens-section">
      <details>
        <summary>Theme Tokens (from runtime)</summary>
        <pre>{{ JSON.stringify(tokens, null, 2) }}</pre>
      </details>
      
      <details>
        <summary>Generated CSS (for current theme)</summary>
        <pre>{{ generatedCSS }}</pre>
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

const { 
  theme, 
  tokens, 
  setTheme, 
  nextTheme,
  availableThemes,
  generateCSS 
} = provideTheme(themeConfig, {
  mode: 'static',
  persist: true,
  watchSystemTheme: false,
  bodyClassPrefix: 'theme',
  prefix: 'hf',
});

const toggleTheme = () => {
  setTheme(theme.value === 'light' ? 'dark' : 'light');
};

const generatedCSS = generateCSS ? generateCSS() : '';
</script>

<style scoped>
.app {
  min-height: 100vh;
  padding: 2rem;
  background-color: var(--hf-color-background-default);
  color: var(--hf-color-text-primary);
  transition: background-color 0.3s, color 0.3s;
}

.controls {
  display: flex;
  gap: 1rem;
  margin: 2rem 0;
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

.theme-button.secondary {
  background-color: var(--hf-color-accent);
}

.info-section {
  margin: 2rem 0;
  padding: var(--hf-spacing-lg);
  background-color: var(--hf-color-background-muted);
  border-radius: var(--hf-radius-md);
}

.tokens-section {
  margin-top: 2rem;
}

details {
  margin: 1rem 0;
  padding: 1rem;
  background-color: var(--hf-color-background-muted);
  border-radius: var(--hf-radius-md);
}

summary {
  cursor: pointer;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

pre {
  margin-top: 1rem;
  padding: 1rem;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: var(--hf-radius-sm);
  overflow: auto;
  max-height: 300px;
  font-size: 12px;
}
</style>

