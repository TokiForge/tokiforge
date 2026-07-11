'use client';

import {
    createContext,
    useContext,
    useEffect,
    useCallback,
    useMemo,
    useRef,
    useSyncExternalStore,
    type ReactNode,
} from 'react';
import { ThemeController, type ThemeRuntime, type DesignTokens, type ThemeConfig } from '@tokiforge/core';

export interface ThemeProviderProps {
    config: ThemeConfig;
    initialTheme?: string;
    selector?: string;
    prefix?: string;
    /** LocalStorage key for persisting selected theme (e.g. 'tokiforge-theme') */
    storageKey?: string;
    /** Whether to read/write theme from storage (default: true) */
    persist?: boolean;
    /** Callback when theme changes (e.g. analytics) */
    onThemeChange?: (themeName: string) => void;
    children: ReactNode;
}

export interface ThemeContextType<T extends DesignTokens = DesignTokens> {
    theme: string;
    tokens: T;
    setTheme: (themeName: string) => Promise<void>;
    nextTheme: () => Promise<void>;
    availableThemes: string[];
    runtime: ThemeRuntime;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const DEFAULT_STORAGE_KEY = 'tokiforge-theme';

export function ThemeProvider({
    config,
    initialTheme,
    selector = ':root',
    prefix = 'hf',
    storageKey = DEFAULT_STORAGE_KEY,
    persist = true,
    onThemeChange,
    children,
}: ThemeProviderProps) {
    const onThemeChangeRef = useRef(onThemeChange);
    onThemeChangeRef.current = onThemeChange;

    const controllerRef = useRef<ThemeController | null>(null);
    controllerRef.current ??= new ThemeController(config, {
        selector,
        prefix,
        defaultTheme: initialTheme,
        storageKey,
        persist,
        onThemeChange: (themeName) => onThemeChangeRef.current?.(themeName),
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

    const nextTheme = useCallback(async () => {
        controller.nextTheme();
    }, [controller]);

    const value = useMemo<ThemeContextType>(
        () => ({
            theme: snapshot.theme,
            tokens: snapshot.tokens,
            setTheme,
            nextTheme,
            availableThemes: controller.getAvailableThemes(),
            runtime: controller.runtime,
        }),
        [snapshot, setTheme, nextTheme, controller]
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme<T extends DesignTokens = DesignTokens>(): ThemeContextType<T> {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context as ThemeContextType<T>;
}
