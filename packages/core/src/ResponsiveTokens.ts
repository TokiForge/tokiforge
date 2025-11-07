import type { DesignTokens, TokenValue, Breakpoint } from './types';

export interface MediaQuery {
  name: string;
  query: string;
}

export class ResponsiveTokens {
  private static defaultBreakpoints: Breakpoint[] = [
    { name: 'sm', min: 640 },
    { name: 'md', min: 768 },
    { name: 'lg', min: 1024 },
    { name: 'xl', min: 1280 },
    { name: '2xl', min: 1536 },
  ];

  static getResponsiveValue(
    token: TokenValue,
    breakpoint: string,
    defaultBreakpoints: Breakpoint[] = this.defaultBreakpoints
  ): string | number | undefined {
    if (!token.responsive) {
      return this.getTokenValue(token);
    }

    const responsive = token.responsive;
    const bpIndex = defaultBreakpoints.findIndex((bp) => bp.name === breakpoint);

    if (responsive[breakpoint]) {
      return responsive[breakpoint];
    }

    if (responsive.default) {
      return responsive.default;
    }

    for (let i = bpIndex - 1; i >= 0; i--) {
      const bpName = defaultBreakpoints[i].name;
      if (responsive[bpName]) {
        return responsive[bpName];
      }
    }

    return undefined;
  }

  static getStateValue(token: TokenValue, state: string): string | number | undefined {
    if (!token.states) {
      if (state === 'default') {
        return this.getTokenValue(token);
      }
      return undefined;
    }

    const states = token.states;
    if (states[state]) {
      return states[state];
    }

    if (state !== 'default' && states.default) {
      return states.default;
    }

    return undefined;
  }

  static generateResponsiveCSS(
    tokens: DesignTokens,
    breakpoints: Breakpoint[] = this.defaultBreakpoints,
    prefix: string = 'hf'
  ): string {
    const css: string[] = [];
    const baseVars: string[] = [];
    const mediaQueries: Map<string, string[]> = new Map();

    for (const bp of breakpoints) {
      mediaQueries.set(bp.name, []);
    }

    const traverse = (obj: DesignTokens, path: string = ''): void => {
      for (const key in obj) {
        const currentPath = path ? `${path}-${key}` : key;
        const value = obj[key];

        if (value && typeof value === 'object' && !Array.isArray(value)) {
          if (this.isTokenValue(value)) {
            const token = value as TokenValue;
            const baseValue = this.getTokenValue(token);

            if (baseValue) {
              baseVars.push(`  --${prefix}-${currentPath}: ${baseValue};`);
            }

            if (token.responsive) {
              for (const bp of breakpoints) {
                const responsiveValue = token.responsive[bp.name];
                if (responsiveValue) {
                  const vars = mediaQueries.get(bp.name) || [];
                  vars.push(`  --${prefix}-${currentPath}: ${responsiveValue};`);
                  mediaQueries.set(bp.name, vars);
                }
              }
            }
          } else {
            traverse(value as DesignTokens, currentPath);
          }
        }
      }
    };

    traverse(tokens);

    css.push(`:root {\n${baseVars.join('\n')}\n}`);

    for (const [bpName, vars] of mediaQueries.entries()) {
      const bp = breakpoints.find((b) => b.name === bpName);
      if (bp && vars.length > 0) {
        const minWidth = bp.min || 0;
        css.push(`@media (min-width: ${minWidth}px) {\n  :root {\n${vars.join('\n')}\n  }\n}`);
      }
    }

    return css.join('\n\n');
  }

  static generateStateCSS(
    tokens: DesignTokens,
    prefix: string = 'hf'
  ): string {
    const css: string[] = [];
    const stateClasses: Map<string, Map<string, string[]>> = new Map();

    const traverse = (obj: DesignTokens, path: string = ''): void => {
      for (const key in obj) {
        const currentPath = path ? `${path}-${key}` : key;
        const value = obj[key];

        if (value && typeof value === 'object' && !Array.isArray(value)) {
          if (this.isTokenValue(value)) {
            const token = value as TokenValue;

            if (token.states) {
              for (const [state, stateValue] of Object.entries(token.states)) {
                if (!stateClasses.has(state)) {
                  stateClasses.set(state, new Map());
                }
                const stateMap = stateClasses.get(state)!;
                if (!stateMap.has(currentPath)) {
                  stateMap.set(currentPath, []);
                }
                stateMap.get(currentPath)!.push(`${stateValue}`);
              }
            }
          } else {
            traverse(value as DesignTokens, currentPath);
          }
        }
      }
    };

    traverse(tokens);

    for (const [state, stateMap] of stateClasses.entries()) {
      const rules: string[] = [];
      for (const [path, values] of stateMap.entries()) {
        rules.push(`  --${prefix}-${path}: ${values[0]};`);
      }
      if (rules.length > 0) {
        const selector = this.getStateSelector(state);
        css.push(`${selector} {\n${rules.join('\n')}\n}`);
      }
    }

    return css.join('\n\n');
  }

  static flattenResponsiveTokens(tokens: DesignTokens, breakpoint: string): DesignTokens {
    const flattened: DesignTokens = {};

    const traverse = (obj: DesignTokens, target: DesignTokens, currentPath: string = ''): void => {
      for (const key in obj) {
        const path = currentPath ? `${currentPath}.${key}` : key;
        const value = obj[key];

        if (value && typeof value === 'object' && !Array.isArray(value)) {
          if (this.isTokenValue(value)) {
            const token = value as TokenValue;
            const responsiveValue = this.getResponsiveValue(token, breakpoint);

            if (responsiveValue) {
              target[key] = {
                ...token,
                value: responsiveValue,
                responsive: undefined,
              } as TokenValue;
            } else {
              target[key] = value;
            }
          } else {
            target[key] = {};
            traverse(value as DesignTokens, target[key] as DesignTokens, path);
          }
        }
      }
    };

    traverse(tokens, flattened);
    return flattened;
  }

  static flattenStateTokens(tokens: DesignTokens, state: string = 'default'): DesignTokens {
    const flattened: DesignTokens = {};

    const traverse = (obj: DesignTokens, target: DesignTokens): void => {
      for (const key in obj) {
        const value = obj[key];

        if (value && typeof value === 'object' && !Array.isArray(value)) {
          if (this.isTokenValue(value)) {
            const token = value as TokenValue;
            const stateValue = this.getStateValue(token, state);

            if (stateValue) {
              target[key] = {
                ...token,
                value: stateValue,
                states: undefined,
              } as TokenValue;
            } else {
              target[key] = value;
            }
          } else {
            target[key] = {};
            traverse(value as DesignTokens, target[key] as DesignTokens);
          }
        }
      }
    };

    traverse(tokens, flattened);
    return flattened;
  }

  private static getStateSelector(state: string): string {
    const selectors: Record<string, string> = {
      hover: ':hover',
      active: ':active',
      focus: ':focus',
      disabled: ':disabled',
      loading: '[data-loading="true"]',
    };
    return selectors[state] || `.${state}`;
  }

  private static isTokenValue(value: any): value is TokenValue {
    return (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      ('value' in value || '$value' in value || '$alias' in value || 'states' in value || 'responsive' in value)
    );
  }

  private static getTokenValue(token: TokenValue): string | number | undefined {
    if (typeof token.value === 'string' || typeof token.value === 'number') {
      return token.value;
    }
    if (token.$value && (typeof token.$value === 'string' || typeof token.$value === 'number')) {
      return token.$value;
    }
    return undefined;
  }
}

