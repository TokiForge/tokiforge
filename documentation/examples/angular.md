# Angular Example

> **TokiForge v0.2.1** | **Angular 17+**

Complete Angular example using TokiForge with standalone components.

## Setup

```bash
npm install @tokiforge/angular@^0.2.1 @tokiforge/core@^0.2.1 @angular/core@^17.0.0 @angular/common@^17.0.0 @angular/platform-browser@^17.0.0
```

## Code

### Main App Component

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { ThemeService } from '@tokiforge/angular';
import type { ThemeConfig } from '@tokiforge/core';
import tokens from '../tokens.json';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <div class="app-container">
      <h1>🌈 TokiForge Angular Example</h1>
      <app-theme-switcher></app-theme-switcher>
      <app-card></app-card>
      <app-button></app-button>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      padding: 2rem;
      background-color: var(--hf-color-background-default);
      color: var(--hf-color-text-primary);
    }
  `]
})
export class AppComponent implements OnInit {
  private themeService = inject(ThemeService);

  ngOnInit() {
    const themeConfig: ThemeConfig = {
      themes: [
        { name: 'light', tokens: tokens },
        { name: 'dark', tokens: darkTokens },
      ],
      defaultTheme: 'light',
    };

    this.themeService.init(themeConfig, {
      mode: 'static',
      persist: true,
      watchSystemTheme: false,
      bodyClassPrefix: 'theme',
      prefix: 'hf',
    });
  }
}
```

### Theme Switcher Component

```typescript
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '@tokiforge/angular';

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <select 
      [value]="themeService.theme()" 
      (change)="onThemeChange($event)"
    >
      @for (themeName of themeService.availableThemes(); track themeName) {
        <option [value]="themeName">{{ themeName }}</option>
      }
    </select>
  `
})
export class ThemeSwitcherComponent {
  themeService = inject(ThemeService);

  onThemeChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.themeService.setTheme(select.value);
  }
}
```

### Card Component (Using CSS Variables)

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  template: `
    <div class="card">
      <h2>Card Title</h2>
      <p>This card uses CSS variables for theming.</p>
    </div>
  `,
  styles: [`
    .card {
      background-color: var(--hf-color-background-muted);
      color: var(--hf-color-text-primary);
      border-radius: var(--hf-radius-lg);
      padding: var(--hf-spacing-lg);
    }
  `]
})
export class CardComponent {}
```

### Button Component (Using Tokens Directly)

```typescript
import { Component, inject } from '@angular/core';
import { ThemeService } from '@tokiforge/angular';

@Component({
  selector: 'app-button',
  standalone: true,
  template: `
    <button 
      (click)="toggleTheme()"
      [style.backgroundColor]="themeService.tokens().color?.primary?.value"
      [style.color]="themeService.tokens().color?.text?.primary?.value"
      [style.borderRadius]="themeService.tokens().radius?.md?.value"
    >
      Switch Theme
    </button>
  `
})
export class ButtonComponent {
  themeService = inject(ThemeService);

  toggleTheme() {
    const current = this.themeService.theme();
    this.themeService.setTheme(current === 'light' ? 'dark' : 'light');
  }
}
```

### Bootstrap

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent)
  .catch(err => console.error(err));
```

## Try It

1. Navigate to the example: `cd examples/angular-example`
2. Install dependencies: `npm install`
3. Run dev server: `npm run dev`
4. Switch themes to see the magic! ✨

## Features Demonstrated

- ✅ Theme initialization with `ThemeService`
- ✅ Static mode (zero JS overhead)
- ✅ Automatic localStorage persistence
- ✅ Theme switching using signals
- ✅ CSS variables for styling
- ✅ Direct token access
- ✅ Standalone components
- ✅ SSR-safe (works with `@angular/ssr`)
- ✅ CSS generation utilities

## Next Steps

- See [Angular Guide](/guide/angular) for more details
- Check [API Reference](/api/angular) for full API docs
- Explore [Other Examples](/examples/react)

