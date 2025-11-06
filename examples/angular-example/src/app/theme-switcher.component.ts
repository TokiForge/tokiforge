import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '@tokiforge/angular';

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="theme-switcher">
      <label>Theme:</label>
      <select 
        [value]="themeService.theme()" 
        (change)="onThemeChange($event)"
        class="theme-select"
      >
        @for (themeName of themeService.availableThemes(); track themeName) {
          <option [value]="themeName">{{ themeName }}</option>
        }
      </select>
      <button (click)="themeService.nextTheme()" class="next-theme-btn">
        Next Theme ({{ themeService.availableThemes().length }} available)
      </button>
    </div>
  `,
  styles: [`
    .theme-switcher {
      display: flex;
      gap: var(--hf-spacing-md);
      align-items: center;
      margin-bottom: var(--hf-spacing-lg);
    }

    label {
      font-weight: 500;
    }

    .theme-select {
      padding: var(--hf-spacing-sm) var(--hf-spacing-md);
      border-radius: var(--hf-radius-md);
      border: 1px solid var(--hf-color-text-secondary);
      background-color: var(--hf-color-background-default);
      color: var(--hf-color-text-primary);
      cursor: pointer;
    }

    .next-theme-btn {
      padding: var(--hf-spacing-md) var(--hf-spacing-lg);
      border-radius: var(--hf-radius-lg);
      border: none;
      background-color: var(--hf-color-primary);
      color: #FFFFFF;
      cursor: pointer;
      font-size: 16px;
      font-weight: 600;
      transition: all 0.2s;
    }

    .next-theme-btn:hover {
      opacity: 0.9;
    }
  `]
})
export class ThemeSwitcherComponent {
  themeService = inject(ThemeService);

  onThemeChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.themeService.setTheme(select.value);
  }
}

