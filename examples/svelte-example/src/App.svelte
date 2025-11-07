<script lang="ts">
  import { createThemeStore } from '@tokiforge/svelte';
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

  const themeStore = createThemeStore(themeConfig);
  const { theme, tokens: themeTokens } = themeStore;

  function toggleTheme() {
    const currentTheme = $theme;
    themeStore.setTheme(currentTheme === 'light' ? 'dark' : 'light');
  }
</script>

<div class="app" style="background-color: var(--hf-color-background-default); color: var(--hf-color-text-primary);">
  <h1>TokiForge Svelte Example</h1>
  <p>This demonstrates the TokiForge theming system with Svelte.</p>
  <button class="theme-button" on:click={toggleTheme}>
    Switch to {$theme === 'light' ? 'Dark' : 'Light'} Theme
  </button>
  
  <div class="tokens-section">
    <h2>Theme Tokens</h2>
    <pre>{JSON.stringify($themeTokens, null, 2)}</pre>
  </div>
</div>

<style>
  .app {
    min-height: 100vh;
    padding: 2rem;
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

  .tokens-section {
    margin-top: 2rem;
  }

  pre {
    background-color: var(--hf-color-background-muted);
    padding: 1rem;
    border-radius: var(--hf-radius-md);
    overflow: auto;
  }
</style>

