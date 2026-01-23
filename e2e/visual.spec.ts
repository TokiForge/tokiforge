import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test('playground theme switcher renders correctly', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot of the initial state (light theme)
    await expect(page).toHaveScreenshot('playground-light-theme.png');
    
    // Find and click the theme switcher button (adjust selector as needed)
    const themeSwitcher = page.locator('[data-testid="theme-switcher"]').first();
    if (await themeSwitcher.count() > 0) {
      await themeSwitcher.click();
      await page.waitForTimeout(500); // Wait for theme transition
      
      // Take a screenshot after theme switch
      await expect(page).toHaveScreenshot('playground-dark-theme.png');
    }
  });

  test('playground loads without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verify no console errors
    expect(errors).toHaveLength(0);
    
    // Verify main content is visible
    await expect(page.locator('body')).toBeVisible();
  });
});
