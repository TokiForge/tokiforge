import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useSyncExternalStore,
} from 'react';
import { ThemeRuntime, ThemeController } from '@tokiforge/core/runtime';
import type { DesignTokens, ThemeConfig } from '@tokiforge/core/runtime';
import styled from 'styled-components';
export type { DesignTokens, ThemeConfig } from '@tokiforge/core/runtime';
export {
  ThemeRuntime,
  ThemeController,
  TokenExporter,
  ColorUtils,
  AccessibilityUtils,
} from '@tokiforge/core/runtime';

interface ThemeContextValue {
  runtime: ThemeRuntime;
  currentTheme: string | null;
  theme: string;
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
  selector?: string;
  defaultTheme?: string;
  storageKey?: string;
  persist?: boolean;
  watchSystemTheme?: boolean;
  onThemeChange?: (themeName: string) => void;
}

export function ThemeProvider({
  config,
  children,
  prefix = 'hf',
  selector = ':root',
  defaultTheme,
  storageKey = 'tokiforge-theme',
  persist = true,
  watchSystemTheme = false,
  onThemeChange,
}: Readonly<ThemeProviderProps>) {
  const onThemeChangeRef = useRef(onThemeChange);
  onThemeChangeRef.current = onThemeChange;

  const controllerRef = useRef<ThemeController | null>(null);
  controllerRef.current ??= new ThemeController(config, {
    selector,
    prefix,
    defaultTheme,
    storageKey,
    persist,
    watchSystemTheme,
    onThemeChange: (name) => onThemeChangeRef.current?.(name),
  });
  const controller = controllerRef.current;

  const snapshot = useSyncExternalStore(
    useCallback((onStoreChange: () => void) => controller.subscribe(onStoreChange), [controller]),
    () => controller.getSnapshot(),
    () => controller.getSnapshot()
  );

  useEffect(() => {
    controller.init();
    return () => {
      controller.destroy();
    };
  }, [controller]);

  const setTheme = useCallback(
    async (themeName: string) => {
      controller.setTheme(themeName);
    },
    [controller]
  );

  const switchTheme = useCallback(
    (themeName: string) => {
      controller.setTheme(themeName);
    },
    [controller]
  );

  const nextTheme = useCallback(async () => {
    controller.nextTheme();
  }, [controller]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      runtime: controller.runtime,
      currentTheme: snapshot.theme,
      theme: snapshot.theme,
      tokens: snapshot.tokens,
      switchTheme,
      setTheme,
      nextTheme,
      availableThemes: controller.getAvailableThemes(),
    }),
    [snapshot, switchTheme, setTheme, nextTheme, controller]
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

export { styled };
