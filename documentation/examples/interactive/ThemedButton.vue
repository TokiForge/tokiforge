<script setup lang="ts">
import { ref } from 'vue';
import { provideTheme } from '@tokiforge/vue';

// Define theme configuration
const config = {
  themes: [
    {
      name: 'light',
      tokens: {
        color: {
          primary: { value: '#3b82f6' },
          secondary: { value: '#8b5cf6' },
          background: { value: '#ffffff' },
          text: { value: '#1f2937' },
        },
        spacing: {
          sm: { value: '0.5rem' },
          md: { value: '1rem' },
          lg: { value: '1.5rem' },
        },
      },
    },
    {
      name: 'dark',
      tokens: {
        color: {
          primary: { value: '#60a5fa' },
          secondary: { value: '#a78bfa' },
          background: { value: '#1f2937' },
          text: { value: '#f9fafb' },
        },
        spacing: {
          sm: { value: '0.5rem' },
          md: { value: '1rem' },
          lg: { value: '1.5rem' },
        },
      },
    },
  ],
  defaultTheme: 'light',
};

// Provide theme to child components
const { theme, setTheme, availableThemes } = provideTheme(config);

const buttonText = ref('Click me!');
const clickCount = ref(0);

const handleClick = () => {
  clickCount.value++;
  buttonText.value = `Clicked ${clickCount.value} time${clickCount.value !== 1 ? 's' : ''}!`;
};
</script>

<template>
  <div class="demo-container">
    <div class="theme-switcher">
      <label>Theme:</label>
      <select :value="theme" @change="setTheme($event.target.value)">
        <option v-for="t in availableThemes" :key="t" :value="t">
          {{ t }}
        </option>
      </select>
    </div>

    <div class="button-demo">
      <button class="themed-button" @click="handleClick">
        {{ buttonText }}
      </button>
      <p class="description">
        This button uses theme tokens for its styling. Switch themes to see it change!
      </p>
    </div>
  </div>
</template>

<style scoped>
.demo-container {
  padding: var(--hf-spacing-lg);
  background: var(--hf-color-background);
  color: var(--hf-color-text);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.theme-switcher {
  display: flex;
  align-items: center;
  gap: var(--hf-spacing-md);
  margin-bottom: var(--hf-spacing-lg);
}

.theme-switcher label {
  font-weight: 600;
  color: var(--hf-color-text);
}

.theme-switcher select {
  padding: var(--hf-spacing-sm) var(--hf-spacing-md);
  border: 2px solid var(--hf-color-primary);
  border-radius: 6px;
  background: var(--hf-color-background);
  color: var(--hf-color-text);
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
}

.theme-switcher select:hover {
  border-color: var(--hf-color-secondary);
}

.button-demo {
  text-align: center;
}

.themed-button {
  padding: var(--hf-spacing-md) calc(var(--hf-spacing-lg) * 1.5);
  background: var(--hf-color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.themed-button:hover {
  background: var(--hf-color-secondary);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.themed-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.description {
  margin-top: var(--hf-spacing-lg);
  color: var(--hf-color-text);
  opacity: 0.8;
  font-size: 0.9rem;
}
</style>
