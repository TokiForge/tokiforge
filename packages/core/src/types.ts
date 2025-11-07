export interface TokenVersion {
  version: string;
  introduced?: string;
  deprecated?: string;
  removed?: string;
  migration?: string;
  replacedBy?: string;
}

export interface TokenState {
  default?: string | number;
  hover?: string | number;
  active?: string | number;
  focus?: string | number;
  disabled?: string | number;
  loading?: string | number;
  [key: string]: string | number | undefined;
}

export interface TokenResponsive {
  default?: string | number;
  sm?: string | number;
  md?: string | number;
  lg?: string | number;
  xl?: string | number;
  '2xl'?: string | number;
  [key: string]: string | number | undefined;
}

export interface TokenValue {
  value: string | number | TokenState | TokenResponsive;
  type?: 'color' | 'dimension' | 'fontFamily' | 'fontWeight' | 'duration' | 'custom';
  description?: string;
  $value?: string | number | TokenState | TokenResponsive;
  $alias?: string;
  version?: TokenVersion;
  deprecated?: boolean;
  states?: TokenState;
  responsive?: TokenResponsive;
  component?: string;
  scope?: string;
  semantic?: {
    category?: 'base' | 'semantic' | 'component';
    purpose?: string;
    role?: string;
  };
}

export interface DesignTokens {
  [key: string]: TokenValue | DesignTokens | TokenValue[] | DesignTokens[];
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
  format?: 'css' | 'js' | 'ts' | 'scss' | 'json';
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

export interface SemanticToken {
  name: string;
  alias: string; // Reference to base token
  category: 'base' | 'semantic' | 'component';
  description?: string;
}

export interface TokenAlias {
  from: string;
  to: string;
  semantic?: boolean;
}

export interface ComponentTheme {
  name: string;
  tokens: DesignTokens;
  scope?: string;
}

export interface Plugin {
  name: string;
  version?: string;
  exporter?: (tokens: DesignTokens, options?: any) => string;
  validator?: (tokens: DesignTokens) => { valid: boolean; errors: string[] };
  formatter?: (tokens: DesignTokens, options?: any) => DesignTokens;
}

export interface AccessibilityMetrics {
  contrastRatio: number;
  wcagAA: boolean;
  wcagAAA: boolean;
  motionSafe: boolean;
  colorBlindSafe: boolean;
}

export interface Breakpoint {
  name: string;
  min?: number;
  max?: number;
}

