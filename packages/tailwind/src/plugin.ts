import fs from 'fs';
import type { DesignTokens, TokenValue } from '@tokiforge/core';
import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

export interface TailwindPluginOptions {
  /**
   * Path to tokens file (JSON)
   */
  tokensPath: string;
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
  };
  /**
   * Tailwind v4 support
   */
  v4?: boolean;
}

interface TokenUtilityMapping {
  colors: Record<string, string>;
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  fontSize: Record<string, string>;
  fontFamily: Record<string, string>;
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

/**
 * Map tokens to Tailwind utilities
 */
export function mapTokensToUtilities(tokens: DesignTokens, themeMappings?: TailwindPluginOptions['themeMappings']): TokenUtilityMapping {
  const colorPaths = themeMappings?.colors || ['colors'];
  const spacingPaths = themeMappings?.spacing || ['spacing'];
  const radiusPaths = themeMappings?.borderRadius || ['borderRadius', 'radius'];
  const fontSizePaths = themeMappings?.fontSize || ['typography', 'fontSize'];
  const fontFamilyPaths = themeMappings?.fontFamily || ['fontFamily'];

  const flattened = flattenTokensForUtilities(tokens);

  const utilities: TokenUtilityMapping = {
    colors: {},
    spacing: {},
    borderRadius: {},
    fontSize: {},
    fontFamily: {},
  };

  for (const [path, value] of Object.entries(flattened)) {
    const pathLower = path.toLowerCase();

    // Color mapping
    if (colorPaths.some((p) => pathLower.includes(p.toLowerCase()))) {
      if (typeof value === 'string' && (value.startsWith('#') || value.startsWith('rgb'))) {
        const key = path.split('.').slice(1).join('-').toLowerCase();
        utilities.colors[key] = value as string;
      }
    }

    // Spacing mapping
    if (spacingPaths.some((p) => pathLower.includes(p.toLowerCase()))) {
      if (typeof value === 'number') {
        const key = path.split('.').slice(1).join('-').toLowerCase();
        utilities.spacing[key] = `${value}px`;
      } else if (typeof value === 'string' && (value.includes('px') || value.includes('rem'))) {
        const key = path.split('.').slice(1).join('-').toLowerCase();
        utilities.spacing[key] = value;
      }
    }

    // Border radius mapping
    if (radiusPaths.some((p) => pathLower.includes(p.toLowerCase()))) {
      if (typeof value === 'number') {
        const key = path.split('.').slice(1).join('-').toLowerCase();
        utilities.borderRadius[key] = `${value}px`;
      } else if (typeof value === 'string' && (value.includes('px') || value.includes('rem'))) {
        const key = path.split('.').slice(1).join('-').toLowerCase();
        utilities.borderRadius[key] = value;
      }
    }

    // Font size mapping
    if (fontSizePaths.some((p) => pathLower.includes(p.toLowerCase()))) {
      if (typeof value === 'number') {
        const key = path.split('.').slice(1).join('-').toLowerCase();
        utilities.fontSize[key] = `${value}px`;
      } else if (typeof value === 'string' && (value.includes('px') || value.includes('rem'))) {
        const key = path.split('.').slice(1).join('-').toLowerCase();
        utilities.fontSize[key] = value;
      }
    }

    // Font family mapping
    if (fontFamilyPaths.some((p) => pathLower.includes(p.toLowerCase()))) {
      if (typeof value === 'string') {
        const key = path.split('.').slice(1).join('-').toLowerCase();
        utilities.fontFamily[key] = value;
      }
    }
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
  const tokens = JSON.parse(content);

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

/**
 * Create Tailwind plugin for token integration
 */
export function createTailwindPlugin(options: TailwindPluginOptions) {
  const {
    tokensPath,
    prefix = 'hf',
    watch = false,
    themeMappings,
  } = options;

  return plugin(
    function ({ addBase, addUtilities, e }) {
      // Load tokens
      let tokens: DesignTokens;
      try {
        tokens = loadTokensWithWatch(tokensPath, { watch } as TailwindPluginOptions);
      } catch (error) {
        console.warn(`⚠️ Failed to load tokens: ${error}`);
        return;
      }

      // Map tokens to utilities
      const utilities = mapTokensToUtilities(tokens, themeMappings);

      // Add CSS variables for colors
      const colorVars: Record<string, string> = {};
      for (const [key, value] of Object.entries(utilities.colors)) {
        colorVars[`--${prefix}-${key}`] = value;
      }

      if (Object.keys(colorVars).length > 0) {
        addBase({
          ':root': colorVars,
        });
      }

      // Add utilities for spacing
      const spacingUtilities: Record<string, any> = {};
      for (const [key, value] of Object.entries(utilities.spacing)) {
        spacingUtilities[`.${e(`spacing-${key}`)}}`] = {
          padding: value,
        };
        spacingUtilities[`.${e(`gap-${key}`)}}`] = {
          gap: value,
        };
      }

      if (Object.keys(spacingUtilities).length > 0) {
        addUtilities(spacingUtilities);
      }
    },
    {
      theme: {
        extend: {
          colors: mapTokensToUtilities(
            loadTokensWithWatch(tokensPath, options),
            themeMappings
          ).colors,
          spacing: mapTokensToUtilities(
            loadTokensWithWatch(tokensPath, options),
            themeMappings
          ).spacing,
          borderRadius: mapTokensToUtilities(
            loadTokensWithWatch(tokensPath, options),
            themeMappings
          ).borderRadius,
          fontSize: mapTokensToUtilities(
            loadTokensWithWatch(tokensPath, options),
            themeMappings
          ).fontSize,
          fontFamily: mapTokensToUtilities(
            loadTokensWithWatch(tokensPath, options),
            themeMappings
          ).fontFamily,
        },
      },
    }
  );
}

/**
 * Generate Tailwind config with token presets
 */
export function generateTailwindPreset(tokensPath: string, options: Partial<TailwindPluginOptions> = {}): Partial<Config> {
  const { themeMappings } = options;

  if (!fs.existsSync(tokensPath)) {
    throw new Error(`Tokens file not found: ${tokensPath}`);
  }

  const content = fs.readFileSync(tokensPath, 'utf-8');
  const tokens = JSON.parse(content);
  const utilities = mapTokensToUtilities(tokens, themeMappings);

  const config: Partial<Config> = {
    theme: {
      extend: {
        colors: utilities.colors,
        spacing: utilities.spacing,
        borderRadius: utilities.borderRadius,
        fontSize: utilities.fontSize,
        fontFamily: utilities.fontFamily,
      },
    },
  };

  if (options.v4) {
    // Tailwind v4 uses @theme variables
    const cssVariables: Record<string, string> = {};
    for (const [key, value] of Object.entries(utilities.colors)) {
      cssVariables[`--color-${key}`] = value as string;
    }
    for (const [key, value] of Object.entries(utilities.spacing)) {
      cssVariables[`--spacing-${key}`] = value as string;
    }

    config.corePlugins = {
      preflight: true,
    };
  }

  return config;
}

/**
 * Export utilities for Tailwind v4 @theme syntax
 */
export function generateTailwindThemeVariables(tokens: DesignTokens): Record<string, string> {
  const utilities = mapTokensToUtilities(tokens);
  const variables: Record<string, string> = {};

  for (const [key, value] of Object.entries(utilities.colors)) {
    variables[`--color-${key}`] = value;
  }

  for (const [key, value] of Object.entries(utilities.spacing)) {
    variables[`--spacing-${key}`] = value;
  }

  for (const [key, value] of Object.entries(utilities.borderRadius)) {
    variables[`--radius-${key}`] = value;
  }

  return variables;
}
