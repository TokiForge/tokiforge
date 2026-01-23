import type { DesignTokens } from './types';

/**
 * Semantic token layer configuration
 * Maps semantic tokens to primitive tokens
 */
export interface SemanticTokenLayer {
  name: string;
  description?: string;
  tokens: {
    [semanticName: string]: string | SemanticTokenMapping;
  };
  inherit?: string[]; // Layer names to inherit from
}

/**
 * Semantic token mapping with inheritance
 */
export interface SemanticTokenMapping {
  $resolve: string; // Reference to primitive token (e.g., "color.gray.100")
  $condition?: string[]; // Conditions this applies to (e.g., ["dark", "high-contrast"])
  $fallback?: string; // Fallback if primary resolves to undefined
}

/**
 * Resolution context for semantic token lookup
 */
export interface SemanticResolutionContext {
  theme?: string;
  condition?: string;
  mode?: 'light' | 'dark';
  contrast?: 'normal' | 'high';
}

/**
 * Semantic token resolution result
 */
export interface SemanticTokenResolution {
  semanticName: string;
  primitiveToken: string;
  primitiveValue: string | number;
  layer: string;
  resolved: boolean;
  chain: string[]; // Resolution chain for debugging
}

/**
 * Semantic token validation result
 */
export interface SemanticTokenValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
  resolutions: Map<string, SemanticTokenResolution>;
}

/**
 * Enhanced semantic token system with layer resolution and inheritance
 */
export class SemanticTokenManager {
  private layers: Map<string, SemanticTokenLayer> = new Map();
  private primitiveTokens: DesignTokens;
  private resolutionCache: Map<string, SemanticTokenResolution> = new Map();

  constructor(primitiveTokens: DesignTokens) {
    this.primitiveTokens = primitiveTokens;
  }

  /**
   * Register a semantic token layer
   */
  registerLayer(layer: SemanticTokenLayer): void {
    if (!layer.name) {
      throw new Error('Semantic layer must have a name');
    }
    this.layers.set(layer.name, layer);
    this.resolutionCache.clear(); // Clear cache when structure changes
  }

  /**
   * Get all registered layers
   */
  getLayers(): SemanticTokenLayer[] {
    return Array.from(this.layers.values());
  }

  /**
   * Get a specific layer
   */
  getLayer(name: string): SemanticTokenLayer | undefined {
    return this.layers.get(name);
  }

  /**
   * Resolve inheritance chain for a layer
   */
  private resolveInheritanceChain(layerName: string): SemanticTokenLayer[] {
    const chain: SemanticTokenLayer[] = [];
    const visited = new Set<string>();

    const visit = (name: string): void => {
      if (visited.has(name)) {
        return; // Prevent circular dependencies
      }
      visited.add(name);

      const layer = this.layers.get(name);
      if (!layer) {
        return;
      }

      // Add inherited layers first (bottom of cascade)
      if (layer.inherit) {
        for (const parentName of layer.inherit) {
          visit(parentName);
        }
      }

      // Add current layer
      chain.push(layer);
    };

    visit(layerName);
    return chain;
  }

  /**
   * Merge semantic tokens from inheritance chain
   */
  private mergeInheritedTokens(layerName: string): Record<string, SemanticTokenMapping> {
    const chain = this.resolveInheritanceChain(layerName);
    const merged: Record<string, SemanticTokenMapping> = {};

    for (const layer of chain) {
      for (const [key, value] of Object.entries(layer.tokens)) {
        merged[key] = typeof value === 'string' ? { $resolve: value } : value;
      }
    }

    return merged;
  }

  /**
   * Get value from primitive tokens by path
   */
  private getPrimitiveValue(path: string): string | number | undefined {
    const parts = path.split('.');
    let current: any = this.primitiveTokens;

    for (const part of parts) {
      if (current && typeof current === 'object') {
        current = current[part];
      } else {
        return undefined;
      }
    }

    if (current && typeof current === 'object' && 'value' in current) {
      return current.value;
    }

    return current;
  }

  /**
   * Resolve a semantic token to its primitive value
   */
  resolveSemantic(
    semanticName: string,
    layerName: string,
    context?: SemanticResolutionContext
  ): SemanticTokenResolution {
    const cacheKey = `${layerName}:${semanticName}:${JSON.stringify(context || {})}`;

    if (this.resolutionCache.has(cacheKey)) {
      return this.resolutionCache.get(cacheKey)!;
    }

    const chain: string[] = [];
    const mergedTokens = this.mergeInheritedTokens(layerName);
    const mapping = mergedTokens[semanticName];

    if (!mapping) {
      const result: SemanticTokenResolution = {
        semanticName,
        primitiveToken: '',
        primitiveValue: '',
        layer: layerName,
        resolved: false,
        chain,
      };
      this.resolutionCache.set(cacheKey, result);
      return result;
    }

    // Check if mapping has conditions
    const resolveToken = typeof mapping === 'string' ? mapping : mapping.$resolve;
    const conditions = typeof mapping === 'string' ? [] : mapping.$condition || [];

    chain.push(resolveToken);

    // Check context conditions
    if (conditions.length > 0 && context) {
      const contextMatches = this.checkContextMatch(conditions, context);
      if (!contextMatches) {
        const fallback =
          typeof mapping !== 'string' && mapping.$fallback ? mapping.$fallback : undefined;

        if (fallback) {
          chain.push(fallback);
          const primitiveValue = this.getPrimitiveValue(fallback);
          const result: SemanticTokenResolution = {
            semanticName,
            primitiveToken: fallback,
            primitiveValue: primitiveValue ?? '',
            layer: layerName,
            resolved: primitiveValue !== undefined,
            chain,
          };
          this.resolutionCache.set(cacheKey, result);
          return result;
        }
      }
    }

    const primitiveValue = this.getPrimitiveValue(resolveToken);

    // Use fallback if primary reference can't be resolved
    if (primitiveValue === undefined) {
      const fallback =
        typeof mapping !== 'string' && mapping.$fallback ? mapping.$fallback : undefined;

      if (fallback) {
        chain.push(fallback);
        const fallbackValue = this.getPrimitiveValue(fallback);
        const result: SemanticTokenResolution = {
          semanticName,
          primitiveToken: fallback,
          primitiveValue: fallbackValue ?? '',
          layer: layerName,
          resolved: fallbackValue !== undefined,
          chain,
        };
        this.resolutionCache.set(cacheKey, result);
        return result;
      }
    }

    const result: SemanticTokenResolution = {
      semanticName,
      primitiveToken: resolveToken,
      primitiveValue: primitiveValue ?? '',
      layer: layerName,
      resolved: primitiveValue !== undefined,
      chain,
    };

    this.resolutionCache.set(cacheKey, result);
    return result;
  }

  /**
   * Check if context matches conditions
   */
  private checkContextMatch(conditions: string[], context: SemanticResolutionContext): boolean {
    if (!conditions || conditions.length === 0) {
      return true;
    }

    for (const condition of conditions) {
      if (condition === context.theme) return true;
      if (condition === context.mode) return true;
      if (condition === context.contrast) return true;
      if (condition === context.condition) return true;
    }

    return false;
  }

  /**
   * Resolve all semantic tokens in a layer
   */
  resolveLayer(
    layerName: string,
    context?: SemanticResolutionContext
  ): Map<string, SemanticTokenResolution> {
    const results = new Map<string, SemanticTokenResolution>();
    const mergedTokens = this.mergeInheritedTokens(layerName);

    for (const semanticName of Object.keys(mergedTokens)) {
      const resolution = this.resolveSemantic(semanticName, layerName, context);
      results.set(semanticName, resolution);
    }

    return results;
  }

  /**
   * Validate semantic token structure
   */
  validate(layerName?: string): SemanticTokenValidation {
    const errors: string[] = [];
    const warnings: string[] = [];
    const resolutions = new Map<string, SemanticTokenResolution>();

    const layersToValidate = layerName
      ? this.layers.has(layerName)
        ? [layerName]
        : []
      : Array.from(this.layers.keys());

    for (const name of layersToValidate) {
      const layer = this.layers.get(name)!;

      // Validate layer structure
      if (!layer.tokens || typeof layer.tokens !== 'object') {
        errors.push(`Layer "${name}" has invalid tokens structure`);
        continue;
      }

      // Check for circular inheritance
      if (layer.inherit) {
        const visited = new Set<string>();
        const checkCircular = (layerName: string): boolean => {
          if (visited.has(layerName)) {
            return true; // Circular detected
          }
          visited.add(layerName);

          const currentLayer = this.layers.get(layerName);
          if (currentLayer?.inherit) {
            for (const parent of currentLayer.inherit) {
              if (checkCircular(parent)) {
                return true;
              }
            }
          }
          return false;
        };

        if (checkCircular(name)) {
          errors.push(`Layer "${name}" has circular inheritance`);
          continue;
        }
      }

      // Validate token resolutions
      const mergedTokens = this.mergeInheritedTokens(name);
      for (const [semanticName, mapping] of Object.entries(mergedTokens)) {
        const resolveToken = typeof mapping === 'string' ? mapping : mapping.$resolve;

        const resolution = this.resolveSemantic(semanticName, name);
        resolutions.set(`${name}:${semanticName}`, resolution);

        if (!resolution.resolved) {
          errors.push(
            `Layer "${name}": Semantic token "${semanticName}" resolves to undefined primitive token "${resolveToken}"`
          );
        }

        // Check if fallback exists if specified
        if (typeof mapping !== 'string' && mapping.$fallback) {
          const fallbackValue = this.getPrimitiveValue(mapping.$fallback);
          if (fallbackValue === undefined) {
            warnings.push(
              `Layer "${name}": Semantic token "${semanticName}" has undefined fallback "${mapping.$fallback}"`
            );
          }
        }
      }

      // Check for inherited layers that don't exist
      if (layer.inherit) {
        for (const parent of layer.inherit) {
          if (!this.layers.has(parent)) {
            errors.push(
              `Layer "${name}" inherits from non-existent layer "${parent}"`
            );
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      resolutions,
    };
  }

  /**
   * Get semantic token documentation
   */
  getDocumentation(layerName: string): Record<string, any> {
    const layer = this.layers.get(layerName);
    if (!layer) {
      return {};
    }

    const mergedTokens = this.mergeInheritedTokens(layerName);
    const docs: Record<string, any> = {};

    for (const [semanticName, mapping] of Object.entries(mergedTokens)) {
      const resolution = this.resolveSemantic(semanticName, layerName);

      const mappingObj =
        typeof mapping !== 'string'
          ? (mapping as unknown as Record<string, unknown>)
          : null;

      docs[semanticName] = {
        name: semanticName,
        primitiveToken: resolution.primitiveToken,
        primitiveValue: resolution.primitiveValue,
        resolved: resolution.resolved,
        chain: resolution.chain,
        description:
          mappingObj && '$description' in mappingObj
            ? String(mappingObj.$description)
            : undefined,
        conditions:
          mappingObj && '$condition' in mappingObj
            ? mappingObj.$condition
            : undefined,
        fallback:
          mappingObj && '$fallback' in mappingObj ? mappingObj.$fallback : undefined,
      };
    }

    return docs;
  }

  /**
   * Export semantic tokens as resolved values
   */
  export(layerName: string, format: 'json' | 'css' = 'json'): string {
    const mergedTokens = this.mergeInheritedTokens(layerName);
    const exported: Record<string, any> = {};

    for (const [semanticName, _mapping] of Object.entries(mergedTokens)) {
      const resolution = this.resolveSemantic(semanticName, layerName);
      exported[semanticName] = {
        value: resolution.primitiveValue,
        resolved: resolution.primitiveToken,
      };
    }

    if (format === 'css') {
      return this.exportAsCSS(layerName, exported);
    }

    return JSON.stringify(exported, null, 2);
  }

  /**
   * Export semantic tokens as CSS variables
   */
  private exportAsCSS(layerName: string, tokens: Record<string, any>): string {
    const lines = [`:root[data-semantic="${layerName}"] {`];

    for (const [semanticName, data] of Object.entries(tokens)) {
      const varName = `--semantic-${semanticName.replace(/\./g, '-')}`;
      lines.push(`  ${varName}: ${data.value};`);
    }

    lines.push('}');
    return lines.join('\n');
  }

  /**
   * Clear resolution cache
   */
  clearCache(): void {
    this.resolutionCache.clear();
  }
}
