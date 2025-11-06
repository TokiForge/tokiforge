export interface TokenValue {
  value: string | number;
  type?: 'color' | 'dimension' | 'fontFamily' | 'fontWeight' | 'duration' | 'custom';
  description?: string;
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

