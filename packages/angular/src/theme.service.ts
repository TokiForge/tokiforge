import { Injectable, signal, computed } from '@angular/core';
import type { OnDestroy, Signal } from '@angular/core';
import { ThemeRuntime, type DesignTokens, type ThemeConfig } from '@tokiforge/core';

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

export interface GenerateCSSOptions {
  outputDir?: string;
  bodyClassPrefix?: string;
  prefix?: string;
  format?: 'css' | 'scss';
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService implements OnDestroy {
  private runtime: ThemeRuntime | null = null;
  private themeSignal = signal<string>('default');
  private tokensSignal = signal<DesignTokens>({});
  private isBrowser = typeof window !== 'undefined';
  private options: ThemeInitOptions = {};
  private systemThemeUnwatch?: () => void;

  readonly theme: Signal<string> = this.themeSignal.asReadonly();
  readonly tokens: Signal<DesignTokens> = this.tokensSignal.asReadonly();
  readonly availableThemes: Signal<string[]> = computed(() => {
    return this.runtime ? this.runtime.getAvailableThemes() : [];
  });

  constructor() {}

  init(config: ThemeConfig, options: ThemeInitOptions = {}): void {
    this.options = { ...options };
    this.runtime = new ThemeRuntime(config);
    const themeName = options.defaultTheme || config.defaultTheme || config.themes[0]?.name || 'default';
    
    if (this.isBrowser) {
      this.runtime.init(options.selector || ':root', options.prefix || 'hf');
      this.themeSignal.set(themeName);
      this.tokensSignal.set(this.runtime.getThemeTokens(themeName));
    } else {
      this.themeSignal.set(themeName);
      this.tokensSignal.set(config.themes[0]?.tokens || {});
    }
  }

  setTheme(themeName: string): void {
    if (!this.runtime) return;
    this.runtime.applyTheme(themeName, this.options.selector || ':root', this.options.prefix || 'hf');
    this.themeSignal.set(themeName);
    this.tokensSignal.set(this.runtime.getThemeTokens(themeName));
  }

  nextTheme(): void {
    if (!this.runtime) return;
    const newTheme = this.runtime.nextTheme();
    this.themeSignal.set(newTheme);
    this.tokensSignal.set(this.runtime.getThemeTokens(newTheme));
  }

  generateCSS(themeName?: string): string {
    if (!this.runtime) return '';
    const name = themeName || this.themeSignal();
    this.runtime.applyTheme(name, this.options.selector || ':root', this.options.prefix || 'hf');
    return '';
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
      generateCSS: this.options.mode === 'static' ? (name?: string) => this.generateCSS(name) : undefined,
    };
  }

  ngOnDestroy(): void {
    if (this.runtime) {
      this.runtime.destroy();
    }
    if (this.systemThemeUnwatch) {
      this.systemThemeUnwatch();
    }
  }
}

export function generateThemeCSS(config: ThemeConfig, options: GenerateCSSOptions = {}): Record<string, string> {
  const runtime = new ThemeRuntime(config);
  const result: Record<string, string> = {};
  
  for (const theme of config.themes) {
    runtime.init(options.bodyClassPrefix ? `.${options.bodyClassPrefix}-${theme.name}` : ':root', options.prefix || 'hf');
    runtime.applyTheme(theme.name, options.bodyClassPrefix ? `.${options.bodyClassPrefix}-${theme.name}` : ':root', options.prefix || 'hf');
    const css = `:root { /* Theme: ${theme.name} */ }`;
    result[`${theme.name}.${options.format || 'css'}`] = css;
  }
  
  return result;
}

export function generateCombinedThemeCSS(config: ThemeConfig, options: GenerateCSSOptions = {}): string {
  const files = generateThemeCSS(config, options);
  return Object.values(files).join('\n\n');
}

