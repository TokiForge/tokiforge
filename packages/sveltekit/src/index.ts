import { writable, derived } from 'svelte/store';
import { ThemeRuntime, type DesignTokens, type ThemeConfig } from '@tokiforge/core';

export interface SvelteKitThemeOptions {
    selector?: string;
    prefix?: string;
    defaultTheme?: string;
    ssrTheme?: string;
}

export function createThemeStore(
    config: ThemeConfig,
    options: SvelteKitThemeOptions = {}
) {
    const {
        selector = ':root',
        prefix = 'hf',
        defaultTheme,
        ssrTheme
    } = options;

    const runtime = new ThemeRuntime(config);
    const initialTheme = ssrTheme || defaultTheme || config.defaultTheme || config.themes[0]?.name || 'default';

    const theme = writable<string>(initialTheme);
    const tokens = writable<DesignTokens>({});

    const updateTokens = (name: string) => {
        try {
            const t = runtime.getThemeTokens(name);
            tokens.set(t);
        } catch {
            // Ignore
        }
    };

    updateTokens(initialTheme);

    if (typeof window !== 'undefined') {
        runtime.init(selector, prefix).then(() => {
            updateTokens(runtime.getCurrentTheme() || initialTheme);
        });

        const handleThemeChange = (e: Event) => {
            const customEvent = e as CustomEvent;
            const tName = customEvent.detail.theme;
            theme.set(tName);
            if (customEvent.detail.tokens) {
                tokens.set(customEvent.detail.tokens);
            } else {
                updateTokens(tName);
            }
        };

        window.addEventListener('tokiforge:theme-change', handleThemeChange);
    }

    return {
        theme,
        tokens,
        setTheme: async (name: string) => {
            await runtime.applyTheme(name, selector, prefix);
            theme.set(name);

            if (typeof window !== 'undefined' && window.localStorage) {
                try {
                    window.localStorage.setItem('tokiforge-theme', name);
                } catch (e) {
                    // Ignore
                }
            }
        },
        nextTheme: async () => {
            const newTheme = runtime.nextTheme();
            await runtime.applyTheme(newTheme, selector, prefix);
            theme.set(newTheme);
        },
        availableThemes: derived(theme, () => runtime.getAvailableThemes()),
        runtime,
    };
}

// Server-side helpers
export function getThemeFromCookie(cookieHeader: string | null, cookieName: string = 'tokiforge-theme'): string | null {
    if (!cookieHeader) return null;

    const cookies = cookieHeader.split(';').map(c => c.trim());
    const themeCookie = cookies.find(c => c.startsWith(`${cookieName}=`));

    return themeCookie ? themeCookie.split('=')[1] : null;
}

export function setThemeCookie(theme: string, cookieName: string = 'tokiforge-theme'): string {
    return `${cookieName}=${theme}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

export type ThemeStore = ReturnType<typeof createThemeStore>;
