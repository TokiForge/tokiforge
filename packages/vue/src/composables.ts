import { inject, provide, ref, computed, type Ref, type ComputedRef, type InjectionKey } from 'vue';
import type { DesignTokens, ThemeConfig } from '@tokiforge/core';
import { ThemeRuntime as ThemeRuntimeClass, TokenExporter, ThemeRuntime } from '@tokiforge/core';

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
  tokens: ComputedRef<T>;
  setTheme: (themeName: string) => void;
  nextTheme: () => void;
  availableThemes: ComputedRef<string[]>;
  runtime: ThemeRuntimeClass;
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
  const runtime = new ThemeRuntimeClass(themeConfig);
  const availableThemes = runtime.getAvailableThemes();
  
  let initialTheme = defaultTheme || themeConfig.defaultTheme || availableThemes[0] || 'default';
  
  if (typeof window !== 'undefined') {
    if (persist && window.localStorage && typeof window.localStorage.getItem === 'function') {
      try {
        const saved = window.localStorage.getItem('tokiforge-theme');
        if (saved && availableThemes.includes(saved)) {
          initialTheme = saved;
        }
      } catch (e) {
        // Ignore localStorage access errors
      }
    }
    
    if (watchSystemTheme && !persist) {
      const systemTheme = ThemeRuntime.detectSystemTheme();
      if (availableThemes.includes(systemTheme)) {
        initialTheme = systemTheme;
      }
    }
  }

  const theme = ref(initialTheme);
  const tokens = computed(() => runtime.getThemeTokens(theme.value) as T);

  const setTheme = (name: string) => {
    if (!availableThemes.includes(name)) {
      throw new Error(`Theme "${name}" not found. Available themes: ${availableThemes.join(', ')}`);
    }

    if (mode === 'static') {
      availableThemes.forEach(t => {
        document.body.classList.remove(`${bodyClassPrefix}-${t}`);
      });
      document.body.classList.add(`${bodyClassPrefix}-${name}`);
    } else {
      runtime.applyTheme(name, selector, prefix);
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
    } else {
      runtime.init(selector, prefix);
    }

    if (watchSystemTheme) {
      const unwatch = runtime.watchSystemTheme((systemTheme) => {
        if (availableThemes.includes(systemTheme)) {
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
    };

    window.addEventListener('tokiforge:theme-change', handleThemeChange);
  }

  const nextTheme = () => {
    const currentIndex = availableThemes.indexOf(theme.value);
    const nextIndex = (currentIndex + 1) % availableThemes.length;
    setTheme(availableThemes[nextIndex]);
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

  const context: ThemeContext<T> = {
    theme,
    tokens,
    setTheme,
    nextTheme,
    availableThemes: computed(() => availableThemes),
    runtime,
    ...(mode === 'static' ? { generateCSS } : {}),
  };

  provide(ThemeKey, context as ThemeContext<DesignTokens>);

  return context;
}

export function useTheme<T extends DesignTokens = DesignTokens>(): ThemeContext<T> {
  const context = inject<ThemeContext<DesignTokens>>(ThemeKey);
  if (!context) {
    throw new Error('useTheme must be used within a component that provides theme context');
  }
  return context as ThemeContext<T>;
}

