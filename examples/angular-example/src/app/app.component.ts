import { Component, OnInit, inject, computed } from '@angular/core';
import { ThemeService, type ThemeInitOptions } from '@tokiforge/angular';
import type { ThemeConfig } from '@tokiforge/core';
import tokens from '../../tokens.json';
import { ThemeSwitcherComponent } from './theme-switcher.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ThemeSwitcherComponent],
  template: `
    <div class="app-container">
      <h1>TokiForge Angular Example</h1>
      <p>This demonstrates the TokiForge theming system with Angular.</p>
      
      <app-theme-switcher></app-theme-switcher>
      
      <div class="tokens-section">
        <h2>Theme Tokens</h2>
        <pre>{{ tokensJson() }}</pre>
      </div>
    </div>
  `
})
export class AppComponent implements OnInit {
  themeService = inject(ThemeService);
  
  tokensJson = computed(() => {
    const currentTokens = this.themeService.tokens();
    return JSON.stringify(currentTokens, null, 2);
  });

  ngOnInit() {
    const themeConfig: ThemeConfig = {
      themes: [
        {
          name: 'light',
          tokens: {
            ...tokens,
            color: {
              ...tokens.color,
              text: {
                primary: { value: '#1E293B', type: 'color' },
                secondary: { value: '#64748B', type: 'color' },
              },
            },
          } as any,
        },
        {
          name: 'dark',
          tokens: {
            ...tokens,
            color: {
              ...tokens.color,
              text: {
                primary: { value: '#F8FAFC', type: 'color' },
                secondary: { value: '#CBD5E1', type: 'color' },
              },
              background: {
                default: { value: '#0F172A', type: 'color' },
                muted: { value: '#1E293B', type: 'color' },
              },
            },
          } as any,
        },
      ],
      defaultTheme: 'light',
    };

    const options: ThemeInitOptions = {
      mode: 'dynamic',
      persist: true,
      watchSystemTheme: false,
      prefix: 'hf',
    };
    this.themeService.init(themeConfig, options);
  }
}

