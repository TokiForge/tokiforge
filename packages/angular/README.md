# @tokiforge/angular

**Angular adapter for TokiForge design token and theming engine. Provides Angular service with Signals for easy theme management in Angular applications. Supports Angular 17+ and SSR.**

Angular adapter for TokiForge theming engine (v1.2.0).

## Installation

```bash
npm install @tokiforge/angular@^1.2.0 @tokiforge/core@^1.2.0
```

## Requirements

- Angular 17+ (minimum)
- **Angular 19+ recommended** for full Signals support
- Uses modern `@angular/ssr` (Angular Universal deprecated)

## Quick Start

```typescript
import { ThemeService } from '@tokiforge/angular';
import { inject } from '@angular/core';

export class AppComponent implements OnInit {
  private themeService = inject(ThemeService);

  ngOnInit() {
    this.themeService.init(themeConfig);
  }
}
```

See the [Angular Guide](/guide/angular) for complete documentation.

