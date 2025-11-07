import type { DesignTokens, Plugin } from './types';

export class PluginManager {
  private plugins: Map<string, Plugin> = new Map();

  register(plugin: Plugin): void {
    if (!plugin.name) {
      throw new Error('Plugin must have a name');
    }
    this.plugins.set(plugin.name, plugin);
  }

  unregister(pluginName: string): boolean {
    return this.plugins.delete(pluginName);
  }

  get(pluginName: string): Plugin | undefined {
    return this.plugins.get(pluginName);
  }

  list(): string[] {
    return Array.from(this.plugins.keys());
  }

  export(tokens: DesignTokens, pluginName: string, options?: any): string {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin "${pluginName}" not found`);
    }
    if (!plugin.exporter) {
      throw new Error(`Plugin "${pluginName}" does not have an exporter`);
    }
    return plugin.exporter(tokens, options);
  }

  validate(tokens: DesignTokens, pluginName: string): { valid: boolean; errors: string[] } {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin "${pluginName}" not found`);
    }
    if (!plugin.validator) {
      throw new Error(`Plugin "${pluginName}" does not have a validator`);
    }
    return plugin.validator(tokens);
  }

  format(tokens: DesignTokens, pluginName: string, options?: any): DesignTokens {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin "${pluginName}" not found`);
    }
    if (!plugin.formatter) {
      throw new Error(`Plugin "${pluginName}" does not have a formatter`);
    }
    return plugin.formatter(tokens, options);
  }

  validateAll(tokens: DesignTokens): Map<string, { valid: boolean; errors: string[] }> {
    const results = new Map<string, { valid: boolean; errors: string[] }>();

    for (const [name, plugin] of this.plugins.entries()) {
      if (plugin.validator) {
        try {
          results.set(name, plugin.validator(tokens));
        } catch (error: any) {
          results.set(name, {
            valid: false,
            errors: [error.message],
          });
        }
      }
    }

    return results;
  }

  clear(): void {
    this.plugins.clear();
  }
}

export const pluginManager = new PluginManager();

