import { Component } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  template: `
    <button class="primary-button">
      Button using CSS variables
    </button>
  `,
  styles: [`
    .primary-button {
      background-color: var(--hf-color-accent);
      color: #FFFFFF;
      border-radius: var(--hf-radius-lg);
      padding: var(--hf-spacing-md) var(--hf-spacing-lg);
      border: none;
      cursor: pointer;
      font-size: 16px;
      font-weight: 600;
      transition: all 0.2s;
      margin-top: 1rem;
      display: block;
    }

    .primary-button:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }

    .primary-button:active {
      transform: translateY(0);
    }
  `]
})
export class ButtonComponent {}

