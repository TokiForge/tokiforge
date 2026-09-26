import { inject, provide, ref, computed, onScopeDispose, type Ref, type ComputedRef, type InjectionKey } from 'vue';
import type { DesignTokens, ThemeConfig } from '@tokiforge/core/runtime';
import { ThemeController, TokenExporter } from '@tokiforge/core/runtime';

const ThemeKey: InjectionKey<ThemeContext<DesignTokens>> = Symbol('tokiforge-theme');

export interface ProvideThemeOptions {
  selector?: string;
  prefix?: string;
  defaultTheme?: string;
  mode?: 'dynamic' | 'static';
  persist?: boolean;
  storageKey?: string;
  onThemeChange?: (themeName: string) => void;
  watchSystemTheme?: boolean;
  bodyClassPrefix?: string;
}

export type ExtractTokenType<T extends ThemeConfig> = T['themes'][number] extends { tokens: infer TokenType }
  ? TokenType extends DesignTokens
    ? TokenType
    : DesignTokens
  : DesignTokens;

export interface ThemeContext<T extends DesignTokens = DesignTokens> {
  theme: Ref<string>;
  tokens: Ref<T>;
  setTheme: (themeName: string) => Promise<void>;
  nextTheme: () => Promise<void>;
  availableThemes: ComputedRef<string[]>;
  runtime: ThemeController['runtime'];
  generateCSS?: (themeName?: string) => string;
}

export function provideTheme<T extends DesignTokens>(
  config: { themes: Array<{ name: string; tokens: T }>; defaultTheme?: string },
  options?: ProvideThemeOptions
): ThemeContext<T>;
export function provideTheme(
  config: ThemeConfig,
  options?: ProvideThemeOptions
): ThemeContext<DesignTokens>;
export function provideTheme<T extends DesignTokens = DesignTokens>(
  config: ThemeConfig | { themes: Array<{ name: string; tokens: T }>; defaultTheme?: string },
  options: ProvideThemeOptions = {}
): ThemeContext<T> {
  const {
    selector = ':root',
    prefix = 'hf',
    defaultTheme,
    mode = 'dynamic',
    persist = true,
    storageKey = 'tokiforge-theme',
    onThemeChange,
    watchSystemTheme = false,
    bodyClassPrefix = 'theme',
  } = options;

  const themeConfig = config as ThemeConfig;
  const controller = new ThemeController(themeConfig, {
    selector,
    prefix,
    defaultTheme,
    persist,
    storageKey,
    watchSystemTheme,
    onThemeChange,
  });

  const availableThemesList = controller.getAvailableThemes();
  const initial = controller.getSnapshot();
  const theme = ref(initial.theme);
  const tokens = ref<DesignTokens>(initial.tokens);

  const updateBodyClass = (name: string) => {
    if (typeof document === 'undefined') return;
    for (const t of availableThemesList) {
      document.body.classList.remove(`${bodyClassPrefix}-${t}`);
    }
    document.body.classList.add(`${bodyClassPrefix}-${name}`);
  };

  const unsubscribe = controller.subscribe((snapshot) => {
    theme.value = snapshot.theme;
    tokens.value = snapshot.tokens as T;
    if (mode === 'static') updateBodyClass(snapshot.theme);
  });

  if (typeof window !== 'undefined') {
    try {
      if (mode === 'dynamic') {
        controller.init();
      } else {
        updateBodyClass(initial.theme);
      }
    } catch (err) {
      console.error('Failed to initialize theme runtime:', err);
    }
  }

  try {
    onScopeDispose(() => {
      unsubscribe();
      controller.destroy();
    });
  } catch {
    // outside of a Vue effect scope (e.g. unit tests)
  }

  const setTheme = async (name: string) => {
    if (!availableThemesList.includes(name)) {
      throw new Error(`Theme "${name}" not found. Available themes: ${availableThemesList.join(', ')}`);
    }
    if (mode === 'static') {
      theme.value = name;
      tokens.value = controller.runtime.getThemeTokens(name) as T;
      updateBodyClass(name);
      if (persist && typeof window !== 'undefined') {
        try {
          window.localStorage?.setItem(storageKey, name);
        } catch {
          // ignore
        }
      }
      onThemeChange?.(name);
      return;
    }
    controller.setTheme(name);
  };

  const nextTheme = async () => {
    if (mode === 'static') {
      const currentIndex = availableThemesList.indexOf(theme.value);
      await setTheme(availableThemesList[(currentIndex + 1) % availableThemesList.length]);
      return;
    }
    controller.nextTheme();
  };

  const generateCSS = (themeName?: string) => {
    const targetTheme = themeName || theme.value;
    const themeTokens = controller.runtime.getThemeTokens(targetTheme);
    const bodySelector =
      mode === 'static' ? `body.${bodyClassPrefix}-${targetTheme}` : selector;
    return TokenExporter.exportCSS(themeTokens, { selector: bodySelector, prefix });
  };

  const context: ThemeContext<DesignTokens> = {
    theme,
    tokens,
    setTheme,
    nextTheme,
    availableThemes: computed(() => availableThemesList),
    runtime: controller.runtime,
    ...(mode === 'static' ? { generateCSS } : {}),
  };

  try {
    provide(ThemeKey, context);
  } catch {
    // provide() can only be called inside setup()
  }

  return context as unknown as ThemeContext<T>;
}

export function useTheme<T extends DesignTokens = DesignTokens>(): ThemeContext<T> {
  const context = inject<ThemeContext<DesignTokens>>(ThemeKey);
  if (!context) {
    throw new Error('useTheme must be used within a component that provides theme context');
  }
  return context as unknown as ThemeContext<T>;
}
