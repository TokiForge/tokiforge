import type { AstroIntegration } from 'astro';
import { ThemeRuntime, TokenExporter, type ThemeConfig } from '@tokiforge/core';

export interface TokiForgeOptions {
    config: ThemeConfig;
    generateStaticCSS?: boolean;
}

export default function tokiforge(options: TokiForgeOptions): AstroIntegration {
    return {
        name: '@tokiforge/astro',
        hooks: {
            'astro:config:setup': ({ injectScript }) => {
                // Inject client-side theme runtime
                injectScript('page', `
          import { ThemeRuntime } from '@tokiforge/core';
          
          const config = ${JSON.stringify(options.config)};
          const runtime = new ThemeRuntime(config);
          
          // Initialize theme
          const savedTheme = localStorage.getItem('tokiforge-theme');
          const initialTheme = savedTheme || config.defaultTheme || config.themes[0]?.name;
          
          runtime.init(':root', 'hf').then(() => {
            runtime.applyTheme(initialTheme, ':root', 'hf');
          });
          
          // Make runtime globally available
          window.__tokiforge = runtime;
        `);
            },

            'astro:config:done': ({ config }) => {
                if (options.generateStaticCSS) {
                    // Generate static CSS for each theme
                    const runtime = new ThemeRuntime(options.config);
                    options.config.themes.forEach((theme) => {
                        const css = TokenExporter.exportCSS(theme.tokens, {
                            selector: `[data-theme="${theme.name}"]`,
                            prefix: 'hf',
                        });

                        console.log(`Generated static CSS for theme: ${theme.name}`);
                    });
                }
            },
        },
    };
}

// Helper functions for Astro components
export function getThemeFromCookies(cookies: any, cookieName: string = 'tokiforge-theme'): string | null {
    return cookies.get(cookieName)?.value || null;
}

export function setThemeCookie(theme: string, cookieName: string = 'tokiforge-theme'): string {
    return `${cookieName}=${theme}; Path=/; Max-Age=31536000; SameSite=Lax`;
}
