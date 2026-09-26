/**
 * Browser-safe TokiForge runtime: theme switching, CSS variable export,
 * color and accessibility utilities. This is the entry app bundles should
 * import — it contains no Node modules and none of the build-time tooling.
 *
 * Analysis/build-time helpers (analytics, platform exporters, SSR helpers,
 * registry, versioning, semantic layers) live in `@tokiforge/core/tools`.
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
export { ColorUtils } from './color-utils';
export { AccessibilityUtils } from './accessibility-utils';
