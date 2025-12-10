import { createSignal, onCleanup, type Accessor } from 'solid-js';
import { ThemeRuntime, type DesignTokens, type ThemeConfig } from '@tokiforge/core';

export interface ThemeOptions {
    selector?: string;
    prefix?: string;
    defaultTheme?: string;
    persist?: boolean;
    watchSystemTheme?: boolean;
}

export interface ThemeContext<T extends DesignTokens = DesignTokens> {
    theme: Accessor<string>;
    tokens: Accessor<T>;
    setTheme: (themeName: string) => Promise<void>;
    nextTheme: () => Promise<void>;
    availableThemes: Accessor<string[]>;
    runtime: ThemeRuntime;
}

export function createTheme<T extends DesignTokens = DesignTokens>(
    config: ThemeConfig,
    options: ThemeOptions = {}
): ThemeContext<T> {
    const {
        selector = ':root',
        prefix = 'hf',
        defaultTheme,
        persist = true,
        watchSystemTheme = false,
    } = options;

    const runtime = new ThemeRuntime(config);
    const availableThemesList = runtime.getAvailableThemes();

    let initialTheme = defaultTheme || config.defaultTheme || availableThemesList[0] || 'default';

    if (typeof window !== 'undefined') {
        if (persist && window.localStorage) {
            try {
                const saved = window.localStorage.getItem('tokiforge-theme');
                if (saved && availableThemesList.includes(saved)) {
                    initialTheme = saved;
                }
            } catch (e) {
                // Ignore
            }
        }

        if (watchSystemTheme && !persist) {
            const systemTheme = ThemeRuntime.detectSystemTheme();
            if (availableThemesList.includes(systemTheme)) {
                initialTheme = systemTheme;
            }
        }
    }

    const [theme, setThemeSignal] = createSignal(initialTheme);
    const [tokens, setTokens] = createSignal<T>({} as T);

    const updateTokens = (themeName: string) => {
        try {
            const t = runtime.getThemeTokens(themeName);
            setTokens(t as T);
        } catch (e) {
            // Ignore
        }
    };

    const setTheme = async (name: string) => {
        if (!availableThemesList.includes(name)) {
            throw new Error(`Theme "${name}" not found`);
        }

        await runtime.applyTheme(name, selector, prefix);
        setThemeSignal(name);

        if (typeof window !== 'undefined' && persist && window.localStorage) {
            try {
                window.localStorage.setItem('tokiforge-theme', name);
            } catch (e) {
                // Ignore
            }
        }
    };

    const nextTheme = async () => {
        const currentIndex = availableThemesList.indexOf(theme());
        const nextIndex = (currentIndex + 1) % availableThemesList.length;
        await setTheme(availableThemesList[nextIndex]);
    };

    if (typeof window !== 'undefined') {
        runtime.init(selector, prefix).then(() => {
            updateTokens(runtime.getCurrentTheme() || initialTheme);
        }).catch(console.error);

        const handleThemeChange = (e: Event) => {
            const customEvent = e as CustomEvent;
            setThemeSignal(customEvent.detail.theme);
            if (customEvent.detail.tokens) {
                setTokens(customEvent.detail.tokens);
            } else {
                updateTokens(customEvent.detail.theme);
            }
        };

        window.addEventListener('tokiforge:theme-change', handleThemeChange);

        if (watchSystemTheme) {
            const unwatch = runtime.watchSystemTheme((systemTheme: string) => {
                if (availableThemesList.includes(systemTheme)) {
                    setTheme(systemTheme);
                }
            });

            onCleanup(() => {
                window.removeEventListener('tokiforge:theme-change', handleThemeChange);
                unwatch();
            });
        } else {
            onCleanup(() => {
                window.removeEventListener('tokiforge:theme-change', handleThemeChange);
            });
        }
    }

    return {
        theme,
        tokens,
        setTheme,
        nextTheme,
        availableThemes: () => availableThemesList,
        runtime,
    };
}
