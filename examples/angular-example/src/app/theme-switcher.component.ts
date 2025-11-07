import { Component, inject } from '@angular/core';
import { ThemeService } from '@tokiforge/angular';

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  template: `
    <button class="theme-button" (click)="toggleTheme()">
      Switch to {{ themeService.theme() === 'light' ? 'Dark' : 'Light' }} Theme
    </button>
  `
})
export class ThemeSwitcherComponent {
  themeService = inject(ThemeService);

  toggleTheme() {
    const current = this.themeService.theme();
    this.themeService.setTheme(current === 'light' ? 'dark' : 'light');
  }
}

