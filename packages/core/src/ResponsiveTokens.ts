import type { DesignTokens, TokenValue, TokenResponsive, Breakpoint } from './types';

export class ResponsiveTokens {
  static getResponsiveValue(
    token: TokenValue,
    breakpoint: string,
    defaultBreakpoints: Breakpoint[] = [
      { name: 'sm', min: 640 },
      { name: 'md', min: 768 },
      { name: 'lg', min: 1024 },
      { name: 'xl', min: 1280 },
      { name: '2xl', min: 1536 },
    ]
  ): string | number | undefined {
    if (!token.responsive) {
      const value = token.value || token.$value;
      return typeof value === 'string' || typeof value === 'number' ? value : undefined;
    }

    const responsive = token.responsive as TokenResponsive;
    const breakpointValue = responsive[breakpoint as keyof TokenResponsive];

    if (breakpointValue !== undefined) {
      return breakpointValue;
    }

    const defaultValue = responsive.default;
    if (defaultValue !== undefined) {
      return defaultValue;
    }

    const tokenValue = token.value || token.$value;
    return typeof tokenValue === 'string' || typeof tokenValue === 'number' ? tokenValue : undefined;
  }

  static getStateValue(token: TokenValue, state: string): string | number | undefined {
    if (!token.states) {
      const value = token.value || token.$value;
      return typeof value === 'string' || typeof value === 'number' ? value : undefined;
    }

    const stateValue = token.states[state as keyof typeof token.states];
    if (stateValue !== undefined) {
      return stateValue;
    }

    const defaultValue = token.states.default;
    if (defaultValue !== undefined) {
      return defaultValue;
    }

    const tokenValue = token.value || token.$value;
    return typeof tokenValue === 'string' || typeof tokenValue === 'number' ? tokenValue : undefined;
  }

  static generateResponsiveCSS(
    tokens: DesignTokens,
    breakpoints: Breakpoint[] = [
      { name: 'sm', min: 640 },
      { name: 'md', min: 768 },
      { name: 'lg', min: 1024 },
      { name: 'xl', min: 1280 },
      { name: '2xl', min: 1536 },
    ],
    prefix: string = 'hf'
  ): string {
    const cssRules: string[] = [];

    for (const breakpoint of breakpoints) {
      const mediaQuery = `@media (min-width: ${breakpoint.min}px)`;
      const variables: string[] = [];

      this.flattenResponsiveTokens(tokens, breakpoint.name, prefix, variables);

      if (variables.length > 0) {
        cssRules.push(`${mediaQuery} {\n  :root {\n    ${variables.join('\n    ')}\n  }\n}`);
      }
    }

    return cssRules.join('\n\n');
  }

  static generateStateCSS(tokens: DesignTokens, prefix: string = 'hf'): string {
    const cssRules: string[] = [];

    this.flattenStateTokens(tokens, prefix, cssRules);

    return cssRules.join('\n\n');
  }

  static flattenResponsiveTokens(tokens: DesignTokens, breakpoint?: string, prefix?: string): DesignTokens;
  static flattenResponsiveTokens(tokens: DesignTokens, breakpoint: string, prefix: string, result: string[]): void;
  static flattenResponsiveTokens(
    tokens: DesignTokens,
    breakpoint?: string,
    prefix?: string,
    result?: string[]
  ): DesignTokens | void {
    if (result) {
      this.flattenResponsiveTokensRecursive(tokens, breakpoint!, prefix!, result);
      return;
    }

    const flattened: DesignTokens = {};
    this.flattenResponsiveTokensToObject(tokens, breakpoint || 'default', flattened);
    return flattened;
  }

  static flattenStateTokens(tokens: DesignTokens, state?: string, prefix?: string): DesignTokens;
  static flattenStateTokens(tokens: DesignTokens, prefix: string, result: string[]): void;
  static flattenStateTokens(
    tokens: DesignTokens,
    stateOrPrefix?: string,
    prefixOrResult?: string | string[],
    result?: string[]
  ): DesignTokens | void {
    if (Array.isArray(prefixOrResult)) {
      this.flattenStateTokensRecursive(tokens, stateOrPrefix || 'hf', prefixOrResult);
      return;
    }

    const flattened: DesignTokens = {};
    this.flattenStateTokensToObject(tokens, stateOrPrefix || 'default', flattened);
    return flattened;
  }

  private static flattenResponsiveTokensRecursive(
    tokens: DesignTokens,
    breakpoint: string,
    prefix: string,
    result: string[],
    currentPath: string = ''
  ): void {
    for (const [key, value] of Object.entries(tokens)) {
      const path = currentPath ? `${currentPath}-${key}` : key;

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        const token = value as TokenValue;
        if (token.responsive) {
          const responsiveValue = this.getResponsiveValue(token, breakpoint);
          if (responsiveValue !== undefined) {
            const cssVar = `--${prefix}-${path}`.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
            result.push(`${cssVar}: ${responsiveValue};`);
          }
        } else if ('value' in value || '$value' in value) {
          const tokenValue = token.value || token.$value;
          if (tokenValue !== undefined) {
            const cssVar = `--${prefix}-${path}`.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
            result.push(`${cssVar}: ${tokenValue};`);
          }
        } else {
          this.flattenResponsiveTokensRecursive(value as DesignTokens, breakpoint, prefix, result, path);
        }
      }
    }
  }

  private static flattenResponsiveTokensToObject(
    tokens: DesignTokens,
    breakpoint: string,
    result: DesignTokens,
    currentPath: string = ''
  ): void {
    for (const [key, value] of Object.entries(tokens)) {
      const path = currentPath ? `${currentPath}.${key}` : key;

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        const token = value as TokenValue;
        if (token.responsive) {
          const responsiveValue = this.getResponsiveValue(token, breakpoint);
          if (responsiveValue !== undefined) {
            this.setNestedValue(result, path, { value: responsiveValue, type: token.type });
          }
        } else if ('value' in value || '$value' in value) {
          result[path] = value;
        } else {
          this.flattenResponsiveTokensToObject(value as DesignTokens, breakpoint, result, path);
        }
      }
    }
  }

  private static flattenStateTokensRecursive(
    tokens: DesignTokens,
    prefix: string,
    result: string[],
    currentPath: string = ''
  ): void {
    for (const [key, value] of Object.entries(tokens)) {
      const path = currentPath ? `${currentPath}-${key}` : key;

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        const token = value as TokenValue;
        if (token.states) {
          for (const [state, stateValue] of Object.entries(token.states)) {
            if (state !== 'default' && stateValue !== undefined) {
              const cssVar = `--${prefix}-${path}-${state}`.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
              result.push(`.${state} {\n  ${cssVar}: ${stateValue};\n}`);
            }
          }
        } else if ('value' in value || '$value' in value) {
          const tokenValue = token.value || token.$value;
          if (tokenValue !== undefined) {
            const cssVar = `--${prefix}-${path}`.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
            result.push(`${cssVar}: ${tokenValue};`);
          }
        } else {
          this.flattenStateTokensRecursive(value as DesignTokens, prefix, result, path);
        }
      }
    }
  }

  private static flattenStateTokensToObject(
    tokens: DesignTokens,
    state: string,
    result: DesignTokens,
    currentPath: string = ''
  ): void {
    for (const [key, value] of Object.entries(tokens)) {
      const path = currentPath ? `${currentPath}.${key}` : key;

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        const token = value as TokenValue;
        if (token.states) {
          const stateValue = this.getStateValue(token, state);
          if (stateValue !== undefined) {
            this.setNestedValue(result, path, { value: stateValue, type: token.type });
          }
        } else if ('value' in value || '$value' in value) {
          result[path] = value;
        } else {
          this.flattenStateTokensToObject(value as DesignTokens, state, result, path);
        }
      }
    }
  }

  private static setNestedValue(obj: DesignTokens, path: string, value: TokenValue): void {
    const parts = path.split('.');
    let current: DesignTokens = obj;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!(part in current)) {
        current[part] = {};
      }
      current = current[part] as DesignTokens;
    }

    current[parts[parts.length - 1]] = value;
  }
}

