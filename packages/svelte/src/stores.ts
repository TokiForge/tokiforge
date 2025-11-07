import { writable, derived } from 'svelte/store';
import { ThemeRuntime } from '@tokiforge/core';
import type { ThemeConfig } from '@tokiforge/core';

export function createThemeStore(
  config: ThemeConfig,
  selector: string = ':root',
  prefix: string = 'hf',
  defaultTheme?: string
) {
  const runtime = new ThemeRuntime(config);
  const themeName = defaultTheme || config.defaultTheme || config.themes[0]?.name || 'default';
  
  const theme = writable<string>(themeName);
  const tokens = derived(theme, ($theme) => runtime.getThemeTokens($theme));

  if (typeof window !== 'undefined') {
    runtime.init(selector, prefix);

    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      theme.set(customEvent.detail.theme);
    };

    window.addEventListener('tokiforge:theme-change', handleThemeChange);
  }

  return {
    theme,
    tokens,
    setTheme: (name: string) => {
      runtime.applyTheme(name, selector, prefix);
      theme.set(name);
    },
    nextTheme: () => {
      const newTheme = runtime.nextTheme();
      theme.set(newTheme);
    },
    availableThemes: derived(theme, () => runtime.getAvailableThemes()),
    runtime,
  };
}

export type ThemeStore = ReturnType<typeof createThemeStore>;

