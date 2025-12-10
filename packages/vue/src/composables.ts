import { inject, provide, ref, computed, type Ref, type ComputedRef, type InjectionKey } from 'vue';
import type { DesignTokens, ThemeConfig } from '@tokiforge/core';
import { ThemeRuntime, TokenExporter } from '@tokiforge/core';

const ThemeKey: InjectionKey<ThemeContext<DesignTokens>> = Symbol('tokiforge-theme');

export interface ProvideThemeOptions {
  selector?: string;
  prefix?: string;
  defaultTheme?: string;
  mode?: 'dynamic' | 'static';
  persist?: boolean;
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
  runtime: ThemeRuntime;
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
    watchSystemTheme = false,
    bodyClassPrefix = 'theme',
  } = options;

  const themeConfig: ThemeConfig = config as ThemeConfig;
  const runtime = new ThemeRuntime(themeConfig);
  const availableThemesList = runtime.getAvailableThemes();

  let initialTheme = defaultTheme || themeConfig.defaultTheme || availableThemesList[0] || 'default';

  if (typeof window !== 'undefined') {
    if (persist && window.localStorage && typeof window.localStorage.getItem === 'function') {
      try {
        const saved = window.localStorage.getItem('tokiforge-theme');
        if (saved && availableThemesList.includes(saved)) {
          initialTheme = saved;
        }
      } catch (e) {
        // Ignore localStorage access errors
      }
    }

    if (watchSystemTheme && !persist) {
      const systemTheme = ThemeRuntime.detectSystemTheme();
      if (availableThemesList.includes(systemTheme)) {
        initialTheme = systemTheme;
      }
    }
  }

  const theme = ref(initialTheme);

  // Initialize tokens synchronously with the initial theme's tokens
  // This ensures tokens are available immediately, even before async init completes
  let initialTokens: DesignTokens = {};
  try {
    initialTokens = runtime.getThemeTokens(initialTheme);
  } catch (e) {
    // Tokens will be populated when runtime initializes
  }
  const tokens = ref<DesignTokens>(initialTokens);

  const updateTokens = (themeName: string) => {
    try {
      const t = runtime.getThemeTokens(themeName);
      tokens.value = t as T;
    } catch (e) {
      const provider = (runtime as any).themes?.get(themeName);
      if (provider && typeof provider !== 'function') {
        tokens.value = provider as T;
      }
    }
  };

  const setTheme = async (name: string) => {
    if (!availableThemesList.includes(name)) {
      throw new Error(`Theme "${name}" not found. Available themes: ${availableThemesList.join(', ')}`);
    }

    // Update tokens immediately for synchronous access
    updateTokens(name);
    
    if (mode === 'static') {
      if (typeof window !== 'undefined') {
        availableThemesList.forEach((t: string) => {
          document.body.classList.remove(`${bodyClassPrefix}-${t}`);
        });
        document.body.classList.add(`${bodyClassPrefix}-${name}`);
      }
    } else {
      if (typeof window !== 'undefined') {
        runtime.applyTheme(name, selector, prefix);
      }
    }

    theme.value = name;

    if (typeof window !== 'undefined' && persist && window.localStorage && typeof window.localStorage.setItem === 'function') {
      try {
        window.localStorage.setItem('tokiforge-theme', name);
      } catch (e) {
        // Ignore localStorage access errors
      }
    }
  };

  if (typeof window !== 'undefined') {
    if (mode === 'static') {
      const bodyClass = `${bodyClassPrefix}-${initialTheme}`;
      document.body.classList.add(bodyClass);
      updateTokens(initialTheme);
    } else {
      try {
        updateTokens(initialTheme);
      } catch (e) {
        try {
          runtime.init(selector, prefix);
          updateTokens(runtime.getCurrentTheme() || initialTheme);
          runtime.applyTheme(initialTheme, selector, prefix);
        } catch (err) {
          console.error('Failed to initialize theme runtime:', err);
        }
      }
    }

    if (watchSystemTheme) {
      const unwatch = runtime.watchSystemTheme((systemTheme: string) => {
        if (availableThemesList.includes(systemTheme)) {
          setTheme(systemTheme);
        }
      });

      if (typeof window !== 'undefined') {
        window.addEventListener('beforeunload', () => unwatch());
      }
    }
  }

  if (typeof window !== 'undefined' && mode === 'dynamic') {
    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      theme.value = customEvent.detail.theme;
      tokens.value = customEvent.detail.tokens;
    };

    window.addEventListener('tokiforge:theme-change', handleThemeChange);
  }

  const nextTheme = async () => {
    const currentIndex = availableThemesList.indexOf(theme.value);
    const nextIndex = (currentIndex + 1) % availableThemesList.length;
    await setTheme(availableThemesList[nextIndex]);
  };

  const generateCSS = (themeName?: string) => {
    const targetTheme = themeName || theme.value;
    const themeTokens = runtime.getThemeTokens(targetTheme);
    const bodySelector = mode === 'static'
      ? `body.${bodyClassPrefix}-${targetTheme}`
      : selector;

    return TokenExporter.exportCSS(themeTokens, {
      selector: bodySelector,
      prefix: prefix,
    });
  };

  const context: ThemeContext<DesignTokens> = {
    theme,
    tokens,
    setTheme,
    nextTheme,
    availableThemes: computed(() => availableThemesList),
    runtime,
    ...(mode === 'static' ? { generateCSS } : {}),
  };

  // Only call provide() if we're in a Vue component setup context
  // This allows provideTheme to be called outside setup for testing
  try {
    provide(ThemeKey, context);
  } catch (e) {
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

