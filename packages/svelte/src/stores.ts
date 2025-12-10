import { writable, derived } from 'svelte/store';
import { ThemeRuntime, type DesignTokens } from '@tokiforge/core';
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
  const tokens = writable<DesignTokens>({});

  const updateTokens = (name: string) => {
    try {
      const t = runtime.getThemeTokens(name);
      tokens.set(t);
    } catch {
      // Tokens will be loaded when runtime initializes
    }
  };

  updateTokens(themeName);

  if (typeof window !== 'undefined') {
    try {
      runtime.init(selector, prefix);
      updateTokens(runtime.getCurrentTheme() || themeName);
    } catch (err) {
      console.error('Failed to initialize theme runtime:', err);
    }

    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      const tName = customEvent.detail.theme;
      theme.set(tName);
      if (customEvent.detail.tokens) {
        tokens.set(customEvent.detail.tokens);
      } else {
        updateTokens(tName);
      }
    };

    window.addEventListener('tokiforge:theme-change', handleThemeChange);
  }

  return {
    theme,
    tokens,
    setTheme: async (name: string) => {
      runtime.applyTheme(name, selector, prefix);
      theme.set(name);
    },
    nextTheme: async () => {
      const newTheme = runtime.nextTheme();
      runtime.applyTheme(newTheme, selector, prefix);
      theme.set(newTheme);
    },
    availableThemes: derived(theme, () => runtime.getAvailableThemes()),
    runtime,
  };
}

export type ThemeStore = ReturnType<typeof createThemeStore>;

