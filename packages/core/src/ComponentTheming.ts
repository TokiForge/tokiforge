import type { DesignTokens, TokenValue, ComponentTheme } from './types';

export class ComponentTheming {
  private componentThemes: Map<string, ComponentTheme> = new Map();

  registerComponentTheme(theme: ComponentTheme): void {
    this.componentThemes.set(theme.name, theme);
  }

  getComponentTheme(componentName: string): ComponentTheme | undefined {
    return this.componentThemes.get(componentName);
  }

  getScopedTokens(componentName: string, globalTokens: DesignTokens): DesignTokens {
    const componentTheme = this.componentThemes.get(componentName);
    if (!componentTheme) {
      return this.extractComponentTokens(globalTokens, componentName);
    }

    return this.mergeTokens(globalTokens, componentTheme.tokens, componentTheme.scope);
  }

  extractComponentTokens(tokens: DesignTokens, componentName: string): DesignTokens {
    const componentTokens: DesignTokens = {};

    const traverse = (obj: DesignTokens, target: DesignTokens): void => {
      for (const key in obj) {
        const value = obj[key];

        if (value && typeof value === 'object' && !Array.isArray(value)) {
          if (this.isTokenValue(value)) {
            const token = value as TokenValue;
            if (token.component === componentName || token.scope === componentName) {
              target[key] = value;
            }
          } else {
            const nested: DesignTokens = {};
            traverse(value as DesignTokens, nested);
            if (Object.keys(nested).length > 0) {
              target[key] = nested;
            }
          }
        }
      }
    };

    traverse(tokens, componentTokens);
    return componentTokens;
  }

  applyComponentTheme(
    componentName: string,
    selector: string,
    prefix: string = 'hf'
  ): string {
    const componentTheme = this.componentThemes.get(componentName);
    if (!componentTheme) {
      return '';
    }

    return this.tokensToCSS(componentTheme.tokens, selector, prefix, componentTheme.scope);
  }

  mergeTokens(
    globalTokens: DesignTokens,
    componentTokens: DesignTokens,
    scope?: string
  ): DesignTokens {
    const merged = JSON.parse(JSON.stringify(globalTokens));

    const applyComponentTokens = (
      target: DesignTokens,
      source: DesignTokens,
      currentScope?: string
    ): void => {
      for (const key in source) {
        const sourceValue = source[key];

        if (sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue)) {
          if (this.isTokenValue(sourceValue)) {
            const token = sourceValue as TokenValue;
            if (!target[key]) {
              target[key] = {};
            }
            (target[key] as TokenValue) = {
              ...token,
              scope: currentScope || scope,
            };
          } else {
            if (!target[key]) {
              target[key] = {};
            }
            applyComponentTokens(
              target[key] as DesignTokens,
              sourceValue as DesignTokens,
              currentScope || scope
            );
          }
        }
      }
    };

    applyComponentTokens(merged, componentTokens);
    return merged;
  }

  private isTokenValue(value: any): value is TokenValue {
    return (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      ('value' in value || '$value' in value || '$alias' in value || 'component' in value || 'scope' in value)
    );
  }

  private tokensToCSS(
    tokens: DesignTokens,
    selector: string,
    prefix: string,
    scope?: string
  ): string {
    const cssVars: string[] = [];
    const scopePrefix = scope ? `${scope}-` : '';

    const traverse = (obj: DesignTokens, path: string = ''): void => {
      for (const key in obj) {
        const currentPath = path ? `${path}-${key}` : key;
        const value = obj[key];

        if (value && typeof value === 'object' && !Array.isArray(value)) {
          if (this.isTokenValue(value)) {
            const token = value as TokenValue;
            const tokenValue = token.value || token.$value;
            if (tokenValue && typeof tokenValue !== 'object') {
              cssVars.push(`  --${prefix}-${scopePrefix}${currentPath}: ${tokenValue};`);
            }
          } else {
            traverse(value as DesignTokens, currentPath);
          }
        }
      }
    };

    traverse(tokens);

    return `${selector} {\n${cssVars.join('\n')}\n}`;
  }

  listComponents(): string[] {
    return Array.from(this.componentThemes.keys());
  }

  clear(): void {
    this.componentThemes.clear();
  }
}

