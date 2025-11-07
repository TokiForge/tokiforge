import * as fs from 'fs';
import * as path from 'path';

/**
 * Initialize TokiForge in a project
 * Creates default tokens.json and tokiforge.config.json files
 */
export async function initCommand(projectPath: string = process.cwd()): Promise<void> {
  const tokensPath = path.join(projectPath, 'tokens.json');
  const configPath = path.join(projectPath, 'tokiforge.config.json');

  // Default tokens
  const defaultTokens = {
    color: {
      primary: { value: '#7C3AED', type: 'color' },
      accent: { value: '#06B6D4', type: 'color' },
      text: {
        primary: { value: '#1F2937', type: 'color' },
        secondary: { value: '#6B7280', type: 'color' },
      },
      background: {
        default: { value: '#FFFFFF', type: 'color' },
        muted: { value: '#F9FAFB', type: 'color' },
      },
    },
    radius: {
      sm: { value: '4px', type: 'dimension' },
      md: { value: '8px', type: 'dimension' },
      lg: { value: '12px', type: 'dimension' },
    },
    spacing: {
      xs: { value: '4px', type: 'dimension' },
      sm: { value: '8px', type: 'dimension' },
      md: { value: '16px', type: 'dimension' },
      lg: { value: '24px', type: 'dimension' },
      xl: { value: '32px', type: 'dimension' },
    },
  };

  const defaultConfig = {
    input: './tokens.json',
    output: {
      css: './dist/tokens.css',
      js: './dist/tokens.js',
      ts: './dist/tokens.ts',
      scss: './dist/tokens.scss',
    },
    themes: [
      {
        name: 'light',
        tokens: defaultTokens,
      },
      {
        name: 'dark',
        tokens: {
          ...defaultTokens,
          color: {
            ...defaultTokens.color,
            text: {
              primary: { value: '#F8FAFC', type: 'color' },
              secondary: { value: '#CBD5E1', type: 'color' },
            },
            background: {
              default: { value: '#0F172A', type: 'color' },
              muted: { value: '#1E293B', type: 'color' },
            },
          },
        },
      },
    ],
    defaultTheme: 'light',
  };

  if (fs.existsSync(tokensPath)) {
    console.log('tokens.json already exists. Skipping...');
  } else {
    fs.writeFileSync(tokensPath, JSON.stringify(defaultTokens, null, 2));
    console.log('Created tokens.json');
  }

  if (fs.existsSync(configPath)) {
    console.log('tokiforge.config.json already exists. Skipping...');
  } else {
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
    console.log('Created tokiforge.config.json');
  }

  console.log('\nTokiForge initialized successfully!');
  console.log('\nNext steps:');
  console.log('  1. Edit tokens.json to define your design tokens');
  console.log('  2. Run "tokiforge build" to generate token exports');
  console.log('  3. Run "tokiforge dev" to preview your themes');
}

