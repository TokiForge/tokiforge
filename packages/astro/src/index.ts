import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';
import { TokenExporter } from '@tokiforge/core/runtime';
import type { ThemeConfig, DesignTokens } from '@tokiforge/core/runtime';

export interface TokiForgeOptions {
  config: ThemeConfig;
  /** Write one CSS file per theme under `cssOutputDir` */
  generateStaticCSS?: boolean;
  /** Directory relative to the project root (default: `public/tokiforge`) */
  cssOutputDir?: string;
  /** CSS variable prefix (default: `hf`) */
  prefix?: string;
  /** localStorage / cookie key for the selected theme */
  storageKey?: string;
  /** Follow OS color scheme when no persisted theme exists */
  watchSystemTheme?: boolean;
}

function resolveProjectRoot(root: URL | string): string {
  if (typeof root === 'string') return root;
  return fileURLToPath(root);
}

export default function tokiforge(options: TokiForgeOptions): AstroIntegration {
  const prefix = options.prefix ?? 'hf';
  const storageKey = options.storageKey ?? 'tokiforge-theme';
  const cssOutputDir = options.cssOutputDir ?? 'public/tokiforge';
  const watchSystemTheme = options.watchSystemTheme ?? false;

  return {
    name: '@tokiforge/astro',
    hooks: {
      'astro:config:setup': ({ injectScript }) => {
        injectScript(
          'page',
          `
          import { ThemeController, ThemeRuntime } from '@tokiforge/core/runtime';

          const config = ${JSON.stringify(options.config)};
          const controller = new ThemeController(config, {
            selector: ':root',
            prefix: ${JSON.stringify(prefix)},
            storageKey: ${JSON.stringify(storageKey)},
            persist: true,
            watchSystemTheme: ${JSON.stringify(watchSystemTheme)},
            runtime: new ThemeRuntime(config),
          });

          controller.init();

          // Compat surface for existing docs that call applyTheme(name, selector, prefix)
          const api = Object.assign(controller, {
            applyTheme(themeName) {
              controller.setTheme(themeName);
              return Promise.resolve();
            },
          });

          window.__tokiforge = api;
        `
        );
      },

      'astro:config:done': ({ config }) => {
        if (!options.generateStaticCSS) return;

        const outDir = path.resolve(resolveProjectRoot(config.root), cssOutputDir);
        fs.mkdirSync(outDir, { recursive: true });

        const blocks: string[] = [];
        for (const theme of options.config.themes) {
          const css = TokenExporter.exportCSS(theme.tokens as DesignTokens, {
            selector: `[data-theme="${theme.name}"]`,
            prefix,
          });
          fs.writeFileSync(path.join(outDir, `${theme.name}.css`), css, 'utf-8');
          blocks.push(css);
        }

        fs.writeFileSync(path.join(outDir, 'themes.css'), blocks.join('\n\n'), 'utf-8');
      },
    },
  };
}

export function getThemeFromCookies(
  cookies: { get: (name: string) => { value?: string } | null | undefined },
  cookieName: string = 'tokiforge-theme'
): string | null {
  return cookies.get(cookieName)?.value || null;
}

export function setThemeCookie(theme: string, cookieName: string = 'tokiforge-theme'): string {
  return `${cookieName}=${theme}; Path=/; Max-Age=31536000; SameSite=Lax`;
}
