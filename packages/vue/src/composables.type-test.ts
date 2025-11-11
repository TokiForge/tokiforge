import { provideTheme, useTheme, type ExtractTokenType } from './composables';
import type { DesignTokens, TokenValue, ThemeConfig } from '@tokiforge/core';
interface TestDesignTokens extends DesignTokens {
  color: {
    primary: TokenValue;
    secondary: TokenValue;
  };
  radius: {
    sm: TokenValue;
    md: TokenValue;
    lg: TokenValue;
  };
}

interface SimpleTokens extends DesignTokens {
  color: {
    primary: TokenValue;
  };
}

const lightTokens: TestDesignTokens = {
  color: {
    primary: { value: '#7C3AED', type: 'color' },
    secondary: { value: '#06B6D4', type: 'color' },
  },
  radius: {
    sm: { value: '4px', type: 'dimension' },
    md: { value: '8px', type: 'dimension' },
    lg: { value: '12px', type: 'dimension' },
  },
};

const darkTokens: TestDesignTokens = {
  color: {
    primary: { value: '#A78BFA', type: 'color' },
    secondary: { value: '#22D3EE', type: 'color' },
  },
  radius: {
    sm: { value: '4px', type: 'dimension' },
    md: { value: '8px', type: 'dimension' },
    lg: { value: '12px', type: 'dimension' },
  },
};

function testTypeInference() {
  const config = {
    themes: [
      { name: 'light', tokens: lightTokens },
      { name: 'dark', tokens: darkTokens },
    ],
    defaultTheme: 'light' as const,
  };

  const context = provideTheme(config);
  
  const primary: string = context.tokens.value.color.primary.value;
  const radius: string = context.tokens.value.radius.lg.value;
  const _tokens: TestDesignTokens = context.tokens.value;
  
  return { primary, radius, _tokens };
}

function testExplicitType() {
  type ThemeContextType = ReturnType<typeof useTheme<TestDesignTokens>>;
  type TokensType = ThemeContextType['tokens']['value'];
  const _test: TokensType extends TestDesignTokens ? true : false = true;
  
  return _test;
}

function testExtractTokenType() {
  type TestThemeConfig = {
    themes: Array<{ name: string; tokens: TestDesignTokens }>;
    defaultTheme?: string;
  };
  
  type Extracted = ExtractTokenType<TestThemeConfig & ThemeConfig>;
  const _test: Extracted extends TestDesignTokens ? true : false = true;
  
  return _test;
}

function testBackwardCompatibility() {
  const config: ThemeConfig = {
    themes: [
      { name: 'light', tokens: lightTokens },
      { name: 'dark', tokens: darkTokens },
    ],
    defaultTheme: 'light',
  };
  
  const context = provideTheme(config);
  const _tokens: DesignTokens = context.tokens.value;
  const color = context.tokens.value.color;
  
  return { _tokens, color };
}

function testTypeSafety() {
  const config = {
    themes: [
      { name: 'light', tokens: lightTokens },
      { name: 'dark', tokens: darkTokens },
    ],
    defaultTheme: 'light',
  };
  
  const context = provideTheme(config);
  const primary = context.tokens.value.color.primary;
  const radius = context.tokens.value.radius.lg;
  
  return { primary, radius };
}

function testDifferentTokenTypes() {
  const simpleTokens: SimpleTokens = {
    color: {
      primary: { value: '#000000', type: 'color' },
    },
  };
  
  const simpleConfig = {
    themes: [
      { name: 'default', tokens: simpleTokens },
    ],
    defaultTheme: 'default',
  };
  
  const context = provideTheme(simpleConfig);
  const primary = context.tokens.value.color.primary.value;
  
  return { primary };
}

export {
  testTypeInference,
  testExplicitType,
  testExtractTokenType,
  testBackwardCompatibility,
  testTypeSafety,
  testDifferentTokenTypes,
};

