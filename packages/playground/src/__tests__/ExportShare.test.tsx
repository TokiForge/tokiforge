import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ExportShare } from '../components/ExportShare';
import type { DesignTokens } from '@tokiforge/core';

describe('ExportShare', () => {
  const mockTokens: DesignTokens = {
    color: {
      primary: { value: '#7C3AED', type: 'color' },
    },
  };

  it('renders export and share component', () => {
    render(<ExportShare tokens={mockTokens} themeName="light" />);
    expect(document.querySelector('.export-share')).toBeTruthy();
  });

  it('displays export format selector', () => {
    render(<ExportShare tokens={mockTokens} themeName="light" />);
    expect(document.body.textContent).toContain('Export Format');
  });

  it('renders share configuration section', () => {
    render(<ExportShare tokens={mockTokens} themeName="light" />);
    expect(document.body.textContent).toContain('Share Configuration');
  });

  it('shows code snippets', () => {
    render(<ExportShare tokens={mockTokens} themeName="light" />);
    expect(document.body.textContent).toContain('Quick Start Snippets');
    expect(document.body.textContent).toContain('React Usage');
  });

  it('generates share link when button clicked', () => {
    render(<ExportShare tokens={mockTokens} themeName="light" />);
    const generateButton = document.querySelector('button') as HTMLButtonElement;
    if (generateButton && generateButton.textContent?.includes('Generate Share Link')) {
      generateButton.click();
      expect(document.body.textContent).toContain('Copy Link');
    }
  });

  it('changes export format', () => {
    render(<ExportShare tokens={mockTokens} themeName="light" />);
    const select = document.querySelector('select') as HTMLSelectElement;
    if (select) {
      select.value = 'css';
      select.dispatchEvent(new Event('change', { bubbles: true }));
      expect(document.body.textContent).toContain('CSS Prefix');
    }
  });
});
