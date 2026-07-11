import { writable, derived } from 'svelte/store';
import { ThemeController, type DesignTokens } from '@tokiforge/core';
import type { ThemeConfig } from '@tokiforge/core';

export function createThemeStore(
  config: ThemeConfig,
  selector: string = ':root',
  prefix: string = 'hf',
  defaultTheme?: string
) {
  const controller = new ThemeController(config, {
    selector,
    prefix,
    defaultTheme,
    // The Svelte store never persisted the selection historically;
    // keep that behavior to avoid surprising existing apps.
    persist: false,
  });

  const initial = controller.getSnapshot();
  const theme = writable<string>(initial.theme);
  const tokens = writable<DesignTokens>(initial.tokens);

  controller.subscribe((snapshot) => {
    theme.set(snapshot.theme);
    tokens.set(snapshot.tokens);
  });

  if (typeof window !== 'undefined') {
    try {
      controller.init();
    } catch (err) {
      console.error('Failed to initialize theme runtime:', err);
    }
  }

  return {
    theme,
    tokens,
    setTheme: async (name: string) => {
      controller.setTheme(name);
    },
    nextTheme: async () => {
      controller.nextTheme();
    },
    availableThemes: derived(theme, () => controller.getAvailableThemes()),
    runtime: controller.runtime,
  };
}

export type ThemeStore = ReturnType<typeof createThemeStore>;
