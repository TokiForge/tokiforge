import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { ThemeRuntime } from '@tokiforge/core';
import type { DesignTokens, ThemeConfig } from '@tokiforge/core';

interface ThemeContextValue {
  theme: string;
  tokens: DesignTokens;
  setTheme: (themeName: string) => void;
  nextTheme: () => void;
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
  children: React.ReactNode;
}

export function ThemeProvider({
  config,
  selector = ':root',
  prefix = 'hf',
  defaultTheme,
  children,
}: ThemeProviderProps) {
  const [runtime] = useState(() => new ThemeRuntime(config));
  const [theme, setThemeState] = useState(defaultTheme || config.defaultTheme || config.themes[0]?.name || 'default');
  const [tokens, setTokens] = useState<DesignTokens>({});
  const [isLoading, setIsLoading] = useState(false);

  // Initialize tokens
  useEffect(() => {
    const initProps = async () => {
      setIsLoading(true);
      try {
        if (defaultTheme) {
          await runtime.applyTheme(defaultTheme, selector, prefix);
        } else {
          await runtime.init(selector, prefix);
        }
        setThemeState(runtime.getCurrentTheme() || 'default');
        // We rely on the event listener for token updates, or we can set them here if needed
        // But runtime.init/applyTheme dispatches the event.
        // However, React state updates might be safer here too?
        // The event listener below handles it.
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    initProps();
  }, [runtime, selector, prefix, defaultTheme]);

  /*
  const [tokens, setTokens] = useState<DesignTokens>(() => runtime.getThemeTokens(theme)); 
  // Initial state for tokens is tricky with async, so start empty or try sync if available?
  // Ideally, getThemeTokens throws if not loaded. 
  // We'll let the effect handle population.
  */

  useEffect(() => {
    runtime.init(selector, prefix);
    return () => {
      runtime.destroy();
    };
  }, [runtime, selector, prefix]);

  useEffect(() => {
    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      setThemeState(customEvent.detail.theme);
      setTokens(customEvent.detail.tokens);
    };

    window.addEventListener('tokiforge:theme-change', handleThemeChange);
    return () => {
      window.removeEventListener('tokiforge:theme-change', handleThemeChange);
    };
  }, []);

  const setTheme = useCallback(async (themeName: string) => {
    setIsLoading(true);
    try {
      await runtime.applyTheme(themeName, selector, prefix);
      setThemeState(themeName);
      // setTokens is handled by event listener
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [runtime, selector, prefix]);

  const nextTheme = useCallback(async () => {
    const newTheme = runtime.nextTheme();
    await setTheme(newTheme);
  }, [runtime, setTheme]);

  const value: ThemeContextValue = {
    theme,
    tokens,
    setTheme,
    nextTheme,
    availableThemes: runtime.getAvailableThemes(),
    runtime,
    isLoading,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

