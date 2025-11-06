import type { ThemeConfig } from '@tokiforge/core';
import { TokenExporter } from '@tokiforge/core';

export interface GenerateCSSOptions {
  outputDir?: string;
  bodyClassPrefix?: string;
  prefix?: string;
  format?: 'css' | 'scss';
}

export function generateThemeCSS(
  config: ThemeConfig,
  options: GenerateCSSOptions = {}
): Record<string, string> {
  const {
    bodyClassPrefix = 'theme',
    prefix = 'hf',
    format = 'css',
  } = options;

  const cssFiles: Record<string, string> = {};

  for (const theme of config.themes) {
    const selector = `body.${bodyClassPrefix}-${theme.name}`;
    
    if (format === 'css') {
      cssFiles[`${theme.name}.css`] = TokenExporter.exportCSS(theme.tokens, {
        selector,
        prefix,
      });
    } else {
      cssFiles[`${theme.name}.scss`] = TokenExporter.exportSCSS(theme.tokens, {
        prefix,
      });
    }
  }

  return cssFiles;
}

export function generateCombinedThemeCSS(
  config: ThemeConfig,
  options: GenerateCSSOptions = {}
): string {
  const {
    bodyClassPrefix = 'theme',
    prefix = 'hf',
  } = options;

  const cssBlocks: string[] = [];

  for (const theme of config.themes) {
    const selector = `body.${bodyClassPrefix}-${theme.name}`;
    const css = TokenExporter.exportCSS(theme.tokens, {
      selector,
      prefix,
    });
    cssBlocks.push(css);
  }

  return cssBlocks.join('\n\n');
}

