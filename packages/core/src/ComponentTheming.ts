import type { DesignTokens, ComponentTheme } from './types';

export class ComponentTheming {
  private themes: Map<string, ComponentTheme> = new Map();

  registerComponentTheme(theme: ComponentTheme): void {
    if (!theme.name) {
      throw new Error('Component theme must have a name');
    }
    this.themes.set(theme.name, theme);
  }

  getComponentTheme(componentName: string): ComponentTheme | undefined {
    return this.themes.get(componentName);
  }

  getScopedTokens(componentName: string, globalTokens: DesignTokens): DesignTokens {
    const componentTheme = this.getComponentTheme(componentName);
    if (!componentTheme) {
      return {};
    }

    return this.mergeTokens(globalTokens, componentTheme.tokens, componentTheme.scope);
  }

  extractComponentTokens(tokens: DesignTokens, componentName: string): DesignTokens {
    const componentTokens: DesignTokens = {};
    
    for (const [key, value] of Object.entries(tokens)) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        const token = value as { component?: string; scope?: string };
        if (token.component === componentName || token.scope === componentName) {
          componentTokens[key] = value;
        }
      }
    }

    return componentTokens;
  }

  applyComponentTheme(componentName: string, selector: string, prefix?: string): string {
    const componentTheme = this.getComponentTheme(componentName);
    if (!componentTheme) {
      return '';
    }

    const cssVars: string[] = [];
    this.flattenTokens(componentTheme.tokens, prefix || 'hf', cssVars);

    if (cssVars.length === 0) {
      return `${selector} {}`;
    }

    return `${selector} {\n  ${cssVars.join('\n  ')}\n}`;
  }

  mergeTokens(globalTokens: DesignTokens, componentTokens: DesignTokens, scope?: string): DesignTokens {
    const merged = JSON.parse(JSON.stringify(globalTokens)) as DesignTokens;

    for (const [key, value] of Object.entries(componentTokens)) {
      if (scope) {
        const scopedKey = `${scope}.${key}`;
        merged[scopedKey] = value;
      } else {
        merged[key] = value;
      }
    }

    return merged;
  }

  listComponents(): string[] {
    return Array.from(this.themes.keys());
  }

  clear(): void {
    this.themes.clear();
  }

  private flattenTokens(tokens: DesignTokens, prefix: string, result: string[], currentPath: string = ''): void {
    for (const [key, value] of Object.entries(tokens)) {
      const path = currentPath ? `${currentPath}-${key}` : key;

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        if ('value' in value || '$value' in value) {
          const tokenValue = (value as { value?: string | number; $value?: string | number }).value ||
            (value as { $value?: string | number }).$value;
          if (tokenValue !== undefined && tokenValue !== null) {
            const cssVar = `--${prefix}-${path}`.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
            result.push(`${cssVar}: ${tokenValue};`);
          }
        } else {
          this.flattenTokens(value as DesignTokens, prefix, result, path);
        }
      }
    }
  }
}

