# @tokiforge/playground

Visual design token editor, theme preview, and analysis tools for TokiForge.

## Features

### 🎨 Token Editor

- Real-time JSON token editing
- Syntax validation
- Live preview of changes
- Multi-theme support

### 👁️ Theme Preview

- Visual token list with color swatches
- Component preview showcase
- Real-time theme switching
- Light and dark theme support

### 🎯 Contrast Ratio Visualizer

- WCAG AA/AAA compliance checker
- Interactive color pair selection
- Contrast ratio calculator (4.5:1, 7:1 standards)
- Visual contrast matrix for all color combinations
- Real-time pass/fail indicators

### 📊 Token Usage Visualization

- Token statistics and distribution
- Interactive token hierarchy tree
- Token type categorization (colors, spacing, typography)
- Alias detection and visualization
- Token relationship mapping

### 🔄 Theme Comparison Tool

- Side-by-side theme comparison
- Difference highlighting
- Token value diff visualization
- Comparison statistics (same/different percentages)
- Filter by changed tokens

### 💾 Export & Share

- Multiple export formats:
  - JSON (Design Tokens Format)
  - CSS Variables
  - TypeScript definitions
  - SCSS Variables
- One-click copy to clipboard
- Download as file
- Shareable link generation
- Quick start code snippets for:
  - React
  - Vue
  - CSS import

## Installation

```bash
npm install @tokiforge/playground
```

## Usage

### Development Mode

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

### Building for Production

```bash
npm run build
```

### Running Tests

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch
```

## Standalone Deployment

The playground can be deployed as a standalone web application. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

### Quick Deploy Options

**Netlify**

```bash
netlify deploy --prod
```

**Vercel**

```bash
vercel --prod
```

**GitHub Pages**

- Push to `main` branch
- GitHub Actions will automatically deploy

## Components

### ContrastVisualizer

Visualizes WCAG contrast ratios between color tokens.

```tsx
import { ContrastVisualizer } from "@tokiforge/playground";

<ContrastVisualizer tokens={designTokens} />;
```

### TokenUsageVisualizer

Shows token usage statistics and hierarchy.

```tsx
import { TokenUsageVisualizer } from "@tokiforge/playground";

<TokenUsageVisualizer tokens={designTokens} />;
```

### ThemeComparison

Compares multiple themes side-by-side.

```tsx
import { ThemeComparison } from "@tokiforge/playground";

<ThemeComparison config={themeConfig} />;
```

### ExportShare

Exports tokens in multiple formats and generates share links.

```tsx
import { ExportShare } from "@tokiforge/playground";

<ExportShare tokens={designTokens} themeName="light" />;
```

## Features in Detail

### Contrast Ratio Checker

The contrast visualizer helps ensure your color combinations meet WCAG accessibility standards:

- **WCAG AA Normal**: 4.5:1 contrast ratio
- **WCAG AAA Normal**: 7:1 contrast ratio
- **WCAG AA Large**: 3:1 contrast ratio (18pt+ or 14pt+ bold)
- **WCAG AAA Large**: 4.5:1 contrast ratio

**Benefits:**

- Identify accessibility issues early
- Ensure compliance with WCAG standards
- Test all color combinations at once
- Visual preview of text on backgrounds

### Token Usage Analytics

Understand your token structure and usage patterns:

- **Total token count** across your design system
- **Type distribution** (colors, spacing, typography, etc.)
- **Alias tracking** to see token references
- **Hierarchy visualization** showing token organization

**Benefits:**

- Optimize token structure
- Identify unused or duplicate tokens
- Understand token relationships
- Plan token migrations

### Theme Comparison

Compare themes to understand differences:

- **Side-by-side comparison** of multiple themes
- **Difference highlighting** for easy identification
- **Statistics** showing percentage of changed tokens
- **Value visualization** with color swatches

**Benefits:**

- Validate theme consistency
- Identify theme-specific tokens
- Plan theme migrations
- Debug theme issues

### Export Capabilities

Export tokens in multiple formats:

- **JSON**: Standard Design Tokens Format
- **CSS**: CSS Custom Properties with prefix
- **TypeScript**: Typed token definitions
- **SCSS**: SCSS variables

**Benefits:**

- Integration with any build system
- Type-safe token usage in TypeScript
- Copy-paste ready code snippets
- Framework-specific examples

### Shareable Links

Generate URLs to share token configurations:

```
https://playground.tokiforge.dev?tokens=eyJjb2xvciI6...
```

**Benefits:**

- Share designs with team members
- Collaborate on token configurations
- Demo design systems
- Get feedback on tokens

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Performance

- Initial load: <100ms
- Token parsing: <10ms for 1000 tokens
- Contrast calculations: <1ms per pair
- Export generation: <50ms for 1000 tokens

## Contributing

Contributions welcome! Please see [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

MIT © 2024 TokiForge

## Links

- [Documentation](https://tokiforge.dev)
- [GitHub](https://github.com/your-org/tokiforge)
- [npm](https://www.npmjs.com/package/@tokiforge/playground)

## Support

- GitHub Issues: https://github.com/your-org/tokiforge/issues
