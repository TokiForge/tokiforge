import type { DesignTokens, ThemeConfig } from './types';
import { ThemeRuntime } from './theme-runtime';

export interface ThemeControllerOptions {
  /** CSS selector the variables are attached to (default: ':root') */
  selector?: string;
  /** CSS variable prefix (default: 'hf') */
  prefix?: string;
  /** Theme to start with; overrides config.defaultTheme */
  defaultTheme?: string;
  /** Read/write the selected theme from localStorage (default: true) */
  persist?: boolean;
  /** LocalStorage key for persisting the selected theme (default: 'tokiforge-theme') */
  storageKey?: string;
  /** Follow the OS color scheme when no persisted choice exists (default: false) */
  watchSystemTheme?: boolean;
  /** Callback fired after every theme change (e.g. analytics) */
  onThemeChange?: (themeName: string) => void;
  /** Inject an existing runtime instead of constructing one (useful for tests) */
  runtime?: ThemeRuntime;
}

export interface ThemeSnapshot {
  theme: string;
  tokens: DesignTokens;
}

const DEFAULT_STORAGE_KEY = 'tokiforge-theme';

/**
 * Headless theme controller shared by every framework adapter.
 *
 * Owns the full lifecycle that adapters used to reimplement by hand:
 * initial-theme resolution (persisted > option > config default > first),
 * CSS injection, localStorage persistence, system-theme watching, and
 * change notification. Framework packages wrap this with their own
 * reactivity primitive (hooks, refs, stores, signals).
 */
export class ThemeController {
  readonly runtime: ThemeRuntime;
  private readonly options: Required<
    Pick<ThemeControllerOptions, 'selector' | 'prefix' | 'persist' | 'storageKey' | 'watchSystemTheme'>
  > &
    Pick<ThemeControllerOptions, 'defaultTheme' | 'onThemeChange'>;
  private readonly listeners = new Set<(snapshot: ThemeSnapshot) => void>();
  private snapshot: ThemeSnapshot;
  private unwatchSystem: (() => void) | null = null;
  private initialized = false;

  constructor(config: ThemeConfig, options: ThemeControllerOptions = {}) {
    this.runtime = options.runtime ?? new ThemeRuntime(config);
    this.options = {
      selector: options.selector ?? ':root',
      prefix: options.prefix ?? 'hf',
      persist: options.persist ?? true,
      storageKey: options.storageKey ?? DEFAULT_STORAGE_KEY,
      watchSystemTheme: options.watchSystemTheme ?? false,
      defaultTheme: options.defaultTheme,
      onThemeChange: options.onThemeChange,
    };

    const initialTheme = this.resolveInitialTheme(config);
    this.snapshot = {
      theme: initialTheme,
      tokens: this.safeGetTokens(initialTheme),
    };
  }

  /** persisted > watchSystemTheme match > defaultTheme option > config.defaultTheme > first theme */
  private resolveInitialTheme(config: ThemeConfig): string {
    const available = this.runtime.getAvailableThemes();
    let theme =
      this.options.defaultTheme || config.defaultTheme || available[0] || 'default';

    if (!this.isBrowser()) return theme;

    if (this.options.persist) {
      const saved = this.readStorage();
      if (saved && available.includes(saved)) {
        return saved;
      }
    }

    if (this.options.watchSystemTheme) {
      const systemTheme = ThemeRuntime.detectSystemTheme();
      if (available.includes(systemTheme)) {
        theme = systemTheme;
      }
    }

    return theme;
  }

  /**
   * Apply the resolved initial theme. Safe to call on the server (no-op CSS
   * injection) and safe to call more than once.
   */
  init(): void {
    if (this.initialized) return;
    this.initialized = true;

    this.apply(this.snapshot.theme, { persist: false });

    if (this.options.watchSystemTheme && this.isBrowser()) {
      this.unwatchSystem = this.runtime.watchSystemTheme((systemTheme) => {
        if (
          this.runtime.getAvailableThemes().includes(systemTheme) &&
          (!this.options.persist || !this.readStorage())
        ) {
          this.apply(systemTheme, { persist: false });
        }
      });
    }
  }

  getSnapshot(): ThemeSnapshot {
    return this.snapshot;
  }

  getTheme(): string {
    return this.snapshot.theme;
  }

  getTokens(): DesignTokens {
    return this.snapshot.tokens;
  }

  getAvailableThemes(): string[] {
    return this.runtime.getAvailableThemes();
  }

  /** Apply a theme, persist the choice (if enabled), and notify subscribers. */
  setTheme(themeName: string): void {
    this.apply(themeName, { persist: true });
  }

  /**
   * Apply a theme inside a View Transition when the browser supports it
   * (document.startViewTransition), so the switch cross-fades instead of
   * flashing. Falls back to a plain setTheme otherwise.
   */
  async setThemeWithTransition(themeName: string): Promise<void> {
    const doc = typeof document !== 'undefined' ? (document as Document & {
      startViewTransition?: (cb: () => void) => { finished: Promise<void> };
    }) : undefined;

    if (doc?.startViewTransition) {
      await doc.startViewTransition(() => {
        this.setTheme(themeName);
      }).finished;
      return;
    }

    this.setTheme(themeName);
  }

  /** Cycle to the next theme in declaration order and return its name. */
  nextTheme(): string {
    const next = this.runtime.nextTheme();
    this.setTheme(next);
    return next;
  }

  /** Subscribe to theme changes. Returns an unsubscribe function. */
  subscribe(listener: (snapshot: ThemeSnapshot) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  destroy(): void {
    if (this.unwatchSystem) {
      this.unwatchSystem();
      this.unwatchSystem = null;
    }
    this.listeners.clear();
    this.runtime.destroy();
    this.initialized = false;
  }

  private apply(themeName: string, opts: { persist: boolean }): void {
    this.runtime.applyTheme(themeName, this.options.selector, this.options.prefix);
    this.snapshot = {
      theme: themeName,
      tokens: this.safeGetTokens(themeName),
    };

    if (opts.persist) {
      this.writeStorage(themeName);
    }

    for (const listener of this.listeners) {
      listener(this.snapshot);
    }

    this.options.onThemeChange?.(themeName);
  }

  private safeGetTokens(themeName: string): DesignTokens {
    try {
      return this.runtime.getThemeTokens(themeName);
    } catch {
      return {};
    }
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  }

  private readStorage(): string | null {
    if (!this.isBrowser()) return null;
    try {
      return window.localStorage?.getItem(this.options.storageKey) ?? null;
    } catch {
      return null;
    }
  }

  private writeStorage(themeName: string): void {
    if (!this.isBrowser() || !this.options.persist) return;
    try {
      window.localStorage?.setItem(this.options.storageKey, themeName);
    } catch {
      // Storage may be unavailable (private browsing, disabled cookies)
    }
  }
}
