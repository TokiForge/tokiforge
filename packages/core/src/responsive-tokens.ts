import type { TokenValue, DesignTokens, Breakpoint } from './types';
import { TokenExporter, escapeCSSValue } from './token-exporter';

type TokenNode = Record<string, unknown>;

const PSEUDO_STATES = new Set([
  'hover',
  'active',
  'focus',
  'focus-visible',
  'focus-within',
  'disabled',
  'visited',
  'checked',
  'target',
]);

function mediaQueryFor(bp: Breakpoint): string | null {
  const features: string[] = [];
  if (typeof bp.min === 'number') features.push(`(min-width: ${bp.min}px)`);
  if (typeof bp.max === 'number') features.push(`(max-width: ${bp.max}px)`);
  if (bp.prefers) {
    const prefers = bp.prefers.trim();
    features.push(prefers.startsWith('(') ? prefers : `(${prefers})`);
  }

  if (bp.container) {
    if (features.length === 0) return null;
    const name = typeof bp.container === 'string' ? bp.container.trim() : '';
    if (name && !/^[a-zA-Z_][\w-]*$/.test(name)) return null;
    return name
      ? `@container ${name} ${features.join(' and ')}`
      : `@container ${features.join(' and ')}`;
  }

  return features.length > 0 ? `@media ${features.join(' and ')}` : null;
}

function stateSelector(state: string): string | null {
  if (!/^[a-z][\w-]*$/i.test(state)) return null;
  return PSEUDO_STATES.has(state) ? `:${state}` : `.${state}`;
}

export class ResponsiveTokens {
  static getResponsiveValue(token: TokenValue, breakpoint: string): string | number | undefined {
    if (!token.responsive) {
      return typeof token.value === 'object' ? undefined : token.value;
    }

    const responsive = token.responsive;
    return responsive[breakpoint] ?? responsive.default;
  }

  static getStateValue(token: TokenValue, state: string): string | number | undefined {
    if (!token.states) {
      return typeof token.value === 'object' ? undefined : token.value;
    }

    const states = token.states;
    return states[state] ?? states.default;
  }

  static generateResponsiveCSS(
    tokens: DesignTokens,
    breakpoints: Breakpoint[] = [],
    prefix = 'hf'
  ): string {
    const defaultBreakpoints: Breakpoint[] = [
      { name: 'sm', min: 640 },
      { name: 'md', min: 768 },
      { name: 'lg', min: 1024 },
      { name: 'xl', min: 1280 },
    ];

    const breakpointsToUse = breakpoints.length > 0 ? breakpoints : defaultBreakpoints;
    const cssParts: string[] = [];

    cssParts.push(TokenExporter.exportCSS(tokens, { selector: ':root', prefix }));

    for (const bp of breakpointsToUse) {
      const mediaQuery = mediaQueryFor(bp);
      if (!mediaQuery) continue;

      const responsiveTokens: DesignTokens = {};
      let found = false;

      const processTokens = (obj: TokenNode, target: TokenNode): void => {
        for (const key of Object.keys(obj)) {
          const val = obj[key];
          if (val && typeof val === 'object') {
            if ('value' in val) {
              const token = val as unknown as TokenValue;
              if (token.responsive && token.responsive[bp.name] !== undefined) {
                found = true;
                target[key] ??= { ...token };
                (target[key] as TokenNode).value = token.responsive[bp.name];
              }
            } else if (!Array.isArray(val)) {
              const child: TokenNode = {};
              processTokens(val as TokenNode, child);
              if (Object.keys(child).length > 0) {
                target[key] = child;
              }
            }
          }
        }
      };

      processTokens(tokens as unknown as TokenNode, responsiveTokens as unknown as TokenNode);

      if (found) {
        const responsiveCSS = TokenExporter.exportCSS(responsiveTokens, {
          selector: ':root',
          prefix,
        });
        cssParts.push(`${mediaQuery} {\n${responsiveCSS}\n}`);
      }
    }

    return cssParts.join('\n\n');
  }

  static generateStateCSS(tokens: DesignTokens, prefix = 'hf'): string {
    const cssParts: string[] = [];
    
    const processTokens = (obj: TokenNode, basePath = ''): void => {
      for (const key of Object.keys(obj)) {
        const path = basePath ? `${basePath}-${key}` : key;
        const val = obj[key];
        
        if (val && typeof val === 'object') {
          if ('value' in val) {
            const token = val as unknown as TokenValue;
            if (token.states) {
              const states = token.states;
              const cssVar = `--${prefix}-${path}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');

              for (const [state, value] of Object.entries(states)) {
                const selector = state === 'default' ? null : stateSelector(state);
                if (selector && value !== undefined) {
                  cssParts.push(`${selector} { ${cssVar}: ${escapeCSSValue(String(value))}; }`);
                }
              }
            }
          } else {
            processTokens(val as TokenNode, path);
          }
        }
      }
    };

    processTokens(tokens as unknown as TokenNode);
    return cssParts.join('\n');
  }
}
