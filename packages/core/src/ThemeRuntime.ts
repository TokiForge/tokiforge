import type { DesignTokens, ThemeConfig } from './types';
import { ThemeNotFoundError } from './errors';

export class ThemeRuntime {
  private config: ThemeConfig;
  private currentTheme: string;
  private styleElement: HTMLStyleElement | null = null;
  private systemThemeUnwatch: (() => void) | null = null;
  private isBrowser = typeof window !== 'undefined';

  constructor(config: ThemeConfig) {
    if (!config || !config.themes || config.themes.length === 0) {
      throw new Error('ThemeConfig must have at least one theme');
    }
    this.config = config;
    this.currentTheme = config.defaultTheme || config.themes[0]?.name || 'default';
    
    const themeExists = config.themes.some(theme => theme.name === this.currentTheme);
    if (!themeExists) {
      throw new Error(`Default theme "${this.currentTheme}" not found in themes`);
    }
  }

  init(selector: string = ':root', prefix: string = 'hf'): void {
    if (!this.isBrowser) return;

    const theme = this.config.themes.find(t => t.name === this.currentTheme);
    if (!theme) {
      throw new Error(`Theme "${this.currentTheme}" not found`);
    }

    this.injectCSS(theme.tokens, selector, prefix);
  }

  applyTheme(themeName: string, selector: string = ':root', prefix: string = 'hf'): void {
    const theme = this.config.themes.find(t => t.name === themeName);
    if (!theme) {
      throw new ThemeNotFoundError(themeName, this.getAvailableThemes());
    }

    this.currentTheme = themeName;
    
    if (this.isBrowser) {
      this.injectCSS(theme.tokens, selector, prefix);
      this.dispatchThemeChangeEvent(themeName, theme.tokens);
    }
  }

  getCurrentTheme(): string {
    return this.currentTheme;
  }

  getThemeTokens(themeName?: string): DesignTokens {
    const name = themeName || this.currentTheme;
    const theme = this.config.themes.find(t => t.name === name);
    if (!theme) {
      return {};
    }
    return theme.tokens;
  }

  getAvailableThemes(): string[] {
    return this.config.themes.map(theme => theme.name);
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
    if (this.systemThemeUnwatch) {
      this.systemThemeUnwatch();
      this.systemThemeUnwatch = null;
    }
  }

  static detectSystemTheme(): 'light' | 'dark' {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return 'light';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  watchSystemTheme(callback: (theme: 'light' | 'dark') => void): () => void {
    if (!this.isBrowser || !window.matchMedia) {
      return () => {};
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      callback(e.matches ? 'dark' : 'light');
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
    } else {
      mediaQuery.addListener(handler);
    }

    handler(mediaQuery);

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handler);
      } else {
        mediaQuery.removeListener(handler);
      }
    };
  }

  private injectCSS(tokens: DesignTokens, selector: string, prefix: string): void {
    if (!this.isBrowser) return;

    if (!this.styleElement) {
      this.styleElement = document.createElement('style');
      this.styleElement.id = 'tokiforge-theme';
      document.head.appendChild(this.styleElement);
    }

    const css = this.generateCSS(tokens, selector, prefix);
    this.styleElement.textContent = css;
  }

  private generateCSS(tokens: DesignTokens, selector: string, prefix: string): string {
    const variables: string[] = [];
    this.flattenTokens(tokens, prefix, variables);
    
    if (variables.length === 0) {
      return `${selector} {}`;
    }

    return `${selector} {\n  ${variables.join('\n  ')}\n}`;
  }

  private flattenTokens(tokens: DesignTokens, prefix: string, result: string[], currentPath: string = ''): void {
    for (const [key, value] of Object.entries(tokens)) {
      const path = currentPath ? `${currentPath}-${key}` : key;
      
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        if ('value' in value || '$value' in value) {
          const tokenValue = (value as { value?: string | number; $value?: string | number }).value || 
                            (value as { $value?: string | number }).$value;
          if (tokenValue !== undefined && tokenValue !== null) {
            const cssVar = `--${prefix}-${path}`.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
            result.push(`${cssVar}: ${tokenValue};`);
          }
        } else {
          this.flattenTokens(value as DesignTokens, prefix, result, path);
        }
      }
    }
  }

  private dispatchThemeChangeEvent(themeName: string, tokens: DesignTokens): void {
    if (!this.isBrowser) return;

    const event = new CustomEvent('tokiforge:theme-change', {
      detail: {
        theme: themeName,
        tokens,
      },
    });
    window.dispatchEvent(event);
  }
}

