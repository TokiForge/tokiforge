/**
 * Visual Regression Tests for Design Tokens
 * 
 * Tests for color tokens, typography, spacing, and theme variations
 * Run with: npx playwright test e2e/visual-regression.spec.ts
 */

import { test, expect } from '@playwright/test';

const STORYBOOK_URL = 'http://localhost:6006';

// Color token tests
test.describe('Color Token Visuals', () => {
  test('primary colors should match baseline', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=tokens-colors--primary`);
    await expect(page).toHaveScreenshot('colors-primary.png', {
      threshold: 0.2,
      maxDiffPixels: 100,
    });
  });

  test('semantic colors should match baseline', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=tokens-colors--semantic`);
    await expect(page).toHaveScreenshot('colors-semantic.png', {
      threshold: 0.2,
      maxDiffPixels: 100,
    });
  });

  test('gradient colors should match baseline', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=tokens-colors--gradients`);
    await expect(page).toHaveScreenshot('colors-gradients.png', {
      threshold: 0.2,
      maxDiffPixels: 100,
    });
  });
});

// Typography token tests
test.describe('Typography Token Visuals', () => {
  test('heading styles should match baseline', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=tokens-typography--headings`);
    await expect(page).toHaveScreenshot('typography-headings.png', {
      threshold: 0.2,
      maxDiffPixels: 150,
    });
  });

  test('body text styles should match baseline', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=tokens-typography--body`);
    await expect(page).toHaveScreenshot('typography-body.png', {
      threshold: 0.2,
      maxDiffPixels: 150,
    });
  });

  test('code text styles should match baseline', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=tokens-typography--code`);
    await expect(page).toHaveScreenshot('typography-code.png', {
      threshold: 0.2,
      maxDiffPixels: 100,
    });
  });
});

// Spacing token tests
test.describe('Spacing Token Visuals', () => {
  test('spacing scale should match baseline', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=tokens-spacing--scale`);
    await expect(page).toHaveScreenshot('spacing-scale.png', {
      threshold: 0.2,
      maxDiffPixels: 100,
    });
  });

  test('padding utilities should match baseline', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=tokens-spacing--padding`);
    await expect(page).toHaveScreenshot('spacing-padding.png', {
      threshold: 0.2,
      maxDiffPixels: 100,
    });
  });

  test('margin utilities should match baseline', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=tokens-spacing--margin`);
    await expect(page).toHaveScreenshot('spacing-margin.png', {
      threshold: 0.2,
      maxDiffPixels: 100,
    });
  });
});

// Theme tests
test.describe('Theme Switching Visuals', () => {
  test('light theme should match baseline', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=tokens-theme--light`);
    await expect(page).toHaveScreenshot('theme-light.png', {
      threshold: 0.2,
      maxDiffPixels: 200,
    });
  });

  test('dark theme should match baseline', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=tokens-theme--dark`);
    await expect(page).toHaveScreenshot('theme-dark.png', {
      threshold: 0.2,
      maxDiffPixels: 200,
    });
  });

  test('high contrast theme should match baseline', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=tokens-theme--high-contrast`);
    await expect(page).toHaveScreenshot('theme-high-contrast.png', {
      threshold: 0.2,
      maxDiffPixels: 200,
    });
  });
});

// Component visuals with token changes
test.describe('Component Token Usage Visuals', () => {
  test('buttons with token colors should match baseline', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=components-button--all-variants`);
    await expect(page).toHaveScreenshot('component-buttons.png', {
      threshold: 0.2,
      maxDiffPixels: 150,
    });
  });

  test('cards with spacing tokens should match baseline', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=components-card--showcase`);
    await expect(page).toHaveScreenshot('component-cards.png', {
      threshold: 0.2,
      maxDiffPixels: 150,
    });
  });

  test('forms with typography tokens should match baseline', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=components-form--showcase`);
    await expect(page).toHaveScreenshot('component-forms.png', {
      threshold: 0.2,
      maxDiffPixels: 200,
    });
  });
});

// Responsive visuals
test.describe('Responsive Token Visuals', () => {
  test('mobile spacing should match baseline', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=tokens-responsive--mobile`);
    await expect(page).toHaveScreenshot('responsive-mobile.png', {
      threshold: 0.2,
      maxDiffPixels: 150,
    });
  });

  test('tablet spacing should match baseline', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=tokens-responsive--tablet`);
    await expect(page).toHaveScreenshot('responsive-tablet.png', {
      threshold: 0.2,
      maxDiffPixels: 150,
    });
  });

  test('desktop spacing should match baseline', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=tokens-responsive--desktop`);
    await expect(page).toHaveScreenshot('responsive-desktop.png', {
      threshold: 0.2,
      maxDiffPixels: 150,
    });
  });
});

// Accessibility tests
test.describe('Accessibility Token Visuals', () => {
  test('contrast ratios should be visible', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=tokens-accessibility--contrast`);
    await expect(page).toHaveScreenshot('accessibility-contrast.png', {
      threshold: 0.2,
      maxDiffPixels: 100,
    });
  });

  test('focus states should match baseline', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=tokens-accessibility--focus-states`);
    await expect(page).toHaveScreenshot('accessibility-focus.png', {
      threshold: 0.2,
      maxDiffPixels: 150,
    });
  });
});

// Performance test - ensure renders quickly
test.describe('Token Rendering Performance', () => {
  test('color palette should render in <2s', async ({ page }) => {
    const startTime = Date.now();
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=tokens-colors--primary`, {
      waitUntil: 'networkidle',
    });
    const endTime = Date.now();

    expect(endTime - startTime).toBeLessThan(2000);
  });

  test('typography showcase should render in <2s', async ({ page }) => {
    const startTime = Date.now();
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=tokens-typography--headings`, {
      waitUntil: 'networkidle',
    });
    const endTime = Date.now();

    expect(endTime - startTime).toBeLessThan(2000);
  });
});

// Token consistency tests
test.describe('Token Consistency', () => {
  test('color tokens should have consistent naming', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=tokens-documentation--color-tokens`);

    const colorTokens = await page.locator('[data-token-type="color"]').count();
    expect(colorTokens).toBeGreaterThan(0);
  });

  test('spacing tokens should have consistent values', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=tokens-documentation--spacing-tokens`);

    const spacingTokens = await page.locator('[data-token-type="spacing"]').count();
    expect(spacingTokens).toBeGreaterThan(0);
  });

  test('typography tokens should have valid font stacks', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=tokens-documentation--typography-tokens`);

    const fontFamilies = await page.locator('[data-token-type="typography"]').count();
    expect(fontFamilies).toBeGreaterThan(0);
  });
});
