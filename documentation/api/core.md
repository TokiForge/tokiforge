# Core API Reference

The `@tokiforge/core` package provides the foundation for TokiForge.

## TokenParser

Parse and validate design token files.

### Methods

#### `TokenParser.parse(filePath, options?)`

Parse a JSON or YAML token file.

```typescript
import { TokenParser } from '@tokiforge/core';

const tokens = TokenParser.parse('./tokens.json', {
  validate: true,        // Validate token structure (default: true)
  expandReferences: true // Expand token references (default: true)
});
```

**Options:**
- `validate?: boolean` - Validate token structure
- `expandReferences?: boolean` - Expand `{token.path}` references

**Returns:** `DesignTokens`

#### `TokenParser.validate(tokens)`

Validate token structure.

```typescript
TokenParser.validate(tokens);
```

Throws an error if tokens are invalid.

#### `TokenParser.expandReferences(tokens)`

Expand token references.

```typescript
const expanded = TokenParser.expandReferences(tokens);
```

## TokenExporter

Export tokens to various formats.

### Methods

#### `TokenExporter.export(tokens, options)`

Main export method.

```typescript
import { TokenExporter } from '@tokiforge/core';

const css = TokenExporter.export(tokens, {
  format: 'css',
  selector: ':root',
  prefix: 'hf',
});
```

**Options:**
- `format: 'css' | 'js' | 'ts' | 'scss' | 'json'` - Output format
- `selector?: string` - CSS selector (for CSS format)
- `prefix?: string` - CSS variable prefix
- `variables?: boolean` - Use CSS variables in JS/TS output

#### Format-Specific Methods

```typescript
// CSS
const css = TokenExporter.exportCSS(tokens, {
  selector: ':root',
  prefix: 'hf',
});

// SCSS
const scss = TokenExporter.exportSCSS(tokens, {
  prefix: 'hf',
});

// JavaScript
const js = TokenExporter.exportJS(tokens, {
  variables: false,
});

// TypeScript
const ts = TokenExporter.exportTS(tokens);

// JSON
const json = TokenExporter.exportJSON(tokens);
```

## ThemeRuntime

Runtime engine for theme switching.

### Constructor

```typescript
import { ThemeRuntime } from '@tokiforge/core';

const runtime = new ThemeRuntime({
  themes: [
    { name: 'light', tokens: lightTokens },
    { name: 'dark', tokens: darkTokens },
  ],
  defaultTheme: 'light',
});
```

### Methods

#### `init(selector?, prefix?)`

Initialize runtime and inject CSS variables.

```typescript
runtime.init(':root', 'hf');
```

#### `applyTheme(themeName, selector?, prefix?)`

Switch to a specific theme.

```typescript
runtime.applyTheme('dark');
```

#### `getCurrentTheme()`

Get current theme name.

```typescript
const current = runtime.getCurrentTheme();
```

## TokenVersioning

Manage token versions and deprecations.

### Methods

#### `TokenVersioning.getDeprecatedTokens(tokens)`

Get all deprecated tokens.

```typescript
import { TokenVersioning } from '@tokiforge/core';

const warnings = TokenVersioning.getDeprecatedTokens(tokens);
```

#### `TokenVersioning.filterDeprecated(tokens, includeDeprecated?)`

Filter out deprecated tokens.

```typescript
const activeTokens = TokenVersioning.filterDeprecated(tokens, false);
```

#### `TokenVersioning.migrateToken(tokens, oldPath, newPath)`

Migrate a token to a new path.

```typescript
const result = TokenVersioning.migrateToken(tokens, 'color.primary', 'color.brand.primary');
```

## ComponentTheming

Scoped component theming.

### Methods

#### `registerComponentTheme(theme)`

Register a component theme.

```typescript
import { ComponentTheming } from '@tokiforge/core';

const theming = new ComponentTheming();
theming.registerComponentTheme({
  name: 'button',
  scope: 'btn',
  tokens: buttonTokens,
});
```

#### `getScopedTokens(componentName, globalTokens)`

Get scoped tokens for a component.

```typescript
const buttonTokens = theming.getScopedTokens('button', globalTokens);
```

#### `applyComponentTheme(componentName, selector, prefix?)`

Generate CSS for component theme.

```typescript
const css = theming.applyComponentTheme('button', '.btn', 'hf');
```

## PluginManager

Extensible plugin system.

### Methods

#### `register(plugin)`

Register a plugin.

```typescript
import { pluginManager } from '@tokiforge/core';

pluginManager.register({
  name: 'my-exporter',
  exporter: (tokens) => JSON.stringify(tokens),
});
```

#### `export(tokens, pluginName, options?)`

Export using a plugin.

```typescript
const output = pluginManager.export(tokens, 'my-exporter');
```

#### `validate(tokens, pluginName)`

Validate using a plugin.

```typescript
const result = pluginManager.validate(tokens, 'my-validator');
```

## AccessibilityUtils

Accessibility checking and analysis.

### Methods

#### `calculateContrast(color1, color2)`

Calculate contrast ratio.

```typescript
import { AccessibilityUtils } from '@tokiforge/core';

const contrast = AccessibilityUtils.calculateContrast('#000000', '#FFFFFF');
console.log(contrast.ratio); // 21
console.log(contrast.wcagAA); // true
```

#### `checkAccessibility(tokens)`

Check accessibility for all tokens.

```typescript
const metrics = AccessibilityUtils.checkAccessibility(tokens);
```

#### `generateAccessibilityReport(tokens)`

Generate accessibility report.

```typescript
const report = AccessibilityUtils.generateAccessibilityReport(tokens);
console.log(`Passing: ${report.passing}, Failing: ${report.failing}`);
```

## ResponsiveTokens

Responsive and state-aware tokens.

### Methods

#### `getResponsiveValue(token, breakpoint)`

Get responsive value for breakpoint.

```typescript
import { ResponsiveTokens } from '@tokiforge/core';

const padding = ResponsiveTokens.getResponsiveValue(token, 'lg');
```

#### `getStateValue(token, state)`

Get state value.

```typescript
const hoverBg = ResponsiveTokens.getStateValue(token, 'hover');
```

#### `generateResponsiveCSS(tokens, breakpoints?, prefix?)`

Generate responsive CSS.

```typescript
const css = ResponsiveTokens.generateResponsiveCSS(tokens);
```

#### `generateStateCSS(tokens, prefix?)`

Generate state CSS.

```typescript
const css = ResponsiveTokens.generateStateCSS(tokens);
```

## FigmaDiff

Compare Figma and code tokens.

### Methods

#### `compare(figmaTokens, codeTokens, options?)`

Compare tokens.

```typescript
import { FigmaDiff } from '@tokiforge/core';

const diff = FigmaDiff.compare(figmaTokens, codeTokens, {
  tolerance: 5,
});
```

#### `generateReport(diff)`

Generate diff report.

```typescript
const report = FigmaDiff.generateReport(diff);
console.log(report);
```

#### `hasMismatches(diff)`

Check for mismatches.

```typescript
if (FigmaDiff.hasMismatches(diff)) {
  console.log('Mismatches found!');
}
```

## CICDValidator

CI/CD token validation.

### Methods

#### `validate(tokens, options?)`

Validate tokens.

```typescript
import { CICDValidator } from '@tokiforge/core';

const result = CICDValidator.validate(tokens, {
  strict: true,
  checkAccessibility: true,
  checkDeprecated: true,
});
```

#### `validateFile(filePath, options?)`

Validate token file.

```typescript
const result = CICDValidator.validateFile('./tokens.json', {
  strict: true,
});
```

#### `exitCode(result)`

Get exit code for CI.

```typescript
process.exit(CICDValidator.exitCode(result));
```

## TokenAnalytics

Token usage analytics.

### Methods

#### `trackUsage(path, format?)`

Track token usage.

```typescript
import { TokenAnalytics } from '@tokiforge/core';

const analytics = new TokenAnalytics();
analytics.trackUsage('color.primary', 'css');
```

#### `getUsageReport(tokens)`

Get usage report.

```typescript
const report = analytics.getUsageReport(tokens);
console.log(`Coverage: ${report.coverage}%`);
```

## TokenRegistry

Versioned token registry for multi-team support.

### Methods

#### `importFromTokens(tokens, team?, version?)`

Import tokens into registry.

```typescript
import { TokenRegistry } from '@tokiforge/core';

const registry = new TokenRegistry();
registry.importFromTokens(tokens, 'design', '1.0.0');
```

#### `getAll(team?)`

Get all tokens.

```typescript
const designTokens = registry.getAll('design');
```

#### `exportTokens(team?, version?)`

Export tokens.

```typescript
const tokens = registry.exportTokens('design', '1.0.0');
```

## IDESupport

IDE extension support.

### Methods

#### `loadTokens(tokens)`

Load tokens.

```typescript
import { IDESupport } from '@tokiforge/core';

const ide = new IDESupport();
ide.loadTokens(tokens);
```

#### `getHoverInfo(tokenPath)`

Get hover information.

```typescript
const hoverInfo = ide.getHoverInfo('color.primary');
```

#### `getCompletions(prefix?)`

Get completions.

```typescript
const completions = ide.getCompletions('color');
```

## Types

### `DesignTokens`

```typescript
interface DesignTokens {
  [key: string]: TokenValue | DesignTokens | TokenValue[] | DesignTokens[];
}
```

### `TokenValue`

```typescript
interface TokenValue {
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
```

### `Theme`

```typescript
interface Theme {
  name: string;
  tokens: DesignTokens;
}
```

### `ThemeConfig`

```typescript
interface ThemeConfig {
  themes: Theme[];
  defaultTheme?: string;
}
```

## Examples

See the [Examples](/examples/react) section for complete usage examples.
