import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import { ThemeRuntime, type DesignTokens, type ThemeConfig } from '@tokiforge/core';

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
    const [runtime] = useState(() => new ThemeRuntime(config));
    const [theme, setThemeState] = useState(
        initialTheme || config.defaultTheme || config.themes[0]?.name || 'default'
    );
    const [tokens, setTokens] = useState<DesignTokens>({});
    const themeRef = useRef(theme);
    themeRef.current = theme;

    const availableThemes = runtime.getAvailableThemes();

    const updateTokens = (themeName: string) => {
        try {
            const t = runtime.getThemeTokens(themeName);
            setTokens(t);
        } catch (e) {
            // Ignore
        }
    };
    const updateTokensRef = useRef(updateTokens);
    updateTokensRef.current = updateTokens;

    const setTheme = async (themeName: string) => {
        if (!availableThemes.includes(themeName)) {
            throw new Error(`Theme "${themeName}" not found`);
        }

        await runtime.applyTheme(themeName, selector, prefix);
        setThemeState(themeName);

        if (persist && typeof window !== 'undefined' && window.localStorage) {
            try {
                window.localStorage.setItem(storageKey, themeName);
            } catch (e) {
                // Ignore
            }
        }
        onThemeChange?.(themeName);
    };

    const nextTheme = async () => {
        const currentIndex = availableThemes.indexOf(theme);
        const nextIndex = (currentIndex + 1) % availableThemes.length;
        await setTheme(availableThemes[nextIndex]);
    };

    useEffect(() => {
        runtime.init(selector, prefix);
        updateTokensRef.current(runtime.getCurrentTheme() || themeRef.current);

        const handleThemeChange = (e: Event) => {
            const customEvent = e as CustomEvent<{ theme: string; tokens?: DesignTokens }>;
            setThemeState(customEvent.detail.theme);
            if (customEvent.detail.tokens) {
                setTokens(customEvent.detail.tokens);
            } else {
                updateTokensRef.current(customEvent.detail.theme);
            }
        };

        window.addEventListener('tokiforge:theme-change', handleThemeChange);

        return () => {
            window.removeEventListener('tokiforge:theme-change', handleThemeChange);
            runtime.destroy();
        };
    }, [runtime, selector, prefix]);

    return (
        <ThemeContext.Provider
            value={{
                theme,
                tokens,
                setTheme,
                nextTheme,
                availableThemes,
                runtime,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme<T extends DesignTokens = DesignTokens>(): ThemeContextType<T> {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context as ThemeContextType<T>;
}

// Re-export server utilities
export { createThemeSessionStorage } from './server';
