import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { ThemeRuntime, DesignTokens, ThemeConfig } from '@tokiforge/core';

interface ThemeContextValue {
  theme: string;
  tokens: DesignTokens;
  setTheme: (themeName: string) => void;
  nextTheme: () => void;
  availableThemes: string[];
  runtime: ThemeRuntime;
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
  const [tokens, setTokens] = useState<DesignTokens>(() => runtime.getThemeTokens(theme));

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

  const setTheme = useCallback((themeName: string) => {
    runtime.applyTheme(themeName, selector, prefix);
    setThemeState(themeName);
    setTokens(runtime.getThemeTokens(themeName));
  }, [runtime, selector, prefix]);

  const nextTheme = useCallback(() => {
    const newTheme = runtime.nextTheme();
    setThemeState(newTheme);
    setTokens(runtime.getThemeTokens(newTheme));
  }, [runtime]);

  const value: ThemeContextValue = {
    theme,
    tokens,
    setTheme,
    nextTheme,
    availableThemes: runtime.getAvailableThemes(),
    runtime,
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

