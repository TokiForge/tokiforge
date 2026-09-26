/**
 * Build-time and analysis tooling for TokiForge. Browser-safe (no `fs`/`yaml`)
 * but intentionally kept out of `@tokiforge/core/runtime` so app bundles that
 * only switch themes stay tiny — including CJS consumers that can't tree-shake.
 *
 * Import from here in build scripts, Storybook, docs sites, or design tooling.
 */
export type {
  SemanticTokenLayer,
  SemanticTokenMapping,
  SemanticResolutionContext,
  SemanticTokenResolution,
  SemanticTokenValidation,
} from './semantic-tokens';

export { BrandManager } from './brand-manager';
export type { BrandDefinition, BrandMatrixOptions } from './brand-manager';
export { ComponentTheming } from './component-theming';
export { pluginManager } from './plugin-manager';
export { ResponsiveTokens } from './responsive-tokens';
export { SemanticTokenManager } from './semantic-tokens';
export { TokenVersioning } from './token-versioning';
export { TokenAnalytics } from './token-analytics';
export { AnalyticsReporter } from './analytics-reporter';
export type { AnalyticsReport, TrendDataPoint, ComparisonReport, ExportFormat } from './analytics-reporter';
export { IDESupport } from './ide-support';
export { TokenRegistry } from './token-registry';
export { SSRUtils } from './ssr-utils';
export type { SSRThemeOptions, CriticalCSSOptions } from './ssr-utils';
export { IOSExporter, AndroidExporter, ReactNativeExporter, PlatformExporter } from './platform-exporters';
export type {
  IOSExportOptions,
  AndroidExportOptions,
  ReactNativeExportOptions,
  PlatformExporterOptions,
} from './platform-exporters';
