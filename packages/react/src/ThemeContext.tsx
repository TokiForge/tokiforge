import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  useSyncExternalStore,
} from 'react';
import { ThemeRuntime, ThemeController } from '@tokiforge/core';
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
  const onThemeChangeRef = useRef(onThemeChange);
  onThemeChangeRef.current = onThemeChange;

  const controllerRef = useRef<ThemeController | null>(null);
  controllerRef.current ??= new ThemeController(config, {
    selector,
    prefix,
    defaultTheme,
    storageKey,
    persist,
    onThemeChange: (themeName) => onThemeChangeRef.current?.(themeName),
    runtime: new ThemeRuntime(config),
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
      try {
        controller.setTheme(themeName);
      } catch (e) {
        console.error(e);
      }
    },
    [controller]
  );

  const nextTheme = useCallback(async () => {
    try {
      controller.nextTheme();
    } catch (e) {
      console.error(e);
    }
  }, [controller]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: snapshot.theme,
      tokens: snapshot.tokens,
      setTheme,
      nextTheme,
      availableThemes: controller.getAvailableThemes(),
      runtime: controller.runtime,
      isLoading: false,
    }),
    [snapshot, setTheme, nextTheme, controller]
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
