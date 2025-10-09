import { DesignTokens, Theme, ThemeConfig } from './types';
import { TokenExporter } from './exporter';

export class ThemeRuntime {
  private themes: Map<string, Theme>;
  private currentTheme: string;
  private defaultTheme: string;
  private styleElement: HTMLStyleElement | null = null;

  constructor(config: ThemeConfig) {
    this.themes = new Map();
    config.themes.forEach(theme => {
      this.themes.set(theme.name, theme);
    });
    this.defaultTheme = config.defaultTheme || config.themes[0]?.name || 'default';
    this.currentTheme = this.defaultTheme;
  }

  init(selector: string = ':root', prefix: string = 'hf'): void {
    if (typeof document === 'undefined') {
      return;
    }

    if (this.styleElement) {
      this.styleElement.remove();
    }
    this.styleElement = document.createElement('style');
    this.styleElement.id = 'tokiforge-theme';
    document.head.appendChild(this.styleElement);

    this.applyTheme(this.currentTheme, selector, prefix);
  }

  applyTheme(themeName: string, selector: string = ':root', prefix: string = 'hf'): void {
    const theme = this.themes.get(themeName);
    if (!theme) {
      throw new Error(`Theme "${themeName}" not found`);
    }

    if (this.styleElement) {
      const css = TokenExporter.exportCSS(theme.tokens, { format: 'css', selector, prefix });
      this.styleElement.textContent = css;
    }

    this.currentTheme = themeName;

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('tokiforge:theme-change', {
          detail: { theme: themeName, tokens: theme.tokens },
        })
      );
    }
  }

  getCurrentTheme(): string {
    return this.currentTheme;
  }

  getThemeTokens(themeName?: string): DesignTokens {
    const name = themeName || this.currentTheme;
    const theme = this.themes.get(name);
    if (!theme) {
      throw new Error(`Theme "${themeName || this.currentTheme}" not found`);
    }
    return theme.tokens;
  }

  getAvailableThemes(): string[] {
    return Array.from(this.themes.keys());
  }

  nextTheme(): string {
    const themes = this.getAvailableThemes();
    const currentIndex = themes.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    this.applyTheme(nextTheme);
    return nextTheme;
  }

  destroy(): void {
    if (this.styleElement) {
      this.styleElement.remove();
      this.styleElement = null;
    }
  }

  static detectSystemTheme(): 'light' | 'dark' {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return 'light';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  watchSystemTheme(callback: (theme: 'light' | 'dark') => void): () => void {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return () => {};
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      callback(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handler);

    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }
}

