import type { ThemeConfig, DesignTokens } from './types';

export class ThemeRuntime {
  private themes: Map<string, DesignTokens>;
  private currentTheme: string;
  private defaultTheme: string;
  private styleElement: HTMLStyleElement | null = null;

  constructor(config: ThemeConfig) {
    this.themes = new Map();
    for (const theme of config.themes) {
      this.themes.set(theme.name, theme.tokens);
    }
    this.defaultTheme = config.defaultTheme || config.themes[0]?.name || 'default';
    this.currentTheme = this.defaultTheme;
  }

  init(selector: string = ':root', prefix: string = 'hf'): void {
    if (typeof window === 'undefined') return;
    this.applyTheme(this.currentTheme, selector, prefix);
  }

  applyTheme(themeName: string, selector: string = ':root', prefix: string = 'hf'): void {
    if (typeof window === 'undefined') return;

    const theme = this.themes.get(themeName);
    if (!theme) {
      throw new Error(`Theme "${themeName}" not found`);
    }

    this.currentTheme = themeName;
    this.injectCSSVariables(theme, selector, prefix);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('tokiforge:theme-change', {
          detail: { theme: themeName, tokens: theme },
        })
      );
    }
  }

  private injectCSSVariables(tokens: DesignTokens, selector: string, prefix: string): void {
    if (typeof document === 'undefined') return;

    const css = this.tokensToCSS(tokens, selector, prefix);

    if (!this.styleElement) {
      this.styleElement = document.createElement('style');
      this.styleElement.id = 'tokiforge-theme';
      document.head.appendChild(this.styleElement);
    }

    this.styleElement.textContent = css;
  }

  private tokensToCSS(tokens: DesignTokens, selector: string, prefix: string): string {
    const variables: string[] = [];

    const flatten = (obj: DesignTokens, path: string = ''): void => {
      for (const key in obj) {
        const value = obj[key];
        const fullPath = path ? `${path}.${key}` : key;

        if (value && typeof value === 'object' && 'value' in value) {
          const cssVar = this.toCSSVariable(fullPath, prefix);
          variables.push(`  ${cssVar}: ${value.value};`);
        } else if (value && typeof value === 'object') {
          flatten(value as DesignTokens, fullPath);
        }
      }
    };

    flatten(tokens);

    return `${selector} {\n${variables.join('\n')}\n}`;
  }

  private toCSSVariable(path: string, prefix: string): string {
    const parts = prefix ? [prefix, ...path.split('.')] : path.split('.');
    return `--${parts
      .map((part) => part.replace(/([A-Z])/g, '-$1').toLowerCase())
      .join('-')}`;
  }

  getCurrentTheme(): string {
    return this.currentTheme;
  }

  getThemeTokens(themeName?: string): DesignTokens {
    const targetTheme = themeName || this.currentTheme;
    const theme = this.themes.get(targetTheme);
    if (!theme) {
      throw new Error(`Theme "${targetTheme}" not found`);
    }
    return theme;
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
    if (this.styleElement && this.styleElement.parentNode) {
      this.styleElement.parentNode.removeChild(this.styleElement);
      this.styleElement = null;
    }
  }

  static detectSystemTheme(): 'light' | 'dark' {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  watchSystemTheme(callback: (theme: 'light' | 'dark') => void): () => void {
    if (typeof window === 'undefined') return () => {};

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      callback(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handler);
    callback(mediaQuery.matches ? 'dark' : 'light');

    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }
}

