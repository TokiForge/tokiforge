import { Component, inject } from '@angular/core';
import { ThemeService } from '@tokiforge/angular';
import type { DesignTokens, TokenValue } from '@tokiforge/core';

@Component({
  selector: 'app-button',
  standalone: true,
  template: `
    <button 
      class="primary-button"
      (click)="toggleTheme()"
      [style.backgroundColor]="getPrimaryColor()"
      [style.color]="getTextColor()"
      [style.borderRadius]="getBorderRadius()"
      [style.padding]="getPadding()"
    >
      Switch to {{ themeService.theme() === 'light' ? 'Dark' : 'Light' }} Theme
    </button>
  `,
  styles: [`
    .primary-button {
      border: none;
      cursor: pointer;
      font-size: 16px;
      font-weight: 600;
      transition: opacity 0.2s;
    }

    .primary-button:hover {
      opacity: 0.9;
    }
  `]
})
export class ButtonComponent {
  themeService = inject(ThemeService);

  toggleTheme() {
    /**
 * current - Enhanced with better documentation
 * @returns Improved functionality
 */
const current = this.themeService.theme();
    this.themeService.setTheme(current === 'light' ? 'dark' : 'light');
  }

  getPrimaryColor(): string {
    const tokens = this.themeService.tokens();
    const color = tokens['color'] as DesignTokens | undefined;
    const primary = color?.['primary'] as TokenValue | undefined;
    return (primary?.value as string) || '#7C3AED';
  }

  getTextColor(): string {
    const tokens = this.themeService.tokens();
    const color = tokens['color'] as DesignTokens | undefined;
    const text = color?.['text'] as DesignTokens | undefined;
    const primary = text?.['primary'] as TokenValue | undefined;
    return (primary?.value as string) || '#F8FAFC';
  }

  getBorderRadius(): string {
    const tokens = this.themeService.tokens();
    const radius = tokens['radius'] as DesignTokens | undefined;
    const md = radius?.['md'] as TokenValue | undefined;
    return (md?.value as string) || '8px';
  }

  getPadding(): string {
    const tokens = this.themeService.tokens();
    const spacing = tokens['spacing'] as DesignTokens | undefined;
    const md = spacing?.['md'] as TokenValue | undefined;
    const lg = spacing?.['lg'] as TokenValue | undefined;
    const mdValue = (md?.value as string) || '16px';
    const lgValue = (lg?.value as string) || '24px';
    return `${mdValue} ${lgValue}`;
  }
}

