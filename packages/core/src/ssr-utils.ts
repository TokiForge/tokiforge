import type { DesignTokens, ThemeConfig } from './types';
import { TokenExporter } from './token-exporter';

/**
 * SSR-specific utilities for server-side rendering and static site generation.
 * These utilities help prevent FOUC (Flash of Unstyled Content) and hydration mismatches.
 */

export interface SSRThemeOptions {
  /**
   * Theme name to render on the server
   */
  theme: string;
  /**
   * CSS selector for the theme (default: ':root')
   */
  selector?: string;
  /**
   * CSS variable prefix (default: 'hf')
   */
  prefix?: string;
  /**
   * Include theme class on body element (default: false)
   */
  includeBodyClass?: boolean;
  /**
   * Body class prefix for theme (default: 'theme')
   */
  bodyClassPrefix?: string;
  /**
   * Minify the output CSS (default: false)
   */
  minify?: boolean;
}

export interface CriticalCSSOptions {
  /**
   * Themes to include in critical CSS
   */
  themes: string[];
  /**
   * CSS selector for the theme (default: ':root')
   */
  selector?: string;
  /**
   * CSS variable prefix (default: 'hf')
   */
  prefix?: string;
  /**
   * Minify the output CSS (default: true)
   */
  minify?: boolean;
  /**
   * Include theme-specific selectors (default: true)
   */
  includeThemeSelectors?: boolean;
}

export class SSRUtils {
  /**
   * Generate inline CSS for server-side rendering.
   * Use this to prevent FOUC by inlining critical theme CSS.
   * 
   * @example
   * ```typescript
   * const criticalCSS = SSRUtils.generateInlineCSS(config, {
   *   theme: 'light',
   *   minify: true
   * });
   * 
   * // In your HTML template:
   * <style>${criticalCSS}</style>
   * ```
   */
  static generateInlineCSS(config: ThemeConfig, options: SSRThemeOptions): string {
    const {
      theme,
      selector = ':root',
      prefix = 'hf',
      minify = false,
    } = options;

    const themeData = config.themes.find(t => t.name === theme);
    if (!themeData) {
      throw new Error(`Theme "${theme}" not found in config`);
    }

    let css = TokenExporter.exportCSS(themeData.tokens, { selector, prefix });

    if (minify) {
      css = this.minifyCSS(css);
    }

    return css;
  }

  /**
   * Generate critical CSS for multiple themes.
   * Useful for supporting theme switching without JavaScript.
   * 
   * @example
   * ```typescript
   * const criticalCSS = SSRUtils.generateCriticalCSS(config, {
   *   themes: ['light', 'dark'],
   *   includeThemeSelectors: true,
   *   minify: true
   * });
   * ```
   */
  static generateCriticalCSS(config: ThemeConfig, options: CriticalCSSOptions): string {
    const {
      themes,
      selector = ':root',
      prefix = 'hf',
      minify = true,
      includeThemeSelectors = true,
    } = options;

    const cssBlocks: string[] = [];

    for (const themeName of themes) {
      const themeData = config.themes.find(t => t.name === themeName);
      if (!themeData) {
        console.warn(`Theme "${themeName}" not found, skipping`);
        continue;
      }

      if (includeThemeSelectors) {
        // Generate theme-specific CSS with data-theme selector
        const themeSelector = `[data-theme="${themeName}"]`;
        const css = TokenExporter.exportCSS(themeData.tokens, {
          selector: themeSelector,
          prefix,
        });
        cssBlocks.push(css);
      } else {
        // Generate root-level CSS (for default theme)
        const css = TokenExporter.exportCSS(themeData.tokens, {
          selector,
          prefix,
        });
        cssBlocks.push(css);
      }
    }

    let finalCSS = cssBlocks.join('\n\n');

    if (minify) {
      finalCSS = this.minifyCSS(finalCSS);
    }

    return finalCSS;
  }

  /**
   * Generate body class attribute for SSR.
   * Use this to add the theme class to the body element on the server.
   * 
   * @example
   * ```typescript
   * const bodyClass = SSRUtils.generateBodyClass('dark', 'theme');
   * // Returns: "theme-dark"
   * ```
   */
  static generateBodyClass(theme: string, prefix: string = 'theme'): string {
    return `${prefix}-${theme}`;
  }

  /**
   * Generate data-theme attribute for SSR.
   * Use this to add the theme data attribute to an element on the server.
   * 
   * @example
   * ```typescript
   * const dataTheme = SSRUtils.generateDataTheme('dark');
   * // Returns: 'data-theme="dark"'
   * ```
   */
  static generateDataTheme(theme: string): string {
    return `data-theme="${theme}"`;
  }

  /**
   * Get theme from server-side cookie string.
   * Use this to detect the user's theme preference on the server.
   * 
   * @example
   * ```typescript
   * const theme = SSRUtils.getThemeFromCookie(req.headers.cookie, 'tokiforge-theme');
   * ```
   */
  static getThemeFromCookie(
    cookieString: string | undefined,
    cookieName: string = 'tokiforge-theme'
  ): string | null {
    if (!cookieString) {
      return null;
    }

    const cookies = cookieString.split(';').map(c => c.trim());
    const themeCookie = cookies.find(c => c.startsWith(`${cookieName}=`));
    
    if (themeCookie) {
      return themeCookie.substring(`${cookieName}=`.length);
    }

    return null;
  }

  /**
   * Generate Set-Cookie header for theme preference.
   * Use this to persist the user's theme preference.
   * 
   * @example
   * ```typescript
   * const setCookie = SSRUtils.generateThemeCookie('dark', 'tokiforge-theme');
   * res.setHeader('Set-Cookie', setCookie);
   * ```
   */
  static generateThemeCookie(
    theme: string,
    cookieName: string = 'tokiforge-theme',
    options: {
      maxAge?: number;
      path?: string;
      sameSite?: 'Strict' | 'Lax' | 'None';
      secure?: boolean;
      httpOnly?: boolean;
    } = {}
  ): string {
    const {
      maxAge = 31536000, // 1 year
      path = '/',
      sameSite = 'Lax',
      secure = false,
      httpOnly = false,
    } = options;

    const parts = [
      `${cookieName}=${theme}`,
      `Path=${path}`,
      `Max-Age=${maxAge}`,
      `SameSite=${sameSite}`,
    ];

    if (secure) {
      parts.push('Secure');
    }

    if (httpOnly) {
      parts.push('HttpOnly');
    }

    return parts.join('; ');
  }

  /**
   * Generate hydration-safe theme switcher script.
   * This prevents FOUC by applying the theme before React hydrates.
   * 
   * @example
   * ```typescript
   * const script = SSRUtils.generateHydrationScript('tokiforge-theme', 'theme');
   * // In your HTML:
   * <script dangerouslySetInnerHTML={{ __html: script }} />
   * ```
   */
  static generateHydrationScript(
    cookieName: string = 'tokiforge-theme',
    bodyClassPrefix: string = 'theme',
    fallbackTheme: string = 'light'
  ): string {
    return `
(function() {
  try {
    var theme = document.cookie
      .split(';')
      .map(function(c) { return c.trim(); })
      .find(function(c) { return c.startsWith('${cookieName}='); });
    
    if (theme) {
      theme = theme.substring(${cookieName.length + 1});
    } else {
      theme = '${fallbackTheme}';
    }
    
    document.documentElement.setAttribute('data-theme', theme);
    document.body.className = document.body.className
      .split(' ')
      .filter(function(c) { return !c.startsWith('${bodyClassPrefix}-'); })
      .concat(['${bodyClassPrefix}-' + theme])
      .join(' ');
  } catch (e) {
    console.error('TokiForge: Failed to apply theme:', e);
  }
})();
    `.trim();
  }

  /**
   * Minify CSS by removing unnecessary whitespace and comments.
   * Simple minification for inline CSS.
   */
  private static minifyCSS(css: string): string {
    return css
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
      .replace(/\s+/g, ' ') // Collapse whitespace
      .replace(/\s*{\s*/g, '{') // Remove space around {
      .replace(/\s*}\s*/g, '}') // Remove space around }
      .replace(/\s*:\s*/g, ':') // Remove space around :
      .replace(/\s*;\s*/g, ';') // Remove space around ;
      .replace(/;\s*}/g, '}') // Remove last semicolon before }
      .trim();
  }

  /**
   * Generate complete HTML head content for SSR.
   * Includes both inline CSS and hydration script.
   * 
   * @example
   * ```typescript
   * const headContent = SSRUtils.generateSSRHead(config, {
   *   theme: 'light',
   *   cookieName: 'tokiforge-theme',
   *   includeHydrationScript: true
   * });
   * ```
   */
  static generateSSRHead(
    config: ThemeConfig,
    options: {
      theme: string;
      cookieName?: string;
      bodyClassPrefix?: string;
      includeHydrationScript?: boolean;
      minify?: boolean;
    }
  ): { style: string; script?: string } {
    const {
      theme,
      cookieName = 'tokiforge-theme',
      bodyClassPrefix = 'theme',
      includeHydrationScript = true,
      minify = true,
    } = options;

    const style = this.generateInlineCSS(config, {
      theme,
      minify,
    });

    const result: { style: string; script?: string } = { style };

    if (includeHydrationScript) {
      result.script = this.generateHydrationScript(
        cookieName,
        bodyClassPrefix,
        theme
      );
    }

    return result;
  }
}
