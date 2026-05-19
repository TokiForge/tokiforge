import type { ThemeConfig, DesignTokens } from './types';
import { ThemeError } from './types';
import { TokenExporter } from './token-exporter';

export class ThemeRuntime {
  private readonly themes: Map<string, DesignTokens>;
  private currentTheme: string | null = null;
  private readonly defaultTheme: string;
  private systemThemeWatcher: (() => void) | null = null;

  constructor(config: ThemeConfig) {
    if (!config.themes || config.themes.length === 0) {
      throw new ThemeError('At least one theme is required');
    }

    this.themes = new Map();
    for (const theme of config.themes) {
      if (!theme.name || !theme.tokens) {
        throw new ThemeError('Theme must have a name and tokens');
      }
      this.themes.set(theme.name, theme.tokens);
    }

    this.defaultTheme = config.defaultTheme ?? config.themes[0].name;
    if (!this.themes.has(this.defaultTheme)) {
      throw new ThemeError(`Default theme "${this.defaultTheme}" not found`);
    }
  }

  init(selector: string = ':root', prefix: string = 'hf'): void {
    this.applyTheme(this.defaultTheme, selector, prefix);
  }

  applyTheme(themeName: string, selector: string = ':root', prefix: string = 'hf'): void {
    const theme = this.themes.get(themeName);
    if (!theme) {
      throw new ThemeError(`Theme "${themeName}" not found`);
    }

    this.currentTheme = themeName;
    this.injectCSS(theme, selector, prefix);

    if (globalThis.window !== undefined) {
      globalThis.window.dispatchEvent(
        new CustomEvent('tokiforge:theme-change', {
          detail: { theme: themeName, tokens: theme },
        })
      );
    }
  }

  getCurrentTheme(): string | null {
    return this.currentTheme;
  }

  getThemeTokens(themeName: string): DesignTokens {
    const theme = this.themes.get(themeName);
    if (!theme) {
      throw new ThemeError(`Theme "${themeName}" not found`);
    }
    return theme;
  }

  getAvailableThemes(): string[] {
    return Array.from(this.themes.keys());
  }

  nextTheme(): string {
    const themeList = this.getAvailableThemes();
    if (themeList.length === 0) {
      throw new ThemeError('No themes available');
    }

    const currentIndex = this.currentTheme ? themeList.indexOf(this.currentTheme) : -1;
    const nextIndex = (currentIndex + 1) % themeList.length;
    return themeList[nextIndex];
  }

  destroy(): void {
    if (this.systemThemeWatcher) {
      this.systemThemeWatcher();
      this.systemThemeWatcher = null;
    }

    if (typeof document !== 'undefined') {
      document.getElementById('tokiforge-theme')?.remove();
    }
  }

  watchSystemTheme(callback: (systemTheme: string) => void): () => void {
    if (globalThis.window?.matchMedia === undefined) {
      return () => { /* no-op in non-browser environments */ };
    }

    const mediaQuery = globalThis.window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent | MediaQueryList): void => {
      callback(e.matches ? 'dark' : 'light');
    };

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      this.systemThemeWatcher = () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    } else if (typeof (mediaQuery as any).addListener === 'function') {
      (mediaQuery as any).addListener(handleChange);
      this.systemThemeWatcher = () => {
        (mediaQuery as any).removeListener(handleChange);
      };
    }

    // Fire immediately with current value
    handleChange(mediaQuery);

    return this.systemThemeWatcher || (() => {});
  }

  static detectSystemTheme(): string {
    if (globalThis.window?.matchMedia === undefined) {
      return 'light';
    }

    try {
      return globalThis.window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  }

  private injectCSS(tokens: DesignTokens, selector: string, prefix: string): void {
    if (typeof document === 'undefined') return;

    const css = this.generateCSS(tokens, selector, prefix);
    const styleId = 'tokiforge-theme';

    let styleElement = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = css;
  }

  private generateCSS(tokens: DesignTokens, selector: string, prefix: string): string {
    return TokenExporter.exportCSS(tokens, { selector, prefix });
  }
}
