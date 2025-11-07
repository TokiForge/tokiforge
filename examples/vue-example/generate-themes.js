import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { generateCombinedThemeCSS } from '@tokiforge/vue';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const tokens = JSON.parse(
  readFileSync(join(__dirname, 'src/tokens.json'), 'utf-8')
);

const themeConfig = {
  themes: [
    {
      name: 'light',
      tokens: {
        ...tokens,
        color: {
          ...tokens.color,
          text: {
            primary: { value: '#1E293B', type: 'color' },
            secondary: { value: '#64748B', type: 'color' },
          },
        },
      },
    },
    {
      name: 'dark',
      tokens: {
        ...tokens,
        color: {
          ...tokens.color,
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

const css = generateCombinedThemeCSS(themeConfig, {
  bodyClassPrefix: 'theme',
  prefix: 'hf',
});

const outputPath = join(__dirname, 'src/themes/generated.css');
writeFileSync(outputPath, css, 'utf-8');

console.log('Generated theme CSS:', outputPath);
console.log('File size:', (css.length / 1024).toFixed(2), 'KB');

