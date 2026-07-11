import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ThemeRuntime } from '@tokiforge/core';
import type { DesignTokens, ThemeConfig } from '@tokiforge/core';
import styled from 'styled-components';
export * from '@tokiforge/core';

interface ThemeContextValue {
  runtime: ThemeRuntime;
  currentTheme: string | null;
  tokens: DesignTokens;
  switchTheme: (themeName: string) => void;
  setTheme: (themeName: string) => Promise<void>;
  nextTheme: () => Promise<void>;
  availableThemes: string[];
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  config: ThemeConfig;
  children: React.ReactNode;
  prefix?: string;
}

export function ThemeProvider({
  config,
  children,
  prefix = 'hf',
}: Readonly<ThemeProviderProps>) {
  const [runtime] = useState(() => new ThemeRuntime(config));
  const [currentTheme, setCurrentTheme] = useState<string | null>(() => runtime.getCurrentTheme());
  const [tokens, setTokens] = useState<DesignTokens>(() => runtime.getThemeTokens(currentTheme ?? runtime.getAvailableThemes()[0]));

  useEffect(() => {
    runtime.init(':root', prefix);
    const handleThemeChange = () => {
      const newTheme = runtime.getCurrentTheme();
      const newTokens = runtime.getThemeTokens(newTheme ?? runtime.getAvailableThemes()[0]);
      setCurrentTheme(newTheme);
      setTokens(newTokens);
    };
    window.addEventListener('tokiforge:theme-change', handleThemeChange);
    return () => {
      window.removeEventListener('tokiforge:theme-change', handleThemeChange);
    };
  }, [runtime, prefix]);

  const switchTheme = useCallback(
    (_themeName: string) => {
      runtime.nextTheme();
    },
    [runtime]
  );

  const setTheme = useCallback(
    async (themeName: string) => {
      runtime.applyTheme(themeName);
    },
    [runtime]
  );

  const nextTheme = useCallback(async () => {
    const next = runtime.nextTheme();
    runtime.applyTheme(next);
  }, [runtime]);

  const contextValue: ThemeContextValue = {
    runtime,
    currentTheme,
    tokens,
    switchTheme,
    setTheme,
    nextTheme,
    availableThemes: runtime.getAvailableThemes(),
  };

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export { styled };
