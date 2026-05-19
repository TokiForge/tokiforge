import type { TokenValue, DesignTokens, Breakpoint } from './types';
import { TokenExporter } from './token-exporter';

type TokenNode = Record<string, unknown>;

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

    // Generate base CSS
    cssParts.push(TokenExporter.exportCSS(tokens, { selector: ':root', prefix }));

    // Generate responsive CSS
    for (const bp of breakpointsToUse) {
      const mediaQuery = `@media (min-width: ${bp.min}px)`;
      const responsiveTokens: DesignTokens = {};

      // Filter tokens with responsive values for this breakpoint
      const processTokens = (obj: TokenNode, target: TokenNode): void => {
        for (const key of Object.keys(obj)) {
          const val = obj[key];
          if (val && typeof val === 'object') {
            if ('value' in val) {
              const token = val as unknown as TokenValue;
              if (token.responsive && token.responsive[bp.name] !== undefined) {
                if (!target[key]) {
                  target[key] = { ...token };
                }
                (target[key] as TokenNode).value = token.responsive[bp.name];
              }
            } else {
              if (!target[key]) {
                target[key] = {};
              }
              processTokens(val as TokenNode, target[key] as TokenNode);
            }
          }
        }
      };

      processTokens(tokens as unknown as TokenNode, responsiveTokens as unknown as TokenNode);

      if (Object.keys(responsiveTokens).length > 0) {
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
              const cssVar = `--${prefix}-${path}`.toLowerCase().replace(/\./g, '-');
              
              for (const [state, value] of Object.entries(states)) {
                if (state !== 'default' && value !== undefined) {
                  cssParts.push(`.${state} { ${cssVar}: ${value}; }`);
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
