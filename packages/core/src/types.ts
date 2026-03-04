export interface DesignTokens {
  [key: string]: TokenValue | DesignTokens | TokenValue[] | DesignTokens[];
}

export interface TokenValue {
  value: string | number | TokenState | TokenResponsive;
  type?: 'color' | 'dimension' | 'fontFamily' | 'fontWeight' | 'duration' | 'custom';
  description?: string;
  version?: TokenVersion;
  deprecated?: boolean;
  states?: TokenState;
  responsive?: TokenResponsive;
  component?: string;
  scope?: string;
}

export interface TokenState {
  default?: string | number;
  hover?: string | number;
  active?: string | number;
  focus?: string | number;
  disabled?: string | number;
  [key: string]: string | number | undefined;
}

export interface TokenResponsive {
  default?: string | number;
  sm?: string | number;
  md?: string | number;
  lg?: string | number;
  xl?: string | number;
  [key: string]: string | number | undefined;
}

export interface TokenVersion {
  major: number;
  minor: number;
  patch: number;
  deprecated?: boolean;
  migration?: string;
}

export interface Theme {
  name: string;
  tokens: DesignTokens;
}

export interface ThemeConfig {
  themes: Theme[];
  defaultTheme?: string;
}

export interface TokenExportOptions {
  format: 'css' | 'js' | 'ts' | 'scss' | 'json';
  selector?: string;
  prefix?: string;
  variables?: boolean;
}

export interface TokenParserOptions {
  validate?: boolean;
  expandReferences?: boolean;
}

export interface ColorRGB {
  r: number;
  g: number;
  b: number;
}

export interface ColorHSL {
  h: number;
  s: number;
  l: number;
}

export interface ComponentTheme {
  name: string;
  scope: string;
  tokens: DesignTokens;
}

export interface PluginOptions {
  [key: string]: any;
}

/**
 * Plugin interface with optional typed options.
 * Use Plugin<TOptions> for type-safe exporter/validator options.
 * optionsSchema can be used by CLI/IDE to validate plugin options (e.g. JSON Schema).
 */
export interface Plugin<TOptions = PluginOptions> {
  name: string;
  exporter?: (tokens: DesignTokens, options?: TOptions) => string;
  validator?: (tokens: DesignTokens, options?: TOptions) => boolean | {
    valid: boolean;
    errors: string[];
  };
  /** Optional schema for plugin options (e.g. JSON Schema) for validation by CLI/IDE */
  optionsSchema?: Record<string, unknown>;
}

export interface AccessibilityMetrics {
  ratio: number;
  wcagAA: boolean;
  wcagAAA: boolean;
  level: 'pass' | 'fail' | 'large-text';
}

export interface Breakpoint {
  name: string;
  min?: number;
  max?: number;
}

export interface DiffResult {
  added: string[];
  removed: string[];
  changed: Array<{
    path: string;
    oldValue: any;
    newValue: any;
  }>;
  matches: string[];
}

export interface DiffOptions {
  tolerance?: number;
  ignorePaths?: string[];
}

export interface MigrationResult {
  success: boolean;
  migrated: number;
  errors: string[];
}

export interface VersionValidationResult {
  valid: boolean;
  deprecated: string[];
  migrations: MigrationResult[];
}

export interface CICDValidationOptions {
  strict?: boolean;
  checkAccessibility?: boolean;
  checkDeprecated?: boolean;
  customRules?: Array<(tokens: DesignTokens) => boolean | {
    valid: boolean;
    error: string;
  }>;
}

export interface CICDValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface HoverInfo {
  path: string;
  value: string | number;
  type?: string;
  description?: string;
}

export interface Completion {
  label: string;
  detail?: string;
  documentation?: string;
}

export interface Definition {
  path: string;
  value: string | number;
  type?: string;
}

export interface RegistryEntry {
  path: string;
  value: TokenValue;
  team?: string;
  version?: string;
  metadata?: Record<string, any>;
}

export interface RegistryConfig {
  teams?: string[];
  defaultVersion?: string;
}

export class TokenError extends Error {
  path?: string;
  constructor(message: string, path?: string) {
    super(message);
    this.name = 'TokenError';
    this.path = path;
  }
}

export class ValidationError extends TokenError {
  constructor(message: string, path?: string) {
    super(message, path);
    this.name = 'ValidationError';
  }
}

export class ParseError extends TokenError {
  constructor(message: string, path?: string) {
    super(message, path);
    this.name = 'ParseError';
  }
}

export class ThemeError extends TokenError {
  constructor(message: string, path?: string) {
    super(message, path);
    this.name = 'ThemeError';
  }
}

export class ExportError extends TokenError {
  constructor(message: string, path?: string) {
    super(message, path);
    this.name = 'ExportError';
  }
}

