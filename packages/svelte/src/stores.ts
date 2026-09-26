import { writable, derived } from 'svelte/store';
import { ThemeController, type DesignTokens } from '@tokiforge/core/runtime';
import type { ThemeConfig } from '@tokiforge/core/runtime';

export interface CreateThemeStoreOptions {
  selector?: string;
  prefix?: string;
  defaultTheme?: string;
  persist?: boolean;
  storageKey?: string;
  watchSystemTheme?: boolean;
  onThemeChange?: (themeName: string) => void;
}

export function createThemeStore(
  config: ThemeConfig,
  selectorOrOptions: string | CreateThemeStoreOptions = ':root',
  prefix: string = 'hf',
  defaultTheme?: string
) {
  const options: CreateThemeStoreOptions =
    typeof selectorOrOptions === 'string'
      ? {
          selector: selectorOrOptions,
          prefix,
          defaultTheme,
          // Historical default for the positional API
          persist: false,
        }
      : {
          selector: ':root',
          prefix: 'hf',
          persist: true,
          storageKey: 'tokiforge-theme',
          ...selectorOrOptions,
        };

  const controller = new ThemeController(config, {
    selector: options.selector,
    prefix: options.prefix,
    defaultTheme: options.defaultTheme,
    persist: options.persist,
    storageKey: options.storageKey,
    watchSystemTheme: options.watchSystemTheme,
    onThemeChange: options.onThemeChange,
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
    destroy: () => controller.destroy(),
  };
}

export type ThemeStore = ReturnType<typeof createThemeStore>;
