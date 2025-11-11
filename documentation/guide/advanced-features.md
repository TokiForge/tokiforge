# Advanced Features

TokiForge v1.1.1 introduces powerful advanced features for enterprise-grade design systems.

## Token Versioning & Deprecation

Track token versions and manage deprecations.

```typescript
import { TokenVersioning } from '@tokiforge/core';

const tokens = {
  color: {
    primary: {
      value: '#7C3AED',
      version: {
        version: '1.0.0',
        introduced: '2024-01-01',
        deprecated: '2024-06-01',
        replacedBy: 'color.brand.primary',
        migration: 'Use color.brand.primary instead'
      }
    }
  }
};

const warnings = TokenVersioning.getDeprecatedTokens(tokens);
const activeTokens = TokenVersioning.filterDeprecated(tokens, false);
```

## Component Theming

Scoped themes for individual components.

```typescript
import { ComponentTheming } from '@tokiforge/core';

const theming = new ComponentTheming();
theming.registerComponentTheme({
  name: 'button',
  scope: 'btn',
  tokens: {
    color: {
      primary: { value: '#7C3AED' },
      hover: { value: '#6D28D9' }
    }
  }
});

const buttonTokens = theming.getScopedTokens('button', globalTokens);
const css = theming.applyComponentTheme('button', '.btn', 'hf');
```

## Plugin System

Extend TokiForge with custom functionality.

```typescript
import { pluginManager } from '@tokiforge/core';

pluginManager.register({
  name: 'my-exporter',
  exporter: (tokens, options) => {
    return JSON.stringify(tokens, null, 2);
  },
  validator: (tokens) => {
    return { valid: true, errors: [] };
  }
});

const output = pluginManager.export(tokens, 'my-exporter');
```

## Accessibility

Built-in accessibility checking.

```typescript
import { AccessibilityUtils } from '@tokiforge/core';

const contrast = AccessibilityUtils.calculateContrast('#000000', '#FFFFFF');
const metrics = AccessibilityUtils.checkAccessibility(tokens);
const report = AccessibilityUtils.generateAccessibilityReport(tokens);
```

## Responsive & State Tokens

Breakpoint and state-aware tokens.

```typescript
import { ResponsiveTokens } from '@tokiforge/core';

const tokens = {
  spacing: {
    padding: {
      value: '16px',
      responsive: {
        sm: '8px',
        md: '16px',
        lg: '24px'
      }
    }
  },
  button: {
    bg: {
      value: '#7C3AED',
      states: {
        default: '#7C3AED',
        hover: '#6D28D9',
        active: '#5B21B6'
      }
    }
  }
};

const padding = ResponsiveTokens.getResponsiveValue(tokens.spacing.padding, 'lg');
const hoverBg = ResponsiveTokens.getStateValue(tokens.button.bg, 'hover');
```

## Figma Sync

Compare and sync with Figma.

```typescript
import { FigmaDiff } from '@tokiforge/core';
import { pullFromFigma } from '@tokiforge/figma';

const figmaTokens = await pullFromFigma({
  accessToken: 'your-token',
  fileKey: 'your-file-key',
});

const diff = FigmaDiff.compare(figmaTokens, codeTokens);
if (FigmaDiff.hasMismatches(diff)) {
  console.log(FigmaDiff.generateReport(diff));
}
```

## CI/CD Integration

Automated validation in pipelines.

```typescript
import { CICDValidator } from '@tokiforge/core';

const result = CICDValidator.validate(tokens, {
  strict: true,
  checkAccessibility: true,
  checkDeprecated: true,
});

process.exit(CICDValidator.exitCode(result));
```

## Analytics

Track token usage and bundle impact.

```typescript
import { TokenAnalytics } from '@tokiforge/core';

const analytics = new TokenAnalytics();
analytics.trackUsage('color.primary', 'css');
const report = analytics.getUsageReport(tokens);
```

## Token Registry

Multi-team token management.

```typescript
import { TokenRegistry } from '@tokiforge/core';

const registry = new TokenRegistry({ teams: ['design', 'engineering'] });
registry.importFromTokens(designTokens, 'design', '1.0.0');
registry.importFromTokens(engineeringTokens, 'engineering', '1.0.0');

const designTokens = registry.getAll('design');
const conflicts = registry.conflictCheck(otherRegistry);
```

## IDE Support

Autocomplete and hover previews.

```typescript
import { IDESupport } from '@tokiforge/core';

const ide = new IDESupport();
ide.loadTokens(tokens);
const hoverInfo = ide.getHoverInfo('color.primary');
const completions = ide.getCompletions('color');
```

