---
title: Vanilla JavaScript Guide | TokiForge
description: Learn how to use TokiForge with vanilla JavaScript. No framework required. Runtime theme switching, CSS variables, and token management.
---

# Vanilla JavaScript Guide

> **TokiForge v1.2.0**

Use TokiForge with vanilla JavaScript, no framework required!

## Installation

```bash
npm install @tokiforge/core@^1.2.0
```

## Basic Usage

### 1. Import Core

```javascript
import { ThemeRuntime } from '@tokiforge/core';
```

Or with CDN:

```html
<script type="module">
  import { ThemeRuntime } from 'https://cdn.jsdelivr.net/npm/@tokiforge/core@1.2.0/dist/index.js';
</script>
```

### 2. Create Runtime

```javascript
const runtime = new ThemeRuntime({
  themes: [
    {
      name: 'light',
      tokens: {
        color: {
          primary: { value: '#7C3AED', type: 'color' },
          background: { value: '#FFFFFF', type: 'color' },
        },
      },
    },
    {
      name: 'dark',
      tokens: {
        color: {
          primary: { value: '#8B5CF6', type: 'color' },
          background: { value: '#0F172A', type: 'color' },
        },
      },
    },
  ],
  defaultTheme: 'light',
});
```

### 3. Initialize

```javascript
runtime.init();
```

### 4. Use CSS Variables

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      background-color: var(--hf-color-background);
      color: var(--hf-color-text-primary);
      transition: background-color 0.3s, color 0.3s;
    }
    
    button {
      background-color: var(--hf-color-primary);
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <h1>TokiForge Vanilla JS</h1>
  <button id="theme-toggle">Switch Theme</button>
  
  <script type="module">
    import { ThemeRuntime } from './node_modules/@tokiforge/core/dist/index.js';
    
    const runtime = new ThemeRuntime({
      themes: [
        { name: 'light', tokens: lightTokens },
        { name: 'dark', tokens: darkTokens },
      ],
      defaultTheme: 'light',
    });
    
    runtime.init();
    
    document.getElementById('theme-toggle').addEventListener('click', () => {
      const current = runtime.getCurrentTheme();
      const newTheme = current === 'light' ? 'dark' : 'light';
      runtime.applyTheme(newTheme);
    });
  </script>
</body>
</html>
```

## Advanced Usage

### Listen to Theme Changes

```javascript
window.addEventListener('TokiForge:theme-change', (e) => {
  console.log('Theme changed to:', e.detail.theme);
  console.log('Tokens:', e.detail.tokens);
});
```

### System Theme Detection

```javascript
import { ThemeRuntime } from '@tokiforge/core';

const systemTheme = ThemeRuntime.detectSystemTheme();
console.log('System prefers:', systemTheme);

const unwatch = ThemeRuntime.watchSystemTheme((theme) => {
  runtime.applyTheme(theme);
});

unwatch();
```

### Get Current Tokens

```javascript
const tokens = runtime.getThemeTokens();
console.log(tokens.color.primary);
```

### Cycle Through Themes

```javascript
function nextTheme() {
  const newTheme = runtime.nextTheme();
  console.log('Switched to:', newTheme);
}
```

## Example: Complete Vanilla App

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TokiForge Vanilla Example</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: var(--hf-color-background-default);
      color: var(--hf-color-text-primary);
      padding: 2rem;
      transition: background 0.3s, color 0.3s;
      min-height: 100vh;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    
    .header {
      margin-bottom: 2rem;
    }
    
    .card {
      background: var(--hf-color-background-muted);
      padding: 2rem;
      border-radius: var(--hf-radius-lg);
      margin-bottom: 1rem;
    }
    
    button {
      background: var(--hf-color-primary);
      color: var(--hf-color-text-primary);
      border: none;
      padding: var(--hf-spacing-md) var(--hf-spacing-lg);
      border-radius: var(--hf-radius-md);
      cursor: pointer;
      font-size: 16px;
      font-weight: 600;
      transition: opacity 0.2s;
    }
    
    button:hover {
      opacity: 0.9;
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <h1>TokiForge Vanilla JS</h1>
      <p>Current theme: <span id="current-theme">light</span></p>
    </header>
    
    <div class="card">
      <h2>Welcome</h2>
      <p>This is a vanilla JavaScript example using TokiForge.</p>
      <button id="toggle-theme">Switch Theme</button>
    </div>
  </div>
  
  <script type="module">
    import { ThemeRuntime } from '@tokiforge/core';
    
    const tokens = {
      light: {
        color: {
          primary: { value: '#7C3AED', type: 'color' },
          text: { primary: { value: '#1F2937', type: 'color' } },
          background: {
            default: { value: '#FFFFFF', type: 'color' },
            muted: { value: '#F9FAFB', type: 'color' },
          },
        },
        radius: {
          sm: { value: '4px', type: 'dimension' },
          md: { value: '8px', type: 'dimension' },
          lg: { value: '12px', type: 'dimension' },
        },
        spacing: {
          xs: { value: '4px', type: 'dimension' },
          sm: { value: '8px', type: 'dimension' },
          md: { value: '16px', type: 'dimension' },
          lg: { value: '24px', type: 'dimension' },
        },
      },
      dark: {
        color: {
          primary: { value: '#8B5CF6', type: 'color' },
          text: { primary: { value: '#F8FAFC', type: 'color' } },
          background: {
            default: { value: '#0F172A', type: 'color' },
            muted: { value: '#1E293B', type: 'color' },
          },
        },
        radius: {
          sm: { value: '4px', type: 'dimension' },
          md: { value: '8px', type: 'dimension' },
          lg: { value: '12px', type: 'dimension' },
        },
        spacing: {
          xs: { value: '4px', type: 'dimension' },
          sm: { value: '8px', type: 'dimension' },
          md: { value: '16px', type: 'dimension' },
          lg: { value: '24px', type: 'dimension' },
        },
      },
    };
    
    const runtime = new ThemeRuntime({
      themes: [
        { name: 'light', tokens: tokens.light },
        { name: 'dark', tokens: tokens.dark },
      ],
      defaultTheme: 'light',
    });
    
    runtime.init();
    
    const updateUI = () => {
      document.getElementById('current-theme').textContent = 
        runtime.getCurrentTheme();
    };
    
    window.addEventListener('TokiForge:theme-change', updateUI);
    
    document.getElementById('toggle-theme').addEventListener('click', () => {
      const current = runtime.getCurrentTheme();
      runtime.applyTheme(current === 'light' ? 'dark' : 'light');
    });
    
    updateUI();
  </script>
</body>
</html>
```

## Browser Support

Works in all modern browsers that support:
- ES Modules
- CSS Custom Properties
- JavaScript (ES2020+)

## Next Steps

- See [Core API](/api/core) for full API reference
- Check [Framework Support](/guide/framework-support) for other frameworks
- Explore [Examples](/examples/react) for more patterns


