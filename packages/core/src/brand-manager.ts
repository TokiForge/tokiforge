import type { DesignTokens, Theme, ThemeConfig } from './types';

type TokenNode = Record<string, unknown>;

export interface BrandDefinition {
  name: string;
  /** Base tokens shared by every mode of this brand */
  tokens?: DesignTokens;
  /** Mode-specific overrides (e.g. light/dark/high-contrast), deep-merged over the brand tokens */
  modes?: Record<string, DesignTokens>;
  /** Inherit another brand's resolved tokens as the base layer */
  extends?: string;
}

export interface BrandMatrixOptions {
  /** Separator between brand and mode in generated theme names (default: '-') */
  separator?: string;
  /** Default theme for the generated config, e.g. 'acme-light' */
  defaultTheme?: string;
}

function isPlainObject(value: unknown): value is TokenNode {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Deep merge token trees; override wins on leaves, objects merge recursively. */
function mergeTokens(base: DesignTokens, override: DesignTokens): DesignTokens {
  const result: TokenNode = { ...(base as TokenNode) };

  for (const key of Object.keys(override as TokenNode)) {
    const baseValue = result[key];
    const overrideValue = (override as TokenNode)[key];

    if (
      isPlainObject(baseValue) &&
      isPlainObject(overrideValue) &&
      !('value' in overrideValue)
    ) {
      result[key] = mergeTokens(baseValue as DesignTokens, overrideValue as DesignTokens);
    } else {
      result[key] = overrideValue;
    }
  }

  return result as DesignTokens;
}

/**
 * Multi-brand theming: define brands (with optional inheritance) and their
 * light/dark/... modes once, then expand the brand x mode matrix into a
 * standard ThemeConfig consumable by ThemeRuntime / ThemeController and every
 * framework adapter.
 *
 * @example
 * const brands = new BrandManager();
 * brands.register({ name: 'acme', tokens: shared, modes: { light, dark } });
 * brands.register({ name: 'globex', extends: 'acme', tokens: globexOverrides, modes: { light, dark } });
 * const config = brands.toThemeConfig({ defaultTheme: 'acme-light' });
 * // themes: acme-light, acme-dark, globex-light, globex-dark
 */
export class BrandManager {
  private readonly brands = new Map<string, BrandDefinition>();

  register(brand: BrandDefinition): void {
    if (!brand.name) {
      throw new Error('Brand must have a name');
    }
    this.brands.set(brand.name, brand);
  }

  getBrands(): string[] {
    return Array.from(this.brands.keys());
  }

  getModes(brandName: string): string[] {
    const brand = this.brands.get(brandName);
    return brand?.modes ? Object.keys(brand.modes) : [];
  }

  /**
   * Resolve a brand (and optional mode) into a single token tree.
   * Merge order: extends chain (outermost first) -> brand tokens -> mode overrides.
   */
  resolve(brandName: string, mode?: string): DesignTokens {
    const brand = this.brands.get(brandName);
    if (!brand) {
      throw new Error(`Brand "${brandName}" not found`);
    }

    let tokens = this.resolveBase(brandName, new Set());

    if (mode) {
      const modeTokens = brand.modes?.[mode];
      if (!modeTokens) {
        throw new Error(`Mode "${mode}" not found on brand "${brandName}"`);
      }
      tokens = mergeTokens(tokens, modeTokens);
    }

    return tokens;
  }

  private resolveBase(brandName: string, seen: Set<string>): DesignTokens {
    if (seen.has(brandName)) {
      throw new Error(`Circular brand inheritance involving "${brandName}"`);
    }
    seen.add(brandName);

    const brand = this.brands.get(brandName);
    if (!brand) {
      throw new Error(`Brand "${brandName}" not found (referenced via extends)`);
    }

    const parent = brand.extends ? this.resolveBase(brand.extends, seen) : {};
    return mergeTokens(parent, brand.tokens ?? {});
  }

  /**
   * Expand every brand x mode combination into a ThemeConfig. Brands without
   * modes produce a single theme named after the brand.
   */
  toThemeConfig(options: BrandMatrixOptions = {}): ThemeConfig {
    const { separator = '-', defaultTheme } = options;
    const themes: Theme[] = [];

    for (const brandName of this.brands.keys()) {
      const modes = this.getModes(brandName);
      if (modes.length === 0) {
        themes.push({ name: brandName, tokens: this.resolve(brandName) });
      } else {
        for (const mode of modes) {
          themes.push({
            name: `${brandName}${separator}${mode}`,
            tokens: this.resolve(brandName, mode),
          });
        }
      }
    }

    if (themes.length === 0) {
      throw new Error('No brands registered');
    }

    return {
      themes,
      defaultTheme: defaultTheme ?? themes[0].name,
    };
  }
}
