import type { DesignTokens, Plugin, PluginOptions } from './types';

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

  export(tokens: DesignTokens, pluginName: string, options?: PluginOptions): string {
    const plugin = this.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin "${pluginName}" not found`);
    }

    if (!plugin.exporter) {
      throw new Error(`Plugin "${pluginName}" does not have an exporter`);
    }

    return plugin.exporter(tokens, options);
  }

  validate(tokens: DesignTokens, pluginName: string): { valid: boolean; errors: string[] } {
    const plugin = this.get(pluginName);
    if (!plugin) {
      return { valid: false, errors: [`Plugin "${pluginName}" not found`] };
    }

    if (!plugin.validator) {
      return { valid: true, errors: [] };
    }

    return plugin.validator(tokens);
  }

  format(tokens: DesignTokens, pluginName: string, options?: PluginOptions): DesignTokens {
    const plugin = this.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin "${pluginName}" not found`);
    }

    if (!plugin.formatter) {
      return tokens;
    }

    return plugin.formatter(tokens, options);
  }

  validateAll(tokens: DesignTokens): Map<string, { valid: boolean; errors: string[] }> {
    const results = new Map<string, { valid: boolean; errors: string[] }>();

    for (const [name, plugin] of this.plugins.entries()) {
      if (plugin.validator) {
        results.set(name, plugin.validator(tokens));
      } else {
        results.set(name, { valid: true, errors: [] });
      }
    }

    return results;
  }

  clear(): void {
    this.plugins.clear();
  }
}

export const pluginManager = new PluginManager();

