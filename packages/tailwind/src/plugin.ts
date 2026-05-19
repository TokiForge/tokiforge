import fs from 'node:fs';
import type { DesignTokens, TokenValue } from '@tokiforge/core';
import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

export interface TailwindPluginOptions {
  /**
   * Path to tokens file (JSON)
   */
  tokensPath?: string;
  /**
   * Design tokens object (alternative to tokensPath; e.g. for Vite/HMR)
   */
  tokens?: DesignTokens;
  /**
   * CSS variable prefix (default: 'hf')
   */
  prefix?: string;
  /**
   * Watch for token file changes
   */
  watch?: boolean;
  /**
   * Theme key mappings
   */
  themeMappings?: {
    colors?: string[];
    spacing?: string[];
    borderRadius?: string[];
    fontSize?: string[];
    fontFamily?: string[];
    boxShadow?: string[];
    lineHeight?: string[];
    animation?: string[];
  };
  /**
   * Tailwind v4 support
   */
  v4?: boolean;
  /**
   * Where CSS variables are attached (default: ':root')
   */
  baseSelector?: string;
  /**
   * If true, fail build when tokens are missing/invalid; if false, warn and skip (default: false)
   */
  strict?: boolean;
  /**
   * When false, only inject CSS variables, no .spacing-* / .gap-* utilities (default: true)
   */
  includeUtilities?: boolean;
  /**
   * Token path prefixes to exclude from mapping (e.g. ['internal.', 'legacy.'])
   */
  excludePaths?: string[];
  /**
   * Prefix for generated utility classes (independent of CSS variable prefix)
   */
  customUtilityPrefix?: string;
  /**
   * Log resolved paths and mapped key count (dev only, default: false)
   */
  debug?: boolean;
}

interface TokenUtilityMapping {
  colors: Record<string, string>;
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  fontSize: Record<string, string>;
  fontFamily: Record<string, string>;
  boxShadow: Record<string, string>;
}

/**
 * Flatten tokens to map utilities
 */
function flattenTokensForUtilities(tokens: DesignTokens, prefix = ''): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  function traverse(obj: any, currentPrefix: string) {
    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) continue;

      const fullKey = currentPrefix ? `${currentPrefix}.${key}` : key;

      if (typeof value === 'object' && !Array.isArray(value)) {
        if ('value' in value) {
          result[fullKey] = (value as TokenValue).value;
        } else {
          traverse(value, fullKey);
        }
      }
    }
  }

  traverse(tokens, prefix);
  return result;
}

interface PathMappingConfig {
  colorPaths: string[];
  spacingPaths: string[];
  radiusPaths: string[];
  fontSizePaths: string[];
  fontFamilyPaths: string[];
  boxShadowPaths: string[];
}

function processSingleToken(
  tokenPath: string,
  value: unknown,
  utilities: TokenUtilityMapping,
  paths: PathMappingConfig
): void {
  const pathLower = tokenPath.toLowerCase();
  const getKey = () => tokenPath.split('.').slice(1).join('-').toLowerCase();

  // Color mapping
  if (paths.colorPaths.some((p) => pathLower.includes(p.toLowerCase()))) {
    if (typeof value === 'string' && (value.startsWith('#') || value.startsWith('rgb'))) {
      utilities.colors[getKey()] = value;
    }
  }

  // Spacing mapping
  if (paths.spacingPaths.some((p) => pathLower.includes(p.toLowerCase()))) {
    if (typeof value === 'number') {
      utilities.spacing[getKey()] = `${value}px`;
    } else if (typeof value === 'string' && (value.includes('px') || value.includes('rem'))) {
      utilities.spacing[getKey()] = value;
    }
  }

  // Border radius mapping
  if (paths.radiusPaths.some((p) => pathLower.includes(p.toLowerCase()))) {
    if (typeof value === 'number') {
      utilities.borderRadius[getKey()] = `${value}px`;
    } else if (typeof value === 'string' && (value.includes('px') || value.includes('rem'))) {
      utilities.borderRadius[getKey()] = value;
    }
  }

  // Font size mapping
  if (paths.fontSizePaths.some((p) => pathLower.includes(p.toLowerCase()))) {
    if (typeof value === 'number') {
      utilities.fontSize[getKey()] = `${value}px`;
    } else if (typeof value === 'string' && (value.includes('px') || value.includes('rem'))) {
      utilities.fontSize[getKey()] = value;
    }
  }

  // Font family mapping
  if (paths.fontFamilyPaths.some((p) => pathLower.includes(p.toLowerCase()))) {
    if (typeof value === 'string') {
      utilities.fontFamily[getKey()] = value;
    }
  }

  // Box shadow mapping
  if (paths.boxShadowPaths.some((p) => pathLower.includes(p.toLowerCase()))) {
    if (typeof value === 'string' && (value.includes('px') || value.includes('shadow') || value.includes('rgba') || value.includes('rgb'))) {
      utilities.boxShadow[getKey()] = value;
    }
  }
}

/**
 * Map tokens to Tailwind utilities
 */
export function mapTokensToUtilities(
  tokens: DesignTokens,
  themeMappings?: TailwindPluginOptions['themeMappings'],
  excludePaths?: string[]
): TokenUtilityMapping {
  const paths: PathMappingConfig = {
    colorPaths: themeMappings?.colors || ['colors'],
    spacingPaths: themeMappings?.spacing || ['spacing'],
    radiusPaths: themeMappings?.borderRadius || ['borderRadius', 'radius'],
    fontSizePaths: themeMappings?.fontSize || ['typography', 'fontSize'],
    fontFamilyPaths: themeMappings?.fontFamily || ['fontFamily'],
    boxShadowPaths: themeMappings?.boxShadow || ['shadow', 'boxShadow'],
  };

  const flattened = flattenTokensForUtilities(tokens);

  const utilities: TokenUtilityMapping = {
    colors: {},
    spacing: {},
    borderRadius: {},
    fontSize: {},
    fontFamily: {},
    boxShadow: {},
  };

  for (const [tokenPath, value] of Object.entries(flattened)) {
    if (excludePaths?.some((p) => tokenPath.startsWith(p))) continue;
    processSingleToken(tokenPath, value, utilities, paths);
  }

  return utilities;
}

/**
 * Load and watch tokens file
 */
function loadTokensWithWatch(tokensPath: string, options: TailwindPluginOptions): DesignTokens {
  if (!fs.existsSync(tokensPath)) {
    throw new Error(`Tokens file not found: ${tokensPath}`);
  }

  const content = fs.readFileSync(tokensPath, 'utf-8');
  let tokens: DesignTokens;
  try {
    tokens = JSON.parse(content);
  } catch (parseError) {
    throw new Error(`Invalid tokens JSON: ${parseError}`);
  }

  if (options.watch) {
    fs.watchFile(tokensPath, () => {
      if (fs.existsSync(tokensPath)) {
        const updatedContent = fs.readFileSync(tokensPath, 'utf-8');
        try {
          JSON.parse(updatedContent);
          console.log(`📝 Tokens file updated: ${tokensPath}`);
        } catch (error) {
          console.error(`❌ Invalid tokens file: ${error}`);
        }
      }
    });
  }

  return tokens;
}

function getTokens(options: TailwindPluginOptions): DesignTokens {
  if (options.tokens) {
    return options.tokens;
  }
  if (!options.tokensPath) {
    throw new Error('Either tokensPath or tokens must be provided');
  }
  return loadTokensWithWatch(options.tokensPath, options);
}

function escapeClassName(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, (char) => `\\${char}`);
}

/**
 * Create Tailwind plugin for token integration
 */
export function createTailwindPlugin(options: TailwindPluginOptions): any {
  const {
    prefix = 'hf',
    themeMappings,
    baseSelector = ':root',
    strict = false,
    includeUtilities = true,
    excludePaths,
    customUtilityPrefix,
    debug = false,
  } = options;

  const utilityPrefix = customUtilityPrefix ?? prefix;

  return plugin(
    function ({ addBase, addUtilities }) {
      let tokens: DesignTokens;
      try {
        tokens = getTokens(options);
      } catch (error) {
        if (strict) {
          throw error;
        }
        console.warn(`⚠️ Failed to load tokens: ${error}`);
        return;
      }

      const utilities = mapTokensToUtilities(tokens, themeMappings, excludePaths);

      if (debug) {
        const totalKeys =
          Object.keys(utilities.colors).length +
          Object.keys(utilities.spacing).length +
          Object.keys(utilities.borderRadius).length +
          Object.keys(utilities.fontSize).length +
          Object.keys(utilities.fontFamily).length +
          Object.keys(utilities.boxShadow).length;
        console.log(`[TokiForge Tailwind] Mapped ${totalKeys} token keys for ${baseSelector}`);
      }

      const colorVars: Record<string, string> = {};
      for (const [key, value] of Object.entries(utilities.colors)) {
        colorVars[`--${prefix}-${key}`] = value;
      }

      if (Object.keys(colorVars).length > 0) {
        addBase({
          [baseSelector]: colorVars,
        });
      }

      if (includeUtilities) {
        const spacingUtilities: Record<string, Record<string, string>> = {};
        for (const [key, value] of Object.entries(utilities.spacing)) {
          const spacingClass = '.' + escapeClassName(utilityPrefix + '-spacing-' + key);
          spacingUtilities[spacingClass] = {
            padding: value,
          };
          const gapClass = '.' + escapeClassName(utilityPrefix + '-gap-' + key);
          spacingUtilities[gapClass] = {
            gap: value,
          };
        }
        if (Object.keys(spacingUtilities).length > 0) {
          addUtilities(spacingUtilities);
        }
      }
    },
    (() => {
      let tokens: DesignTokens;
      try {
        tokens = getTokens(options);
      } catch (error) {
        if (strict) throw error;
        return { theme: { extend: {} } };
      }
      const utilities = mapTokensToUtilities(tokens, themeMappings, excludePaths);
      return {
        theme: {
          extend: {
            colors: utilities.colors,
            spacing: utilities.spacing,
            borderRadius: utilities.borderRadius,
            fontSize: utilities.fontSize,
            fontFamily: utilities.fontFamily,
            boxShadow: Object.keys(utilities.boxShadow).length > 0 ? utilities.boxShadow : undefined,
          },
        },
      };
    })()
  );
}

/**
 * Generate Tailwind config with token presets
 */
export function generateTailwindPreset(
  tokensPathOrOptions: string | (Partial<TailwindPluginOptions> & { tokensPath?: string }),
  options: Partial<TailwindPluginOptions> = {}
): Partial<Config> {
  const opts =
    typeof tokensPathOrOptions === 'string'
      ? { ...options, tokensPath: tokensPathOrOptions }
      : { ...tokensPathOrOptions };
  const { themeMappings, excludePaths } = opts;

  const tokens = opts.tokens ?? (() => {
    const path = opts.tokensPath;
    if (!path || !fs.existsSync(path)) {
      throw new Error(`Tokens file not found: ${path ?? 'tokensPath'}`);
    }
    const content = fs.readFileSync(path, 'utf-8');
    return JSON.parse(content) as DesignTokens;
  })();

  const utilities = mapTokensToUtilities(tokens, themeMappings, excludePaths);

  const extend: Record<string, any> = {
    colors: utilities.colors,
    spacing: utilities.spacing,
    borderRadius: utilities.borderRadius,
    fontSize: utilities.fontSize,
    fontFamily: utilities.fontFamily,
  };
  if (Object.keys(utilities.boxShadow).length > 0) {
    extend.boxShadow = utilities.boxShadow;
  }

  const config: Partial<Config> = {
    theme: {
      extend,
    },
  };

  if (opts.v4) {
    const cssVariables: Record<string, string> = {};
    for (const [key, value] of Object.entries(utilities.colors)) {
      cssVariables[`--color-${key}`] = value;
    }
    for (const [key, value] of Object.entries(utilities.spacing)) {
      cssVariables[`--spacing-${key}`] = value;
    }

    config.plugins = config.plugins ?? [];
  }

  return config;
}

/**
 * Export utilities for Tailwind v4 @theme syntax
 */
export function generateTailwindThemeVariables(tokens: DesignTokens, prefix?: string): Record<string, string> {
  const utilities = mapTokensToUtilities(tokens);
  const variables: Record<string, string> = {};
  const varPrefix = prefix ? `--${prefix}-` : '--';

  for (const [key, value] of Object.entries(utilities.colors)) {
    variables[`${varPrefix}color-${key}`] = value;
  }

  for (const [key, value] of Object.entries(utilities.spacing)) {
    variables[`${varPrefix}spacing-${key}`] = value;
  }

  for (const [key, value] of Object.entries(utilities.borderRadius)) {
    variables[`${varPrefix}radius-${key}`] = value;
  }

  return variables;
}
