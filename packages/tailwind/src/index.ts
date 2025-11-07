import type { DesignTokens } from '@tokiforge/core';
import { TokenParser } from '@tokiforge/core';
import type { Config } from 'tailwindcss';

export interface TailwindConfigOptions {
  /**
   * Path to tokens file (JSON or YAML)
   */
  tokensPath?: string;
  /**
   * Design tokens object (alternative to tokensPath)
   */
  tokens?: DesignTokens;
  /**
   * CSS variable prefix (default: 'hf')
   */
  prefix?: string;
  /**
   * Whether to use CSS variables in Tailwind config
   */
  useCSSVariables?: boolean;
  /**
   * Custom theme key mappings
   */
  themeMappings?: {
    colors?: string[];
    spacing?: string[];
    borderRadius?: string[];
    fontSize?: string[];
    fontFamily?: string[];
    fontWeight?: string[];
  };
}

/**
 * Flatten tokens to a flat object with dot notation
 */
function flattenTokens(
  tokens: DesignTokens,
  prefix: string = '',
  result: Record<string, any> = {}
): Record<string, any> {
  for (const key in tokens) {
    const value = tokens[key];
    const path = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      if ('value' in value || '$value' in value || '$alias' in value) {
        const token = value as any;
        const tokenValue = 'value' in token ? token.value : ('$value' in token ? token.$value : null);
        result[path] = tokenValue;
      } else {
        flattenTokens(value as DesignTokens, path, result);
      }
    }
  }

  return result;
}

/**
 * Convert token path to Tailwind-friendly key
 */
function toTailwindKey(path: string): string {
  const parts = path.split('.');
  return parts.join('-');
}

/**
 * Generate Tailwind theme configuration from design tokens
 */
export function generateTailwindConfig(options: TailwindConfigOptions = {}): Partial<Config> {
  const {
    tokensPath,
    tokens: providedTokens,
    prefix = 'hf',
    useCSSVariables = true,
    themeMappings = {},
  } = options;

  let tokens: DesignTokens;

  if (tokensPath) {
    tokens = TokenParser.parse(tokensPath, { expandReferences: true });
  } else if (providedTokens) {
    tokens = TokenParser.expandReferences(providedTokens);
  } else {
    throw new Error('Either tokensPath or tokens must be provided');
  }

  const flattened = flattenTokens(tokens);
  const config: Partial<Config> = {
    theme: {
      extend: {},
    },
  };

  // Default mappings
  const colorPaths = themeMappings.colors || ['color'];
  const spacingPaths = themeMappings.spacing || ['spacing', 'size'];
  const borderRadiusPaths = themeMappings.borderRadius || ['radius', 'borderRadius'];
  const fontSizePaths = themeMappings.fontSize || ['fontSize', 'typography.size'];
  const fontFamilyPaths = themeMappings.fontFamily || ['fontFamily', 'typography.family'];
  const fontWeightPaths = themeMappings.fontWeight || ['fontWeight', 'typography.weight'];

  // Extract colors
  const colors: Record<string, string> = {};
  for (const path in flattened) {
    if (colorPaths.some((p) => path.startsWith(p))) {
      const value = flattened[path];
      if (typeof value === 'string' && (value.startsWith('#') || value.startsWith('rgb'))) {
        const key = toTailwindKey(path.replace(/^color\.?/, ''));
        colors[key] = useCSSVariables
          ? `var(--${prefix}-${path.replace(/\./g, '-')})`
          : String(value);
      }
    }
  }

  // Extract spacing
  const spacing: Record<string, string> = {};
  for (const path in flattened) {
    if (spacingPaths.some((p) => path.startsWith(p))) {
      const value = flattened[path];
      if (typeof value === 'string' && (value.includes('px') || value.includes('rem') || value.includes('em'))) {
        const key = toTailwindKey(path.replace(/^(spacing|size)\.?/, ''));
        spacing[key] = useCSSVariables
          ? `var(--${prefix}-${path.replace(/\./g, '-')})`
          : String(value);
      }
    }
  }

  // Extract border radius
  const borderRadius: Record<string, string> = {};
  for (const path in flattened) {
    if (borderRadiusPaths.some((p) => path.startsWith(p))) {
      const value = flattened[path];
      if (typeof value === 'string' && (value.includes('px') || value.includes('rem'))) {
        const key = toTailwindKey(path.replace(/^(radius|borderRadius)\.?/, ''));
        borderRadius[key] = useCSSVariables
          ? `var(--${prefix}-${path.replace(/\./g, '-')})`
          : String(value);
      }
    }
  }

  // Extract font sizes
  const fontSize: Record<string, any> = {};
  for (const path in flattened) {
    if (fontSizePaths.some((p) => path.startsWith(p))) {
      const value = flattened[path];
      if (typeof value === 'string') {
        const key = toTailwindKey(path.replace(/^(fontSize|typography\.size)\.?/, ''));
        fontSize[key] = useCSSVariables
          ? `var(--${prefix}-${path.replace(/\./g, '-')})`
          : String(value);
      }
    }
  }

  // Extract font families
  const fontFamily: Record<string, string[]> = {};
  for (const path in flattened) {
    if (fontFamilyPaths.some((p) => path.startsWith(p))) {
      const value = flattened[path];
      if (typeof value === 'string') {
        const key = toTailwindKey(path.replace(/^(fontFamily|typography\.family)\.?/, ''));
        fontFamily[key] = [String(value)];
      }
    }
  }

  // Extract font weights
  const fontWeight: Record<string, string> = {};
  for (const path in flattened) {
    if (fontWeightPaths.some((p) => path.startsWith(p))) {
      const value = flattened[path];
      const key = toTailwindKey(path.replace(/^(fontWeight|typography\.weight)\.?/, ''));
      fontWeight[key] = useCSSVariables
        ? `var(--${prefix}-${path.replace(/\./g, '-')})`
        : String(value);
    }
  }

  // Build theme.extend
  if (Object.keys(colors).length > 0) {
    config.theme!.extend!.colors = colors;
  }
  if (Object.keys(spacing).length > 0) {
    config.theme!.extend!.spacing = spacing;
  }
  if (Object.keys(borderRadius).length > 0) {
    config.theme!.extend!.borderRadius = borderRadius;
  }
  if (Object.keys(fontSize).length > 0) {
    config.theme!.extend!.fontSize = fontSize;
  }
  if (Object.keys(fontFamily).length > 0) {
    config.theme!.extend!.fontFamily = fontFamily;
  }
  if (Object.keys(fontWeight).length > 0) {
    config.theme!.extend!.fontWeight = fontWeight;
  }

  return config;
}

/**
 * Generate complete tailwind.config.js file content
 */
export function generateTailwindConfigFile(
  options: TailwindConfigOptions & { content?: string[] }
): string {
  const { content = ['./src/**/*.{js,ts,jsx,tsx}'], ...configOptions } = options;
  const config = generateTailwindConfig(configOptions);

  return `/** @type {import('tailwindcss').Config} */
export default {
  content: ${JSON.stringify(content, null, 2)},
  theme: ${JSON.stringify(config.theme, null, 2)},
  plugins: [],
}
`;
}

/**
 * Tailwind CSS plugin for TokiForge
 */
export function tokiforgeTailwindPlugin(options: TailwindConfigOptions) {
  return {
    handler: (pluginAPI: any) => {
      const config = generateTailwindConfig(options);
      if (config.theme?.extend) {
        pluginAPI.addBase({
          ':root': {},
        });
      }
    },
    config: generateTailwindConfig(options),
  };
}

