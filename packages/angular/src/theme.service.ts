import { Injectable, signal, computed } from '@angular/core';
import { ThemeController, TokenExporter } from '@tokiforge/core/runtime';
import type { ThemeConfig, DesignTokens } from '@tokiforge/core/runtime';

export interface ThemeInitOptions {
  selector?: string;
  prefix?: string;
  defaultTheme?: string;
  mode?: 'dynamic' | 'static';
  persist?: boolean;
  storageKey?: string;
  watchSystemTheme?: boolean;
  bodyClassPrefix?: string;
  onThemeChange?: (themeName: string) => void;
}

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private isBrowser =
    typeof globalThis !== 'undefined' &&
    typeof (globalThis as { window?: unknown }).window !== 'undefined' &&
    typeof document !== 'undefined';
  private controller: ThemeController | null = null;
  private unsubscribe: (() => void) | null = null;

  private _theme = signal<string>('default');
  private _initialized = signal<boolean>(false);

  theme = this._theme.asReadonly();
  initialized = this._initialized.asReadonly();

  tokens = computed<DesignTokens>(() => {
    if (!this.controller || !this._initialized()) return {};
    try {
      return this.controller.getTokens();
    } catch {
      return {};
    }
  });

  availableThemes = computed<string[]>(() => {
    if (!this.controller || !this._initialized()) return [];
    return this.controller.getAvailableThemes();
  });

  private options: ThemeInitOptions = {};

  init(config: ThemeConfig, options: ThemeInitOptions = {}): void {
    if (this._initialized()) {
      console.warn('ThemeService already initialized');
      return;
    }

    this.options = {
      selector: ':root',
      prefix: 'hf',
      mode: 'dynamic',
      persist: true,
      storageKey: 'tokiforge-theme',
      watchSystemTheme: false,
      bodyClassPrefix: 'theme',
      ...options,
    };

    this.controller = new ThemeController(config, {
      selector: this.options.selector,
      prefix: this.options.prefix,
      defaultTheme: this.options.defaultTheme,
      persist: this.options.persist,
      storageKey: this.options.storageKey,
      watchSystemTheme: this.options.watchSystemTheme,
      onThemeChange: this.options.onThemeChange,
    });

    const snapshot = this.controller.getSnapshot();
    this._theme.set(snapshot.theme);
    this._initialized.set(true);

    this.unsubscribe = this.controller.subscribe((next) => {
      this._theme.set(next.theme);
      if (this.options.mode === 'static' && this.isBrowser) {
        this.updateBodyClass(next.theme);
      }
    });

    if (this.isBrowser) {
      if (this.options.mode === 'static') {
        this.updateBodyClass(snapshot.theme);
      } else {
        this.controller.init();
      }
    }
  }

  setTheme(themeName: string): void {
    if (!this.controller || !this._initialized()) {
      throw new Error('ThemeService not initialized. Call init() first.');
    }

    const availableThemes = this.controller.getAvailableThemes();
    if (!availableThemes.includes(themeName)) {
      throw new Error(`Theme "${themeName}" not found. Available themes: ${availableThemes.join(', ')}`);
    }

    if (this.options.mode === 'static') {
      this._theme.set(themeName);
      if (this.isBrowser) this.updateBodyClass(themeName);
      if (this.options.persist && this.isBrowser) {
        try {
          window.localStorage?.setItem(this.options.storageKey ?? 'tokiforge-theme', themeName);
        } catch {
          // ignore
        }
      }
      this.options.onThemeChange?.(themeName);
      return;
    }

    this.controller.setTheme(themeName);
  }

  nextTheme(): void {
    if (!this.controller || !this._initialized()) {
      throw new Error('ThemeService not initialized. Call init() first.');
    }
    if (this.options.mode === 'static') {
      const themes = this.controller.getAvailableThemes();
      const currentIndex = themes.indexOf(this._theme());
      this.setTheme(themes[(currentIndex + 1) % themes.length]);
      return;
    }
    this.controller.nextTheme();
  }

  generateCSS(themeName?: string): string {
    if (!this.controller || !this._initialized()) {
      throw new Error('ThemeService not initialized. Call init() first.');
    }

    const targetTheme = themeName || this._theme();
    const themeTokens = this.controller.runtime.getThemeTokens(targetTheme);
    const bodySelector =
      this.options.mode === 'static'
        ? `body.${this.options.bodyClassPrefix}-${targetTheme}`
        : this.options.selector;

    return TokenExporter.exportCSS(themeTokens, {
      selector: bodySelector || ':root',
      prefix: this.options.prefix || 'hf',
    });
  }

  private updateBodyClass(themeName: string): void {
    if (!this.isBrowser || typeof document === 'undefined') return;
    const availableThemes = this.controller?.getAvailableThemes() || [];
    for (const t of availableThemes) {
      document.body.classList.remove(`${this.options.bodyClassPrefix}-${t}`);
    }
    document.body.classList.add(`${this.options.bodyClassPrefix}-${themeName}`);
  }

  destroy(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
    this.controller?.destroy();
    this.controller = null;
    this._initialized.set(false);
  }
}
