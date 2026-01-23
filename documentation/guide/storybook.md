---
title: Storybook Integration | Guide
description: Complete guide to integrating TokiForge design tokens with Storybook. Learn theme switching in stories, token documentation, and visual testing.
---

# Storybook Integration with TokiForge

Integrate TokiForge design tokens with Storybook for interactive documentation and visual testing of themed components.

## Installation

```bash
npm install -D storybook @storybook/react @tokiforge/storybook @tokiforge/core
```

## Basic Setup

### Step 1: Initialize Storybook

```bash
npx storybook@latest init
```

### Step 2: Configure TokiForge Integration

#### `.storybook/main.ts`

```typescript
import type { StorybookConfig } from "@storybook/react-vite";
import { createTokensAddon } from "@tokiforge/storybook";
import { themeConfig } from "../src/config/tokens";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.{js,jsx,ts,tsx}"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    createTokensAddon(themeConfig),
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
};

export default config;
```

### Step 3: Create Preview Configuration

#### `.storybook/preview.tsx`

```typescript
import type { Preview } from "@storybook/react";
import { ThemeProvider } from "@tokiforge/react";
import { themeConfig } from "../src/config/tokens";
import "../src/styles/globals.css";

const preview: Preview = {
  parameters: {
    layout: "fullscreen",
    tokens: {
      config: themeConfig,
      defaultTheme: "light",
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider config={themeConfig}>
        <Story />
      </ThemeProvider>
    ),
  ],
};

export default preview;
```

## Using Design Tokens in Stories

### Basic Story with Theme Support

```typescript
// src/components/Button.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta = {
  title: "Components/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: "Click me",
    variant: "primary",
  },
};

export const Secondary: Story = {
  args: {
    children: "Secondary",
    variant: "secondary",
  },
};

export const Disabled: Story = {
  args: {
    children: "Disabled",
    disabled: true,
  },
};
```

### Token Documentation Story

```typescript
// src/tokens.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Design System/Tokens",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;

export const Colors: StoryObj = {
  render: () => (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Color Tokens</h1>

      <div className="grid grid-cols-4 gap-4">
        <div>
          <div
            className="w-24 h-24 rounded-lg shadow-md"
            style={{ backgroundColor: "var(--color-primary)" }}
          />
          <p className="mt-2 text-sm font-medium">Primary</p>
        </div>
        <div>
          <div
            className="w-24 h-24 rounded-lg shadow-md"
            style={{ backgroundColor: "var(--color-secondary)" }}
          />
          <p className="mt-2 text-sm font-medium">Secondary</p>
        </div>
      </div>
    </div>
  ),
};

export const Spacing: StoryObj = {
  render: () => (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Spacing Tokens</h1>

      <div className="space-y-4">
        {["xs", "sm", "md", "lg", "xl"].map((size) => (
          <div key={size} className="flex items-center">
            <div
              className="bg-blue-500"
              style={{
                width: `var(--spacing-${size})`,
                height: `var(--spacing-${size})`,
              }}
            />
            <span className="ml-4 font-mono text-sm">spacing.{size}</span>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const Typography: StoryObj = {
  render: () => (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Typography Tokens</h1>

      <div className="space-y-4">
        <div>
          <p style={{ fontSize: "var(--font-size-sm)" }}>Small text</p>
          <p className="text-xs text-gray-500">font-size-sm</p>
        </div>
        <div>
          <p style={{ fontSize: "var(--font-size-md)" }}>Medium text</p>
          <p className="text-xs text-gray-500">font-size-md</p>
        </div>
        <div>
          <p style={{ fontSize: "var(--font-size-lg)" }}>Large text</p>
          <p className="text-xs text-gray-500">font-size-lg</p>
        </div>
      </div>
    </div>
  ),
};
```

## Theme Switching in Storybook

### Manual Theme Selection

The TokiForge addon automatically adds theme controls to Storybook toolbar:

```typescript
// Themes appear in the toolbar - no code needed!
// Select "Light", "Dark", etc. from the dropdown
```

### Story-Level Theme Override

```typescript
// src/components/Card.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "./Card";

export const DarkModeOnly: StoryObj = {
  args: {
    title: "Dark Mode Card",
  },
  parameters: {
    tokens: {
      theme: "dark", // Force dark theme for this story
    },
  },
};

export const AllThemes: StoryObj = {
  args: {
    title: "Multi-theme",
  },
  parameters: {
    tokens: {
      showAllThemes: true, // Display all theme variants
    },
  },
};
```

## Advanced Configuration

### Custom Theme Controls

```typescript
// .storybook/preview.tsx
import { themeConfig } from "../src/config/tokens";

export const parameters = {
  tokens: {
    config: themeConfig,
    themes: {
      light: {
        label: "☀️ Light",
        default: true,
      },
      dark: {
        label: "🌙 Dark",
      },
      "high-contrast": {
        label: "🔷 High Contrast",
      },
    },
  },
};
```

### Custom Token Display

```typescript
// .storybook/preview.tsx
export const parameters = {
  tokens: {
    config: themeConfig,
    displayMode: "compact", // or 'detailed'
    groups: {
      colors: { label: "🎨 Colors" },
      spacing: { label: "📏 Spacing" },
      typography: { label: "✍️ Typography" },
    },
  },
};
```

## Testing Themes

### Visual Regression Testing

```bash
npm install -D @chromatic-com/storybook
npx chromatic init
npm run build-storybook
npx chromatic
```

### Theme Contrast Testing

Create a story to verify WCAG compliance:

```typescript
// src/a11y.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";

export const ContrastRatios: StoryObj = {
  render: () => (
    <div className="p-8 space-y-4">
      <div
        className="p-4 rounded"
        style={{
          backgroundColor: "var(--color-background)",
          color: "var(--color-text)",
        }}
      >
        <p>Primary text on background</p>
        <small className="text-gray-500">Ratio: 7:1 (AAA)</small>
      </div>

      <div
        className="p-4 rounded"
        style={{
          backgroundColor: "var(--color-primary)",
          color: "white",
        }}
      >
        <p>White text on primary</p>
        <small>Ratio: 8.5:1 (AAA)</small>
      </div>
    </div>
  ),
};
```

## Component Documentation

### Auto-generate Docs from Tokens

```typescript
// src/tokens/index.stories.mdx
import { Meta, Canvas, Story } from '@storybook/blocks';
import { getTokensByCategory } from '@tokiforge/core';

<Meta title="Design System/Token Catalog" />

# Design Token Catalog

## Colors

All color tokens available in the design system:

<Canvas>
  {getTokensByCategory('color').map((token) => (
    <div
      key={token.name}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1rem',
      }}
    >
      <div
        style={{
          width: '100px',
          height: '100px',
          backgroundColor: token.value,
          borderRadius: '8px',
          border: '1px solid #ccc',
        }}
      />
      <div>
        <p className="font-mono font-bold">{token.name}</p>
        <p className="text-gray-500">{token.value}</p>
      </div>
    </div>
  ))}
</Canvas>
```

## Integration with Component Library

### Shared Storybook Instance

```typescript
// storybook/preview.tsx
import { ThemeProvider } from "@tokiforge/react";
import { themeConfig } from "@mycompany/design-tokens";

export const decorators = [
  (Story) => (
    <ThemeProvider config={themeConfig}>
      <Story />
    </ThemeProvider>
  ),
];
```

### Token Versioning

```typescript
// storybook/main.ts
const tokiforgeAddon = createTokensAddon(themeConfig, {
  version: require("@mycompany/design-tokens/package.json").version,
  repository: "https://github.com/mycompany/design-tokens",
});
```

## Best Practices

1. **Document all tokens** with examples
2. **Show themes** side-by-side for comparison
3. **Test contrast** ratios in stories
4. **Version control** token documentation
5. **Use consistent naming** in stories
6. **Group related** components and tokens
7. **Include responsive** variants
8. **Test accessibility** with each story

## Deployment

### Build Storybook

```bash
npm run build-storybook
```

### Host on Static Server

```bash
# Vercel
vercel --prod

# Netlify
netlify deploy --prod --dir storybook-static

# GitHub Pages
npm run build-storybook
npx gh-pages -d storybook-static
```

## Troubleshooting

### Theme Not Switching

Ensure the decorator is applied:

```typescript
// .storybook/preview.tsx
export const decorators = [
  (Story) => (
    <ThemeProvider config={themeConfig}>
      <Story />
    </ThemeProvider>
  ),
];
```

### Tokens Not Displaying

Check token format:

```json
{
  "themes": [
    {
      "name": "light",
      "tokens": {
        "color": {
          "primary": { "value": "#007AFF", "type": "color" }
        }
      }
    }
  ]
}
```

### Build Failures

Clear cache and rebuild:

```bash
rm -rf node_modules/.cache
npm run build-storybook
```

## Related Resources

- [Storybook Documentation](https://storybook.js.org/docs)
- [Storybook Addons](https://storybook.js.org/addons)
- [@tokiforge/storybook API](/api/storybook)
- [Design Tokens Guide](/guide/design-tokens)
- [Component Testing](/guide/testing)

## Next Steps

- Explore [Storybook best practices](https://storybook.js.org/docs/react/writing-stories/introduction)
- Set up [visual testing](/guide/testing)
- Configure [CI/CD integration](/guides/ci-recipes)
