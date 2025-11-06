import { inject, provide, ref, computed, type Ref, type ComputedRef } from 'vue';
import type { DesignTokens, ThemeConfig } from '@tokiforge/core';
import { ThemeRuntime as ThemeRuntimeClass, TokenExporter, ThemeRuntime } from '@tokiforge/core';

const ThemeKey = Symbol('tokiforge-theme');

export interface ProvideThemeOptions {
  selector?: string;
  prefix?: string;
  defaultTheme?: string;
  mode?: 'dynamic' | 'static';
  persist?: boolean;
  watchSystemTheme?: boolean;
  bodyClassPrefix?: string;
}

interface ThemeContext {
  theme: Ref<string>;
  tokens: ComputedRef<DesignTokens>;
  setTheme: (themeName: string) => void;
  nextTheme: () => void;
  availableThemes: ComputedRef<string[]>;
  runtime: ThemeRuntimeClass;
  generateCSS?: (themeName?: string) => string;
}

export function provideTheme(
  config: ThemeConfig,
  options: ProvideThemeOptions = {}
): ThemeContext {
  const {
    selector = ':root',
    prefix = 'hf',
    defaultTheme,
    mode = 'dynamic',
    persist = true,
    watchSystemTheme = false,
    bodyClassPrefix = 'theme',
  } = options;

  const runtime = new ThemeRuntimeClass(config);
  const availableThemes = runtime.getAvailableThemes();
  
  let initialTheme = defaultTheme || config.defaultTheme || availableThemes[0] || 'default';
  
  if (typeof window !== 'undefined') {
    if (persist) {
      const saved = localStorage.getItem('tokiforge-theme');
      if (saved && availableThemes.includes(saved)) {
        initialTheme = saved;
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
  const tokens = computed(() => runtime.getThemeTokens(theme.value));

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
    
    if (typeof window !== 'undefined' && persist) {
      localStorage.setItem('tokiforge-theme', name);
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

  const context: ThemeContext = {
    theme,
    tokens,
    setTheme,
    nextTheme,
    availableThemes: computed(() => availableThemes),
    runtime,
    ...(mode === 'static' ? { generateCSS } : {}),
  };

  provide(ThemeKey, context);

  return context;
}

export function useTheme(): ThemeContext {
  const context = inject<ThemeContext>(ThemeKey);
  if (!context) {
    throw new Error('useTheme must be used within a component that provides theme context');
  }
  return context;
}

