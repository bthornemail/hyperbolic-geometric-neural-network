import { test, expect } from '@playwright/test';

test.describe('Simple Smoke Test', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('domcontentloaded');
    
    // Check if the page title contains expected text
    await expect(page).toHaveTitle(/H²GNN/);
    
    // Check if main heading is visible
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible({ timeout: 10000 });
    
    console.log('Page loaded successfully!');
  });

  test('should have basic navigation elements', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Look for any navigation or main content
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-results/homepage.png', fullPage: true });
    
    console.log('Basic elements found!');
  });
});
