import { createSignal, onCleanup, type Accessor } from 'solid-js';
import { ThemeController, type ThemeRuntime, type DesignTokens, type ThemeConfig } from '@tokiforge/core';

export interface ThemeOptions {
    selector?: string;
    prefix?: string;
    defaultTheme?: string;
    persist?: boolean;
    watchSystemTheme?: boolean;
    /** LocalStorage key (default: 'tokiforge-theme') */
    storageKey?: string;
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
    const controller = new ThemeController(config, {
        selector: options.selector,
        prefix: options.prefix,
        defaultTheme: options.defaultTheme,
        persist: options.persist,
        storageKey: options.storageKey,
        watchSystemTheme: options.watchSystemTheme,
    });

    const initial = controller.getSnapshot();
    const [theme, setThemeSignal] = createSignal(initial.theme);
    const [tokens, setTokens] = createSignal<T>(initial.tokens as T);

    const unsubscribe = controller.subscribe((snapshot) => {
        setThemeSignal(snapshot.theme);
        setTokens(() => snapshot.tokens as T);
    });

    if (typeof window !== 'undefined') {
        controller.init();
        onCleanup(() => {
            unsubscribe();
            controller.destroy();
        });
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
        availableThemes: () => controller.getAvailableThemes(),
        runtime: controller.runtime,
    };
}
