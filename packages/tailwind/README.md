# @tokiforge/tailwind

**Tailwind CSS integration for TokiForge design tokens. Generate Tailwind configuration from design tokens and keep your design system in sync.**

Tailwind CSS integration for TokiForge design tokens (v1.2.0).

## Installation

```bash
npm install @tokiforge/tailwind@^1.2.0 @tokiforge/core@^1.2.0 tailwindcss
```

## Usage

### Option 1: Generate tailwind.config.js

```bash
npx tokiforge tailwind:generate
```

Or programmatically:

```typescript
import { generateTailwindConfigFile } from '@tokiforge/tailwind';

const config = generateTailwindConfigFile({
  tokensPath: './tokens.json',
  prefix: 'hf',
  useCSSVariables: true,
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
});

// Write to tailwind.config.js
import { writeFileSync } from 'fs';
writeFileSync('tailwind.config.js', config);
```

### Option 2: Use in tailwind.config.js

```javascript
import { generateTailwindConfig } from '@tokiforge/tailwind';

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: generateTailwindConfig({
      tokensPath: './tokens.json',
      prefix: 'hf',
      useCSSVariables: true,
    }).theme.extend,
  },
  plugins: [],
};
```

## Options

- `tokensPath`: Path to your tokens file (JSON or YAML)
- `tokens`: Design tokens object (alternative to tokensPath)
- `prefix`: CSS variable prefix (default: 'hf')
- `useCSSVariables`: Use CSS variables in Tailwind config (default: true)
- `themeMappings`: Custom theme key mappings

## Example

Given tokens.json:

```json
{
  "color": {
    "primary": { "value": "#7C3AED" },
    "secondary": { "value": "#06B6D4" }
  },
  "spacing": {
    "sm": { "value": "8px" },
    "md": { "value": "16px" }
  }
}
```

Generates Tailwind config:

```javascript
{
  theme: {
    extend: {
      colors: {
        primary: 'var(--hf-color-primary)',
        secondary: 'var(--hf-color-secondary)',
      },
      spacing: {
        sm: 'var(--hf-spacing-sm)',
        md: 'var(--hf-spacing-md)',
      },
    },
  },
}
```

Then use in your components:

```jsx
<div className="bg-primary p-md">
  Content
</div>
```

