import { writable, derived } from 'svelte/store';
import { ThemeController, type DesignTokens, type ThemeConfig } from '@tokiforge/core';

export interface SvelteKitThemeOptions {
    selector?: string;
    prefix?: string;
    defaultTheme?: string;
    /** Theme resolved on the server (e.g. from a cookie); wins over defaultTheme */
    ssrTheme?: string;
    /** Read/write the selection from localStorage (default: true) */
    persist?: boolean;
    /** LocalStorage key (default: 'tokiforge-theme') */
    storageKey?: string;
}

export function createThemeStore(
    config: ThemeConfig,
    options: SvelteKitThemeOptions = {}
) {
    const {
        selector = ':root',
        prefix = 'hf',
        defaultTheme,
        ssrTheme,
        persist = true,
        storageKey,
    } = options;

    const controller = new ThemeController(config, {
        selector,
        prefix,
        defaultTheme: ssrTheme || defaultTheme,
        persist,
        storageKey,
    });

    const initial = controller.getSnapshot();
    const theme = writable<string>(initial.theme);
    const tokens = writable<DesignTokens>(initial.tokens);

    controller.subscribe((snapshot) => {
        theme.set(snapshot.theme);
        tokens.set(snapshot.tokens);
    });

    if (typeof window !== 'undefined') {
        try {
            controller.init();
        } catch (err) {
            console.error('Failed to initialize theme runtime:', err);
        }
    }

    return {
        theme,
        tokens,
        setTheme: async (name: string) => {
            controller.setTheme(name);
        },
        nextTheme: async () => {
            controller.nextTheme();
        },
        availableThemes: derived(theme, () => controller.getAvailableThemes()),
        runtime: controller.runtime,
    };
}
