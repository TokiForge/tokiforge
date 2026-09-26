import type { DesignTokens, ThemeConfig } from '@tokiforge/core/runtime';
import { ThemeController, ThemeRuntime } from '@tokiforge/core/runtime';

export interface TokiForgeStorybookConfig {
  /** Theme configuration */
  config: ThemeConfig;
  /** CSS selector for theme injection (default: ':root') */
  selector?: string;
  /** CSS variable prefix (default: 'hf') */
  prefix?: string;
  /** Persist theme choice in localStorage (default: false in Storybook) */
  persist?: boolean;
  /** LocalStorage key when persist is enabled */
  storageKey?: string;
  /** Follow OS color scheme when no persisted choice exists */
  watchSystemTheme?: boolean;
  /** Enable theme switcher in toolbar */
  enableThemeSwitcher?: boolean;
  /** Enable token viewer in addon panel */
  enableTokenViewer?: boolean;
}

/**
 * Storybook addon for TokiForge themes — wraps shared ThemeController.
 */
export class TokiForgeStorybookAddon {
  private controller: ThemeController;
  private config: Required<
    Pick<
      TokiForgeStorybookConfig,
      'selector' | 'prefix' | 'persist' | 'storageKey' | 'watchSystemTheme' | 'enableThemeSwitcher' | 'enableTokenViewer'
    >
  > &
    Pick<TokiForgeStorybookConfig, 'config'>;

  constructor(config: TokiForgeStorybookConfig) {
    this.config = {
      selector: config.selector ?? ':root',
      prefix: config.prefix ?? 'hf',
      persist: config.persist ?? false,
      storageKey: config.storageKey ?? 'tokiforge-storybook-theme',
      watchSystemTheme: config.watchSystemTheme ?? false,
      enableThemeSwitcher: config.enableThemeSwitcher ?? true,
      enableTokenViewer: config.enableTokenViewer ?? true,
      config: config.config,
    };

    this.controller = new ThemeController(this.config.config, {
      selector: this.config.selector,
      prefix: this.config.prefix,
      persist: this.config.persist,
      storageKey: this.config.storageKey,
      watchSystemTheme: this.config.watchSystemTheme,
      defaultTheme: this.config.config.defaultTheme,
      runtime: new ThemeRuntime(this.config.config),
    });
  }

  /** Initialize the addon (browser only). */
  async init(): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }
    this.controller.init();
  }

  getCurrentTheme(): string {
    return this.controller.getTheme();
  }

  getAvailableThemes(): string[] {
    return this.controller.getAvailableThemes();
  }

  async switchTheme(themeName: string): Promise<void> {
    if (!this.controller.getAvailableThemes().includes(themeName)) {
      throw new Error(`Theme "${themeName}" not found`);
    }
    this.controller.setTheme(themeName);
  }

  getTokens(): DesignTokens {
    return this.controller.getTokens();
  }

  getThemeTokens(themeName: string): DesignTokens {
    return this.controller.runtime.getThemeTokens(themeName);
  }

  destroy(): void {
    this.controller.destroy();
  }
}

/**
 * Storybook decorator for theme support
 */
export function withTokiForge(config: TokiForgeStorybookConfig) {
  const addon = new TokiForgeStorybookAddon(config);

  return (storyFn: (...args: unknown[]) => unknown) => {
    if (typeof window !== 'undefined') {
      addon.init().catch(console.error);
    }
    return storyFn();
  };
}

/**
 * Storybook parameters for theme configuration
 */
export function tokiforgeParameters(config: TokiForgeStorybookConfig) {
  return {
    tokiforge: {
      themes: config.config.themes.map((t) => t.name),
      defaultTheme: config.config.defaultTheme || config.config.themes[0]?.name,
      enableThemeSwitcher: config.enableThemeSwitcher ?? true,
      enableTokenViewer: config.enableTokenViewer ?? true,
    },
  };
}

/**
 * Addon entry for `.storybook/main.ts` `addons` array.
 * Theme config is applied in preview via `withTokiForge` / `tokiforgeParameters`.
 */
export function createTokensAddon(
  _config?: ThemeConfig | TokiForgeStorybookConfig,
  _options?: Partial<TokiForgeStorybookConfig> & { version?: string; repository?: string }
): string {
  return '@tokiforge/storybook/register';
}

export type { ThemeConfig, DesignTokens };
