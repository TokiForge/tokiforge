import type { ComponentTheme, DesignTokens } from './types';
import { TokenExporter } from './token-exporter';

type TokenNode = Record<string, unknown>;

export class ComponentTheming {
  private readonly themes: Map<string, ComponentTheme> = new Map();

  registerComponentTheme(theme: ComponentTheme): void {
    this.themes.set(theme.name, theme);
  }

  getScopedTokens(componentName: string, globalTokens: DesignTokens): DesignTokens {
    const theme = this.themes.get(componentName);
    if (!theme) {
      return {};
    }

    // Merge component tokens with global tokens, scoping component tokens
    const scoped: DesignTokens = { ...globalTokens };
    
    const scopePath = theme.scope.split('.');
    let current = scoped as TokenNode;
    for (let i = 0; i < scopePath.length - 1; i++) {
      const part = scopePath[i];
      if (!current[part] || typeof current[part] !== 'object') {
        current[part] = {};
      }
      current = current[part] as TokenNode;
    }
    current[scopePath[scopePath.length - 1]] = theme.tokens;

    return scoped;
  }

  applyComponentTheme(componentName: string, selector: string, prefix = 'hf'): string {
    const theme = this.themes.get(componentName);
    if (!theme) {
      return '';
    }

    return TokenExporter.exportCSS(theme.tokens, { selector, prefix });
  }
}
