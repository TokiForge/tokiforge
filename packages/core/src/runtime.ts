/**
 * Browser-safe TokiForge surface: theme runtime, CSS export, color/a11y utils.
 * Prefer this entry in app bundles so Node modules (`fs`, `yaml`) stay out.
 */
export type {
  DesignTokens,
  TokenValue,
  TokenState,
  TokenResponsive,
  TokenVersion,
  Theme,
  ThemeConfig,
  TokenExportOptions,
  ColorRGB,
  ColorHSL,
  ColorOKLCH,
  ComponentTheme,
  Plugin,
  PluginOptions,
  AccessibilityMetrics,
  Breakpoint,
  DiffResult,
  DiffOptions,
  MigrationResult,
  VersionValidationResult,
  HoverInfo,
  Completion,
  Definition,
  RegistryEntry,
  RegistryConfig,
} from './types';

export type {
  SemanticTokenLayer,
  SemanticTokenMapping,
  SemanticResolutionContext,
  SemanticTokenResolution,
  SemanticTokenValidation,
} from './semantic-tokens';

export {
  TokenError,
  ValidationError,
  ParseError,
  ThemeError,
  ExportError,
} from './types';

export { TokenExporter, escapeCSSValue } from './token-exporter';
export { ThemeRuntime } from './theme-runtime';
export { ThemeController } from './theme-controller';
export type { ThemeControllerOptions, ThemeSnapshot } from './theme-controller';
export { BrandManager } from './brand-manager';
export type { BrandDefinition, BrandMatrixOptions } from './brand-manager';
export { ColorUtils } from './color-utils';
export { AccessibilityUtils } from './accessibility-utils';
export { ComponentTheming } from './component-theming';
export { pluginManager } from './plugin-manager';
export { ResponsiveTokens } from './responsive-tokens';
export { SemanticTokenManager } from './semantic-tokens';
export { TokenVersioning } from './token-versioning';
export { TokenAnalytics } from './token-analytics';
export { AnalyticsReporter } from './analytics-reporter';
export { IDESupport } from './ide-support';
export { TokenRegistry } from './token-registry';
export { SSRUtils } from './ssr-utils';
export type { SSRThemeOptions, CriticalCSSOptions } from './ssr-utils';
export type { AnalyticsReport, TrendDataPoint, ComparisonReport, ExportFormat } from './analytics-reporter';
export { IOSExporter, AndroidExporter, ReactNativeExporter, PlatformExporter } from './platform-exporters';
export type {
  IOSExportOptions,
  AndroidExportOptions,
  ReactNativeExportOptions,
  PlatformExporterOptions,
} from './platform-exporters';
