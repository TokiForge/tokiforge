import React, { createContext, useContext, useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { ThemeRuntime } from '@tokiforge/core';
import type { DesignTokens, ThemeConfig } from '@tokiforge/core';

interface ThemeContextValue {
  theme: string;
  tokens: DesignTokens;
  setTheme: (themeName: string) => Promise<void>;
  nextTheme: () => Promise<void>;
  availableThemes: string[];

  runtime: ThemeRuntime;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  config: ThemeConfig;
  selector?: string;
  prefix?: string;
  defaultTheme?: string;
  /** LocalStorage key for persisting selected theme (e.g. 'tokiforge-theme') */
  storageKey?: string;
  /** Whether to read/write theme from storage (default: true when storageKey is set) */
  persist?: boolean;
  /** Callback when theme changes (e.g. analytics) */
  onThemeChange?: (themeName: string) => void;
  children?: React.ReactNode;
}

const DEFAULT_STORAGE_KEY = 'tokiforge-theme';

export function ThemeProvider({
  config,
  selector = ':root',
  prefix = 'hf',
  defaultTheme,
  storageKey = DEFAULT_STORAGE_KEY,
  persist = true,
  onThemeChange,
  children,
}: Readonly<ThemeProviderProps>) {
  const runtimeRef = useRef<ThemeRuntime | null>(null);
  runtimeRef.current ??= new ThemeRuntime(config);
  const runtime = runtimeRef.current;

  const initialTheme =
    defaultTheme || config.defaultTheme || config.themes[0]?.name || 'default';
  const [activeTheme, setActiveTheme] = useState(() => {
    if (globalThis.window === undefined || persist === false) return initialTheme;
    try {
      const key = storageKey ?? DEFAULT_STORAGE_KEY;
      const saved = globalThis.localStorage?.getItem(key);
      if (saved && runtime.getAvailableThemes().includes(saved)) return saved;
    } catch {
      // ignore
    }
    return initialTheme;
  });
  const [tokens, setTokens] = useState<DesignTokens>({});
  const [isLoading, setIsLoading] = useState(false);

  const themeRef = useRef(activeTheme);
  themeRef.current = activeTheme;
  useEffect(() => {
    setIsLoading(true);
    try {
      const initial = themeRef.current || defaultTheme || config.defaultTheme || config.themes[0]?.name || 'default';
      runtime.applyTheme(initial, selector, prefix);
      setActiveTheme(runtime.getCurrentTheme() || initial);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
    return () => {
      runtime.destroy();
    };
  }, [runtime, selector, prefix, defaultTheme, config.defaultTheme, config.themes]);

  useEffect(() => {
    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      setActiveTheme(customEvent.detail.theme);
      setTokens(customEvent.detail.tokens);
    };

    globalThis.addEventListener('tokiforge:theme-change', handleThemeChange);
    return () => {
      globalThis.removeEventListener('tokiforge:theme-change', handleThemeChange);
    };
  }, []);

  const setTheme = useCallback(
    async (themeName: string) => {
      setIsLoading(true);
      try {
        runtime.applyTheme(themeName, selector, prefix);
        setActiveTheme(themeName);
        if (persist && globalThis.window !== undefined && globalThis.localStorage) {
          try {
            globalThis.localStorage.setItem(storageKey ?? DEFAULT_STORAGE_KEY, themeName);
          } catch {
            // ignore
          }
        }
        onThemeChange?.(themeName);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    },
    [runtime, selector, prefix, storageKey, persist, onThemeChange]
  );

  const nextTheme = useCallback(async () => {
    const newTheme = runtime.nextTheme();
    await setTheme(newTheme);
  }, [runtime, setTheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: activeTheme,
      tokens,
      setTheme,
      nextTheme,
      availableThemes: runtime.getAvailableThemes(),
      runtime,
      isLoading,
    }),
    [activeTheme, tokens, setTheme, nextTheme, runtime, isLoading]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

