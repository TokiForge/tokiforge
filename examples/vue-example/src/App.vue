<template>
  <div class="app">
    <h1>TokiForge Vue Example</h1>
    <p>This demonstrates a simple CSS-based theming system with Vue.</p>
    <button @click="toggleTheme" class="theme-button">
      Switch to {{ theme === 'light' ? 'Dark' : 'Light' }} Theme
    </button>
    
    <div class="tokens-section">
      <h2>Current Theme: {{ theme }}</h2>
      <p>Design tokens are scoped by theme class on the body element.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTheme } from './composables/useTheme';

const { theme, setTheme } = useTheme('light');

const toggleTheme = () => {
  setTheme(theme.value === 'light' ? 'dark' : 'light');
};
</script>

<style scoped>
.app {
  min-height: 100vh;
  padding: 2rem;
  background-color: var(--color-background-default);
  color: var(--color-text-primary);
  transition: background-color 0.3s, color 0.3s;
}

.theme-button {
  background-color: var(--color-primary);
  color: #FFFFFF;
  border-radius: var(--radius-lg);
  padding: var(--spacing-md) var(--spacing-lg);
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
  padding: var(--spacing-lg);
  background-color: var(--color-background-muted);
  border-radius: var(--radius-md);
}
</style>

