# Reddit Reply

Here's a Reddit-style reply you can use:

---

**You're absolutely right!** We just implemented this exact approach and it's so much cleaner. Here's what we did:

**1. Created theme CSS files:**
```css
/* themes/light.css */
body.theme-light {
  --color-primary: #7C3AED;
  --color-text-primary: #1E293B;
  --color-background-default: #FFFFFF;
  /* ... etc */
}

/* themes/dark.css */
body.theme-dark {
  --color-primary: #7C3AED;
  --color-text-primary: #F8FAFC;
  --color-background-default: #0F172A;
  /* ... etc */
}
```

**2. Simple composable:**
```typescript
// composables/useTheme.ts
export function useTheme(defaultTheme: 'light' | 'dark' = 'light') {
  const theme = ref(defaultTheme);

  const setTheme = (newTheme: 'light' | 'dark') => {
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(`theme-${newTheme}`);
    theme.value = newTheme;
    localStorage.setItem('theme', newTheme);
  };

  // Initialize on mount
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('theme');
    setTheme((saved as 'light' | 'dark') || defaultTheme);
  }

  return { theme, setTheme };
}
```

**3. Use it:**
```vue
<script setup>
import { useTheme } from './composables/useTheme';
const { theme, setTheme } = useTheme();
</script>

<style>
.app {
  background-color: var(--color-background-default);
  color: var(--color-text-primary);
}
</style>
```

That's it! No runtime injection, no complex setup. Just CSS variables scoped by body class. The composable is like 20 lines and handles everything. Design tokens live in CSS where they belong, and switching themes is just adding/removing a class.

Much simpler than the JS-based solutions we were using before. Thanks for the suggestion! 🎨

---

