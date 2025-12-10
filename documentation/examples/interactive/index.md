---
title: Interactive Examples | TokiForge
description: Live, editable examples demonstrating TokiForge features. Try theme switching, token editing, and see real-time results.
---

# Interactive Examples

Live, editable examples demonstrating TokiForge features.

## Basic Theming

### Themed Button

<script setup>
import LiveExample from '../../components/LiveExample.vue';
import ThemedButton from './ThemedButton.vue';
</script>

<LiveExample
  title="Themed Button with Dynamic Switching"
  description="A button component that responds to theme changes in real-time."
  :code="`<script setup>
import { provideTheme } from '@tokiforge/vue';

const config = {
  themes: [
    {
      name: 'light',
      tokens: {
        color: {
          primary: { value: '#3b82f6' },
          background: { value: '#ffffff' },
          text: { value: '#1f2937' },
        },
      },
    },
    {
      name: 'dark',
      tokens: {
        color: {
          primary: { value: '#60a5fa' },
          background: { value: '#1f2937' },
          text: { value: '#f9fafb' },
        },
      },
    },
  ],
};

const { theme, setTheme } = provideTheme(config);
&lt;/script&gt;

<template>
  <button class='themed-button'>
    Click me!
  </button>
&lt;/template&gt;

<style>
.themed-button {
  background: var(--hf-color-primary);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 8px;
}
&lt;/style&gt;`"
  language="vue"
  :showPreview="true"
>
  <template #preview>
    <ThemedButton />
  </template>
</LiveExample>

## Why This Works

TokiForge automatically:
1. **Injects CSS variables** based on your token configuration
2. **Updates them dynamically** when themes change
3. **Persists theme preference** in localStorage
4. **Handles SSR** gracefully

## Next Steps

- Explore [Custom Tokens](/guide/design-tokens)
- Learn about [Advanced Features](/guide/advanced-features)
- Build a [Complete Theme System](/examples/full-apps)
