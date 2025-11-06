import { Injectable, signal, computed, type OnDestroy } from '@angular/core';
import { ThemeRuntime, TokenExporter } from '@tokiforge/core';
import type { DesignTokens, ThemeConfig } from '@tokiforge/core';

export interface ThemeInitOptions {
  selector?: string;
  prefix?: string;
  defaultTheme?: string;
  mode?: 'dynamic' | 'static';
  persist?: boolean;
  watchSystemTheme?: boolean;
  bodyClassPrefix?: string;
}

export interface ThemeContext {
  theme: string;
  tokens: DesignTokens;
  setTheme: (themeName: string) => void;
  nextTheme: () => void;
  availableThemes: string[];
  runtime: ThemeRuntime;
  generateCSS?: (themeName?: string) => string;
}

@Injectable({
  providedIn: 'root',
})
export class ThemeService implements OnDestroy {
  private runtime: ThemeRuntime | null = null;
  private themeSignal = signal<string>('default');
  private tokensSignal = signal<DesignTokens>({});
  private isBrowser = typeof window !== 'undefined';
  private options: ThemeInitOptions = {};
  private systemThemeUnwatch?: () => void;

  readonly theme = computed(() => this.themeSignal());
  readonly tokens = computed(() => this.tokensSignal());
  readonly availableThemes = computed(() => this.runtime?.getAvailableThemes() || []);

  constructor() {
    if (this.isBrowser) {
      const handleThemeChange = (e: Event) => {
        const customEvent = e as CustomEvent;
        this.themeSignal.set(customEvent.detail.theme);
        this.tokensSignal.set(customEvent.detail.tokens);
      };
      window.addEventListener('tokiforge:theme-change', handleThemeChange);
    }
  }

  init(config: ThemeConfig, options: ThemeInitOptions = {}): void {
    this.options = {
      selector: ':root',
      prefix: 'hf',
      mode: 'dynamic',
      persist: true,
      watchSystemTheme: false,
      bodyClassPrefix: 'theme',
      ...options,
    };

    this.runtime = new ThemeRuntime(config);
    const availableThemes = this.runtime.getAvailableThemes();
    
    let initialTheme = this.options.defaultTheme || config.defaultTheme || availableThemes[0] || 'default';
    
    if (this.isBrowser) {
      if (this.options.persist) {
        const saved = localStorage.getItem('tokiforge-theme');
        if (saved && availableThemes.includes(saved)) {
          initialTheme = saved;
        }
      }
      
      if (this.options.watchSystemTheme && !this.options.persist) {
        const systemTheme = ThemeRuntime.detectSystemTheme();
        if (availableThemes.includes(systemTheme)) {
          initialTheme = systemTheme;
        }
      }
    }

    this.themeSignal.set(initialTheme);
    this.tokensSignal.set(this.runtime.getThemeTokens(initialTheme));

    if (this.isBrowser) {
      if (this.options.mode === 'static') {
        const bodyClass = `${this.options.bodyClassPrefix}-${initialTheme}`;
        document.body.classList.add(bodyClass);
      } else {
        this.runtime.init(this.options.selector!, this.options.prefix!);
      }

      if (this.options.watchSystemTheme) {
        this.systemThemeUnwatch = this.runtime.watchSystemTheme((systemTheme) => {
          if (availableThemes.includes(systemTheme)) {
            this.setTheme(systemTheme);
          }
        });
      }
    }
  }

  setTheme(themeName: string): void {
    if (!this.runtime) {
      throw new Error('ThemeService not initialized. Call init() first.');
    }

    const availableThemes = this.runtime.getAvailableThemes();
    if (!availableThemes.includes(themeName)) {
      throw new Error(`Theme "${themeName}" not found. Available themes: ${availableThemes.join(', ')}`);
    }

    if (this.isBrowser) {
      if (this.options.mode === 'static') {
        availableThemes.forEach(t => {
          document.body.classList.remove(`${this.options.bodyClassPrefix}-${t}`);
        });
        document.body.classList.add(`${this.options.bodyClassPrefix}-${themeName}`);
      } else {
        this.runtime.applyTheme(themeName, this.options.selector!, this.options.prefix!);
      }

      if (this.options.persist) {
        localStorage.setItem('tokiforge-theme', themeName);
      }
    }

    this.themeSignal.set(themeName);
    this.tokensSignal.set(this.runtime.getThemeTokens(themeName));
  }

  nextTheme(): void {
    if (!this.runtime) {
      throw new Error('ThemeService not initialized. Call init() first.');
    }
    const availableThemes = this.runtime.getAvailableThemes();
    const currentIndex = availableThemes.indexOf(this.themeSignal());
    const nextIndex = (currentIndex + 1) % availableThemes.length;
    this.setTheme(availableThemes[nextIndex]);
  }

  generateCSS(themeName?: string): string {
    if (!this.runtime) {
      throw new Error('ThemeService not initialized. Call init() first.');
    }
    const targetTheme = themeName || this.themeSignal();
    const themeTokens = this.runtime.getThemeTokens(targetTheme);
    const bodySelector = this.options.mode === 'static' 
      ? `body.${this.options.bodyClassPrefix}-${targetTheme}`
      : this.options.selector!;
    
    return TokenExporter.exportCSS(themeTokens, {
      selector: bodySelector,
      prefix: this.options.prefix!,
    });
  }

  getRuntime(): ThemeRuntime | null {
    return this.runtime;
  }

  getContext(): ThemeContext {
    if (!this.runtime) {
      throw new Error('ThemeService not initialized. Call init() first.');
    }
    return {
      theme: this.themeSignal(),
      tokens: this.tokensSignal(),
      setTheme: (name: string) => this.setTheme(name),
      nextTheme: () => this.nextTheme(),
      availableThemes: this.runtime.getAvailableThemes(),
      runtime: this.runtime,
      ...(this.options.mode === 'static' ? { generateCSS: (name?: string) => this.generateCSS(name) } : {}),
    };
  }

  ngOnDestroy(): void {
    if (this.systemThemeUnwatch) {
      this.systemThemeUnwatch();
    }
  }
}

