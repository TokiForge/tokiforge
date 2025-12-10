# TokiForge Angular Example

This example demonstrates how to use TokiForge with Angular 17+ using standalone components.

> **TokiForge v1.2.0** | **Angular 17+**  
> **Note:** Angular 19+ is recommended for full Signals support, though Angular 17+ works for basic usage.

## Features

- ✅ Angular 17+ standalone components
- ✅ Theme switching with `ThemeService`
- ✅ CSS variables for theming
- ✅ Direct token access
- ✅ SSR-safe (works with `@angular/ssr`)

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation

**Important:** The example uses local packages from the monorepo. You need to build the packages first.

**Step 1: Build the packages**

From the repository root:

```bash
npm run build
```

This builds `@tokiforge/core` and `@tokiforge/angular` packages.

**Step 2: Install example dependencies**

```bash
cd examples/angular-example
npm install
```

The example uses `file:` protocol to link to the local packages, so they must be built first.

## Browser Compatibility

This example includes browser-compatible stubs for Node.js modules (`module`, `zlib`, `util`, `yaml`, `fs`, `path`) to ensure successful builds in browser environments. The TypeScript configuration includes path mappings that resolve these modules to stubs located in `src/stubs/`.

The Angular build configuration (`angular.json`) includes these modules in `allowedCommonJsDependencies` to prevent build warnings.

### Development

```bash
# Start dev server
npm start
# or
ng serve
```

The app will be available at `http://localhost:4200`

### Build

```bash
# Build for production
npm run build
# or
ng build
```

## Project Structure

```
angular-example/
├── src/
│   ├── app/
│   │   ├── app.component.ts       # Root component with theme initialization
│   │   ├── theme-switcher.component.ts  # Theme switcher component
│   │   ├── card.component.ts       # Card using CSS variables
│   │   └── button.component.ts    # Button using tokens directly
│   └── main.ts                    # Bootstrap
├── tokens.json                     # Design tokens
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Key Concepts

### 1. Theme Initialization

The `ThemeService` is initialized in the root component:

```typescript
import { ThemeService } from '@tokiforge/angular';

export class AppComponent implements OnInit {
  private themeService = inject(ThemeService);

  ngOnInit() {
    this.themeService.init(themeConfig);
  }
}
```

### 2. Using CSS Variables

CSS variables are automatically injected and can be used in component styles:

```css
.card {
  background-color: var(--hf-color-background-default);
  color: var(--hf-color-text-primary);
}
```

### 3. Using Tokens Directly

Access tokens through the service:

```typescript
const tokens = this.themeService.tokens();
const primaryColor = tokens.color?.primary?.value;
```

### 4. Theme Switching

Switch themes programmatically:

```typescript
this.themeService.setTheme('dark');
// or
this.themeService.nextTheme();
```

## Learn More

- [Angular Guide](/guide/angular)
- [Framework Support](/guide/framework-support)
- [TokiForge Documentation](https://github.com/TokiForge/tokiforge)

