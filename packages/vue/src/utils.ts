import type { ThemeConfig } from '@tokiforge/core';
import { TokenExporter } from '@tokiforge/core';

export interface GenerateCSSOptions {
  outputDir?: string;
  bodyClassPrefix?: string;
  prefix?: string;
  format?: 'css' | 'scss';
}

export async function generateThemeCSS(
  config: ThemeConfig,
  options: GenerateCSSOptions = {}
): Promise<Record<string, string>> {
  const {
    bodyClassPrefix = 'theme',
    prefix = 'hf',
    format = 'css',
  } = options;

  const cssFiles: Record<string, string> = {};

  for (const theme of config.themes) {
    const selector = `body.${bodyClassPrefix}-${theme.name}`;

    const tokens = typeof theme.tokens === 'function'
      ? await (theme.tokens as () => Promise<any>)()
      : theme.tokens;

    if (format === 'css') {
      cssFiles[`${theme.name}.css`] = TokenExporter.exportCSS(tokens, {
        selector,
        prefix,
      });
    } else {

      cssFiles[`${theme.name}.scss`] = TokenExporter.exportSCSS(tokens, {
        prefix,
      });
    }
  }

  return cssFiles;
}

export async function generateCombinedThemeCSS(
  config: ThemeConfig,
  options: GenerateCSSOptions = {}
): Promise<string> {
  const {
    bodyClassPrefix = 'theme',
    prefix = 'hf',
  } = options;

  const cssBlocks: string[] = [];

  for (const theme of config.themes) {
    const selector = `body.${bodyClassPrefix}-${theme.name}`;
    const tokens = typeof theme.tokens === 'function'
      ? await (theme.tokens as () => Promise<any>)()
      : theme.tokens;

    const css = TokenExporter.exportCSS(tokens, {
      selector,
      prefix,
    });
    cssBlocks.push(css);
  }

  return cssBlocks.join('\n\n');
}

