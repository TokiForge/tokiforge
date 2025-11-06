# Custom Exporters

Create custom exporters to output your design tokens in any format you need.

## Overview

TokiForge provides built-in exporters for CSS, SCSS, JavaScript, TypeScript, and JSON. However, you can create custom exporters for:

- Custom CSS formats (Sass, Less, Stylus)
- Framework-specific formats (Tailwind config, styled-components themes)
- Platform-specific formats (iOS, Android, Flutter)
- Custom build tools and pipelines

## Built-in Exporters

Before creating custom exporters, familiarize yourself with the built-in ones:

```typescript
import { TokenExporter } from '@tokiforge/core';

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

## Creating Custom Exporters

### Method 1: Extend TokenExporter

Create a class that extends `TokenExporter`:

```typescript
import { TokenExporter } from '@tokiforge/core';
import type { DesignTokens, TokenExportOptions } from '@tokiforge/core';

class CustomExporter extends TokenExporter {
  static exportCustomFormat(
    tokens: DesignTokens,
    options: TokenExportOptions = {}
  ): string {
    // Your custom export logic here
    const flattened = this.flattenTokens(tokens);
    const lines: string[] = [];

    for (const path in flattened) {
      const token = flattened[path];
      // Custom formatting logic
      lines.push(`${path}: ${token.value}`);
    }

    return lines.join('\n');
  }
}

// Usage
const output = CustomExporter.exportCustomFormat(tokens);
```

### Method 2: Standalone Function

Create a standalone function that uses `TokenExporter` utilities:

```typescript
import { TokenExporter } from '@tokiforge/core';
import type { DesignTokens } from '@tokiforge/core';

function exportToTailwind(tokens: DesignTokens): string {
  // Access private method via type casting (if needed)
  // Or use public methods and flatten manually
  
  const flattened: Record<string, any> = {};
  
  // Flatten tokens manually
  function flatten(obj: any, prefix = '') {
    for (const key in obj) {
      const value = obj[key];
      const path = prefix ? `${prefix}.${key}` : key;
      
      if (value && typeof value === 'object' && 'value' in value) {
        flattened[path] = value.value;
      } else if (value && typeof value === 'object') {
        flatten(value, path);
      }
    }
  }
  
  flatten(tokens);
  
  // Convert to Tailwind config format
  const tailwindConfig = {
    theme: {
      extend: {
        colors: {},
        spacing: {},
        borderRadius: {},
      },
    },
  };
  
  for (const path in flattened) {
    const value = flattened[path];
    const parts = path.split('.');
    
    if (parts[0] === 'color') {
      const colorName = parts.slice(1).join('-');
      tailwindConfig.theme.extend.colors[colorName] = value;
    } else if (parts[0] === 'spacing') {
      const spacingName = parts.slice(1).join('-');
      tailwindConfig.theme.extend.spacing[spacingName] = value;
    } else if (parts[0] === 'radius') {
      const radiusName = parts.slice(1).join('-');
      tailwindConfig.theme.extend.borderRadius[radiusName] = value;
    }
  }
  
  return `module.exports = ${JSON.stringify(tailwindConfig, null, 2)};`;
}

// Usage
const tailwindConfig = exportToTailwind(tokens);
```

### Method 3: Using TokenExporter.export

Create a wrapper that uses the built-in export method:

```typescript
import { TokenExporter } from '@tokiforge/core';
import type { DesignTokens, TokenExportOptions } from '@tokiforge/core';

function exportToLess(tokens: DesignTokens, options: TokenExportOptions = {}): string {
  // Use SCSS export as base (similar syntax)
  const scss = TokenExporter.exportSCSS(tokens, options);
  
  // Convert SCSS variables to Less variables
  return scss.replace(/\$/g, '@');
}

// Usage
const less = exportToLess(tokens, { prefix: 'hf' });
```

## Examples

### Example 1: Tailwind CSS Config Exporter

```typescript
import type { DesignTokens } from '@tokiforge/core';

function exportToTailwind(tokens: DesignTokens): string {
  const config: any = {
    theme: {
      extend: {},
    },
  };

  function processTokens(obj: any, category: string, target: any) {
    for (const key in obj) {
      const value = obj[key];
      
      if (value && typeof value === 'object' && 'value' in value) {
        if (!target[category]) target[category] = {};
        target[category][key] = value.value;
      } else if (value && typeof value === 'object') {
        processTokens(value, category, target);
      }
    }
  }

  // Map token categories to Tailwind config
  if (tokens.color) {
    processTokens(tokens.color, 'colors', config.theme.extend);
  }
  if (tokens.spacing) {
    processTokens(tokens.spacing, 'spacing', config.theme.extend);
  }
  if (tokens.radius) {
    processTokens(tokens.radius, 'borderRadius', config.theme.extend);
  }

  return `module.exports = ${JSON.stringify(config, null, 2)};`;
}
```

### Example 2: Styled Components Theme Exporter

```typescript
import { TokenExporter } from '@tokiforge/core';
import type { DesignTokens } from '@tokiforge/core';

function exportToStyledComponents(tokens: DesignTokens): string {
  const js = TokenExporter.exportJS(tokens, { variables: false });
  
  // Convert to styled-components theme format
  const theme = js.replace('export default', 'export const theme =');
  
  return `${theme}\n\nexport default theme;`;
}
```

### Example 3: iOS Swift Exporter

```typescript
import type { DesignTokens } from '@tokiforge/core';

function exportToSwift(tokens: DesignTokens): string {
  const lines: string[] = [
    'import SwiftUI',
    '',
    'struct DesignTokens {',
  ];

  function processTokens(obj: any, indent: number = 1): void {
    const spaces = '  '.repeat(indent);
    
    for (const key in obj) {
      const value = obj[key];
      
      if (value && typeof value === 'object' && 'value' in value) {
        const swiftValue = typeof value.value === 'string' 
          ? `"${value.value}"` 
          : value.value;
        lines.push(`${spaces}static let ${key} = ${swiftValue}`);
      } else if (value && typeof value === 'object') {
        lines.push(`${spaces}struct ${key} {`);
        processTokens(value, indent + 1);
        lines.push(`${spaces}}`);
      }
    }
  }

  processTokens(tokens);
  lines.push('}');
  
  return lines.join('\n');
}
```

### Example 4: Android XML Resources Exporter

```typescript
import type { DesignTokens } from '@tokiforge/core';

function exportToAndroidXML(tokens: DesignTokens): string {
  const lines: string[] = [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<resources>',
  ];

  function processTokens(obj: any, prefix: string = ''): void {
    for (const key in obj) {
      const value = obj[key];
      const name = prefix ? `${prefix}_${key}` : key;
      
      if (value && typeof value === 'object' && 'value' in value) {
        const xmlValue = value.value.toString().replace('px', 'dp');
        lines.push(`  <dimen name="${name}">${xmlValue}</dimen>`);
      } else if (value && typeof value === 'object') {
        processTokens(value, name);
      }
    }
  }

  processTokens(tokens);
  lines.push('</resources>');
  
  return lines.join('\n');
}
```

## Integration with Build Tools

### Webpack Plugin

```typescript
import { TokenParser, TokenExporter } from '@tokiforge/core';
import type { Plugin } from 'webpack';

class TokiForgeWebpackPlugin implements Plugin {
  constructor(private config: { input: string; output: string; format: string }) {}

  apply(compiler: any) {
    compiler.hooks.beforeCompile.tapAsync('TokiForgePlugin', (params: any, callback: any) => {
      const tokens = TokenParser.parse(this.config.input);
      const output = TokenExporter.export(tokens, {
        format: this.config.format as any,
      });
      
      // Write to output file
      require('fs').writeFileSync(this.config.output, output);
      callback();
    });
  }
}

export default TokiForgeWebpackPlugin;
```

### Vite Plugin

```typescript
import { TokenParser, TokenExporter } from '@tokiforge/core';
import type { Plugin } from 'vite';
import { readFileSync, writeFileSync } from 'fs';

export function tokiForgePlugin(config: {
  input: string;
  output: string;
  format: string;
}): Plugin {
  return {
    name: 'tokiforge',
    buildStart() {
      const tokens = TokenParser.parse(config.input);
      const output = TokenExporter.export(tokens, {
        format: config.format as any,
      });
      writeFileSync(config.output, output);
    },
  };
}
```

### Rollup Plugin

```typescript
import { TokenParser, TokenExporter } from '@tokiforge/core';
import type { Plugin } from 'rollup';
import { readFileSync, writeFileSync } from 'fs';

export function tokiForgePlugin(config: {
  input: string;
  output: string;
  format: string;
}): Plugin {
  return {
    name: 'tokiforge',
    buildStart() {
      const tokens = TokenParser.parse(config.input);
      const output = TokenExporter.export(tokens, {
        format: config.format as any,
      });
      writeFileSync(config.output, output);
    },
  };
}
```

## Best Practices

1. **Reuse TokenExporter utilities** - Use `flattenTokens` and other methods when possible
2. **Handle token references** - Ensure references are expanded before exporting
3. **Validate tokens** - Use `TokenParser.validate()` before exporting
4. **Type safety** - Use TypeScript for type-safe custom exporters
5. **Error handling** - Add proper error handling for invalid tokens
6. **Testing** - Write tests for your custom exporters

## Advanced: Custom Format Registration

Create a registry system for custom formats:

```typescript
import { TokenExporter } from '@tokiforge/core';
import type { DesignTokens, TokenExportOptions } from '@tokiforge/core';

type CustomExporter = (tokens: DesignTokens, options?: TokenExportOptions) => string;

class ExporterRegistry {
  private static exporters: Map<string, CustomExporter> = new Map();

  static register(name: string, exporter: CustomExporter) {
    this.exporters.set(name, exporter);
  }

  static export(name: string, tokens: DesignTokens, options?: TokenExportOptions): string {
    const exporter = this.exporters.get(name);
    if (!exporter) {
      throw new Error(`Exporter "${name}" not found`);
    }
    return exporter(tokens, options);
  }

  static list(): string[] {
    return Array.from(this.exporters.keys());
  }
}

// Register custom exporter
ExporterRegistry.register('tailwind', exportToTailwind);

// Use it
const output = ExporterRegistry.export('tailwind', tokens);
```

## Next Steps

- See [TokenExporter API](/api/core#tokenexporter) for full API reference
- Check [Design Tokens Guide](/guide/design-tokens) for token structure
- Explore [Examples](/examples/react) for usage patterns

