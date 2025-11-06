import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService, type ThemeInitOptions } from '@tokiforge/angular';
import type { ThemeConfig } from '@tokiforge/core';
import tokens from '../../tokens.json';
import { ThemeSwitcherComponent } from './theme-switcher.component';
import { CardComponent } from './card.component';
import { ButtonComponent } from './button.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ThemeSwitcherComponent, CardComponent, ButtonComponent],
  template: `
    <div class="app-container">
      <h1>🌈 Enhanced TokiForge Angular Example</h1>
      <p>This demonstrates the enhanced TokiForge theming system with static mode + all features!</p>
      
      <div class="info-section">
        <p><strong>Current Theme:</strong> {{ themeService.theme() }}</p>
        <p><strong>Mode:</strong> Static (body classes, zero JS overhead)</p>
        <p><strong>Features:</strong> Token parsing ✅ | References ✅ | localStorage ✅ | System theme ✅</p>
      </div>
      
      <app-theme-switcher></app-theme-switcher>
      <app-card></app-card>
      <app-button></app-button>
      
      <div class="tokens-section">
        <details>
          <summary><h2>Theme Tokens</h2></summary>
          <pre>{{ tokensJson() }}</pre>
        </details>
        
        @if (generatedCSS()) {
          <details>
            <summary><h2>Generated CSS (for current theme)</h2></summary>
            <pre>{{ generatedCSS() }}</pre>
          </details>
        }
      </div>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      padding: 2rem;
      background-color: var(--hf-color-background-default);
      color: var(--hf-color-text-primary);
      transition: background-color 0.3s, color 0.3s;
    }

    h1 {
      margin-bottom: 1rem;
    }

    p {
      margin-bottom: 2rem;
      color: var(--hf-color-text-secondary);
    }

    .info-section {
      margin: 2rem 0;
      padding: var(--hf-spacing-lg);
      background-color: var(--hf-color-background-muted);
      border-radius: var(--hf-radius-md);
    }

    .tokens-section {
      margin-top: 2rem;
    }

    details {
      margin: 1rem 0;
      padding: 1rem;
      background-color: var(--hf-color-background-muted);
      border-radius: var(--hf-radius-md);
    }

    summary {
      cursor: pointer;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    summary h2 {
      display: inline;
      margin: 0;
    }

    pre {
      margin-top: 1rem;
      padding: 1rem;
      background-color: rgba(0, 0, 0, 0.1);
      border-radius: var(--hf-radius-sm);
      overflow: auto;
      max-height: 300px;
      font-size: 12px;
      color: var(--hf-color-text-primary);
    }
  `]
})
export class AppComponent implements OnInit {
  themeService = inject(ThemeService);
  
  tokensJson = computed(() => {
    const currentTokens = this.themeService.tokens();
    return JSON.stringify(currentTokens, null, 2);
  });

  generatedCSS = computed(() => {
    try {
      return this.themeService.generateCSS();
    } catch {
      return '';
    }
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
      mode: 'static',
      persist: true,
      watchSystemTheme: false,
      bodyClassPrefix: 'theme',
      prefix: 'hf',
    };
    this.themeService.init(themeConfig, options);
  }
}

