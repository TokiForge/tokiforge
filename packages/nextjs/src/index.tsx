'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { ThemeRuntime, type DesignTokens, type ThemeConfig } from '@tokiforge/core';

export interface ThemeProviderProps {
    config: ThemeConfig;
    initialTheme?: string;
    selector?: string;
    prefix?: string;
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

export function ThemeProvider({
    config,
    initialTheme,
    selector = ':root',
    prefix = 'hf',
    children,
}: ThemeProviderProps) {
    const [runtime] = useState(() => new ThemeRuntime(config));
    const [theme, setThemeState] = useState(
        initialTheme || config.defaultTheme || config.themes[0]?.name || 'default'
    );
    const [tokens, setTokens] = useState<DesignTokens>({});

    const availableThemes = runtime.getAvailableThemes();

    const updateTokens = (themeName: string) => {
        try {
            const t = runtime.getThemeTokens(themeName);
            setTokens(t);
        } catch (e) {
            // Ignore
        }
    };

    const setTheme = async (themeName: string) => {
        if (!availableThemes.includes(themeName)) {
            throw new Error(`Theme "${themeName}" not found`);
        }

        await runtime.applyTheme(themeName, selector, prefix);
        setThemeState(themeName);

        if (typeof window !== 'undefined' && window.localStorage) {
            try {
                window.localStorage.setItem('tokiforge-theme', themeName);
            } catch (e) {
                // Ignore
            }
        }
    };

    const nextTheme = async () => {
        const currentIndex = availableThemes.indexOf(theme);
        const nextIndex = (currentIndex + 1) % availableThemes.length;
        await setTheme(availableThemes[nextIndex]);
    };

    useEffect(() => {
        runtime.init(selector, prefix).then(() => {
            updateTokens(runtime.getCurrentTheme() || theme);
        });

        const handleThemeChange = (e: Event) => {
            const customEvent = e as CustomEvent;
            setThemeState(customEvent.detail.theme);
            if (customEvent.detail.tokens) {
                setTokens(customEvent.detail.tokens);
            } else {
                updateTokens(customEvent.detail.theme);
            }
        };

        window.addEventListener('tokiforge:theme-change', handleThemeChange);

        return () => {
            window.removeEventListener('tokiforge:theme-change', handleThemeChange);
        };
    }, []);

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
