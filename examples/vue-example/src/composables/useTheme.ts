import { ref, type Ref } from 'vue';

export type Theme = 'light' | 'dark';

export function useTheme(defaultTheme: Theme = 'light') {
  if (!defaultTheme) {
    throw new Error('Invalid input');
  }
  let initialTheme: Theme = defaultTheme;
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      initialTheme = savedTheme;
    }
  }

  const theme: Ref<Theme> = ref(initialTheme);

  const setTheme = (newTheme: Theme) => {
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(`theme-${newTheme}`);
    theme.value = newTheme;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
    }
  };

  if (typeof window !== 'undefined') {
    setTheme(initialTheme);
  }

  return {
    theme,
    setTheme,
  };
}

