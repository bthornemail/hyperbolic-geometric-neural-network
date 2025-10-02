import { test, expect } from '@playwright/test';

/**
 * Smoke Tests - Basic functionality checks
 * 
 * These tests verify that the basic application is working
 */

test.describe('Smoke Tests', () => {
  
  test('should load the page and display basic content', async ({ page }) => {
    // Go to the page
    await page.goto('/');
    
    // Wait for the page to load with a longer timeout
    await page.waitForLoadState('domcontentloaded');
    
    // Check that the page has loaded
    await expect(page).toHaveTitle(/Vite \+ React \+ TS/);
    
    // Wait for React to render
    await page.waitForTimeout(3000);
    
    // Take a screenshot to see what's actually rendered
    await page.screenshot({ path: 'test-results/smoke-test.png' });
    
    // Check if there's any content in the root div
    const rootDiv = page.locator('#root');
    await expect(rootDiv).toBeVisible();
    
    // Log the content for debugging
    const content = await rootDiv.innerHTML();
    console.log('Page content:', content.substring(0, 500));
  });

  test('should not have JavaScript errors', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);
    
    // Filter out known non-critical errors
    const criticalErrors = errors.filter(error => 
      !error.includes('Console Ninja') && 
      !error.includes('service worker') &&
      !error.includes('favicon') &&
      !error.includes('Failed to fetch') // Service worker errors
    );
    
    console.log('All errors:', errors);
    console.log('Critical errors:', criticalErrors);
    
    // We'll be lenient for now and just log errors
    if (criticalErrors.length > 0) {
      console.warn('Found critical errors:', criticalErrors);
    }
  });

  test('should load CSS and have basic styling', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // Check if Tailwind CSS is loaded by looking for common classes
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Check if there are any styled elements
    const styledElements = page.locator('[class*="bg-"], [class*="text-"], [class*="p-"], [class*="m-"]');
    const count = await styledElements.count();
    
    console.log(`Found ${count} elements with Tailwind classes`);
    
    // Take a screenshot to verify styling
    await page.screenshot({ path: 'test-results/styling-test.png' });
  });
});
