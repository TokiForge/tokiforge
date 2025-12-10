import type { DesignTokens, ThemeConfig } from '@tokiforge/core';
import { ThemeRuntime } from '@tokiforge/core';

export interface TokiForgeStorybookConfig {
  /**
   * Theme configuration
   */
  config: ThemeConfig;
  /**
   * CSS selector for theme injection (default: ':root')
   */
  selector?: string;
  /**
   * CSS variable prefix (default: 'hf')
   */
  prefix?: string;
  /**
   * Enable theme switcher in toolbar
   */
  enableThemeSwitcher?: boolean;
  /**
   * Enable token viewer in addon panel
   */
  enableTokenViewer?: boolean;
}

/**
 * Storybook addon for TokiForge themes
 */
export class TokiForgeStorybookAddon {
  private runtime: ThemeRuntime;
  private config: TokiForgeStorybookConfig;
  private currentTheme: string;

  constructor(config: TokiForgeStorybookConfig) {
    this.config = {
      selector: ':root',
      prefix: 'hf',
      enableThemeSwitcher: true,
      enableTokenViewer: true,
      ...config,
    };

    this.runtime = new ThemeRuntime(this.config.config);
    this.currentTheme = this.config.config.defaultTheme || this.config.config.themes[0]?.name || 'default';
  }

  /**
   * Initialize the addon
   */
  async init(): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }

    await this.runtime.init(this.config.selector, this.config.prefix);
    await this.runtime.applyTheme(this.currentTheme, this.config.selector, this.config.prefix);
  }

  /**
   * Get current theme
   */
  getCurrentTheme(): string {
    return this.currentTheme;
  }

  /**
   * Get available themes
   */
  getAvailableThemes(): string[] {
    return this.runtime.getAvailableThemes();
  }

  /**
   * Switch theme
   */
  async switchTheme(themeName: string): Promise<void> {
    if (!this.runtime.getAvailableThemes().includes(themeName)) {
      throw new Error(`Theme "${themeName}" not found`);
    }

    this.currentTheme = themeName;
    await this.runtime.applyTheme(themeName, this.config.selector, this.config.prefix);
  }

  /**
   * Get tokens for current theme
   */
  getTokens(): DesignTokens {
    return this.runtime.getThemeTokens(this.currentTheme);
  }

  /**
   * Get tokens for a specific theme
   */
  getThemeTokens(themeName: string): DesignTokens {
    return this.runtime.getThemeTokens(themeName);
  }
}

/**
 * Storybook decorator for theme support
 */
export function withTokiForge(config: TokiForgeStorybookConfig) {
  const addon = new TokiForgeStorybookAddon(config);

  return (storyFn: any) => {
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
      themes: config.config.themes.map(t => t.name),
      defaultTheme: config.config.defaultTheme || config.config.themes[0]?.name,
      enableThemeSwitcher: config.enableThemeSwitcher,
      enableTokenViewer: config.enableTokenViewer,
    },
  };
}

