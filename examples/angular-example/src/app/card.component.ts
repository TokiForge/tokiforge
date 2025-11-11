import { Component } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  template: `
    <div class="card">
      <p>This card uses CSS variables for theming. The background and text colors automatically adapt to the current theme.</p>
    </div>
  `,
  styles: [`
    .card {
      background-color: var(--hf-color-background-muted);
      color: var(--hf-color-text-primary);
      border-radius: var(--hf-radius-md);
      padding: var(--hf-spacing-lg);
      margin-top: 2rem;
      transition: background-color 0.3s, color 0.3s;
    }
  `]
})
export class CardComponent {}

