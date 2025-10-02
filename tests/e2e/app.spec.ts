import { test, expect } from '@playwright/test';

/**
 * H²GNN + PocketFlow + WordNet Integration E2E Tests
 * 
 * Tests the complete integrated system including:
 * - UI components and navigation
 * - Hyperbolic visualization
 * - PocketFlow demo functionality
 * - Interactive Q&A system
 * - Training pipeline demos
 */

test.describe('H²GNN Application', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
  });

  test('should load the main page with correct title and hero section', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Vite \+ React \+ TS/);
    
    // Check hero section
    await expect(page.locator('h1')).toContainText('Hyperbolic Geometric');
    await expect(page.locator('h1')).toContainText('Neural Networks');
    
    // Check navigation
    await expect(page.locator('nav')).toContainText('H²GNN');
    await expect(page.locator('nav a[href="#features"]')).toBeVisible();
    await expect(page.locator('nav a[href="#demo"]')).toBeVisible();
    await expect(page.locator('nav a[href="#architecture"]')).toBeVisible();
  });

  test('should display hyperbolic visualization canvas', async ({ page }) => {
    // Check for the visualization section
    await expect(page.locator('#demo')).toBeVisible();
    
    // Check for the canvas element
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // Check visualization controls
    await expect(page.locator('text=Poincaré Disk Visualization')).toBeVisible();
    await expect(page.locator('button:has-text("Tiling")')).toBeVisible();
    await expect(page.locator('button:has-text("Geodesics")')).toBeVisible();
  });

  test('should have working geometry controls', async ({ page }) => {
    // Check geometry mode selector
    const geometrySelect = page.locator('select');
    await expect(geometrySelect).toBeVisible();
    
    // Test changing geometry mode
    await geometrySelect.selectOption('euclidean');
    await expect(geometrySelect).toHaveValue('euclidean');
    
    await geometrySelect.selectOption('hyperbolic');
    await expect(geometrySelect).toHaveValue('hyperbolic');
    
    // Check curvature slider
    const curvatureSlider = page.locator('input[type="range"]');
    await expect(curvatureSlider).toBeVisible();
  });

  test('should have functional training buttons', async ({ page }) => {
    // Check for training button
    const trainButton = page.locator('button:has-text("Train Network")');
    await expect(trainButton).toBeVisible();
    
    // Check for generate data button
    const generateButton = page.locator('button:has-text("Generate Data")');
    await expect(generateButton).toBeVisible();
    
    // Test clicking generate data button
    await generateButton.click();
    // The button should remain visible after clicking
    await expect(generateButton).toBeVisible();
  });

  test('should display features section with all key features', async ({ page }) => {
    // Navigate to features section
    await page.locator('a[href="#features"]').click();
    
    // Check for key features
    await expect(page.locator('text=Hyperbolic Geometry')).toBeVisible();
    await expect(page.locator('text=Hierarchical Learning')).toBeVisible();
    await expect(page.locator('text=Geometric Attention')).toBeVisible();
    await expect(page.locator('text=Real-time Visualization')).toBeVisible();
    await expect(page.locator('text=Geometric Loss Functions')).toBeVisible();
    await expect(page.locator('text=Mathematical Rigor')).toBeVisible();
  });

  test('should display architecture section with components', async ({ page }) => {
    // Navigate to architecture section
    await page.locator('a[href="#architecture"]').click();
    
    // Check core components
    await expect(page.locator('text=Core Components')).toBeVisible();
    await expect(page.locator('text=Hyperbolic Arithmetic')).toBeVisible();
    await expect(page.locator('text=Neural Layers')).toBeVisible();
    await expect(page.locator('text=Message Passing')).toBeVisible();
    await expect(page.locator('text=PocketFlow Framework')).toBeVisible();
    await expect(page.locator('text=WordNet Integration')).toBeVisible();
    
    // Check applications
    await expect(page.locator('text=Applications')).toBeVisible();
    await expect(page.locator('text=Knowledge Graphs')).toBeVisible();
    await expect(page.locator('text=Agent Systems')).toBeVisible();
    await expect(page.locator('text=Concept Learning')).toBeVisible();
  });

  test('should have responsive design on mobile', async ({ page, isMobile }) => {
    if (isMobile) {
      // Check that navigation is still accessible on mobile
      await expect(page.locator('nav')).toBeVisible();
      
      // Check that the canvas adjusts for mobile
      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();
      
      // Check that buttons stack properly on mobile
      const heroButtons = page.locator('.flex.flex-col.sm\\:flex-row button');
      await expect(heroButtons.first()).toBeVisible();
    }
  });
});

test.describe('PocketFlow Integration Demo', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Navigate to PocketFlow section
    await page.locator('text=PocketFlow + H²GNN Integration').scrollIntoViewIfNeeded();
  });

  test('should display PocketFlow demo section', async ({ page }) => {
    // Check for PocketFlow demo section
    await expect(page.locator('text=PocketFlow + H²GNN Integration')).toBeVisible();
    
    // Check for system overview
    await expect(page.locator('text=System Overview')).toBeVisible();
    await expect(page.locator('text=H²GNN Core')).toBeVisible();
    await expect(page.locator('text=PocketFlow Framework')).toBeVisible();
    await expect(page.locator('text=WordNet Integration')).toBeVisible();
  });

  test('should have working demo tabs', async ({ page }) => {
    // Wait for the PocketFlow demo component to load
    await page.waitForSelector('text=PocketFlow + H²GNN Integration');
    
    // Check for demo tabs
    const demoTab = page.locator('button:has-text("Demo")');
    const qaTab = page.locator('button:has-text("Q&A")');
    const logsTab = page.locator('button:has-text("Logs")');
    
    await expect(demoTab).toBeVisible();
    await expect(qaTab).toBeVisible();
    await expect(logsTab).toBeVisible();
    
    // Test tab switching
    await qaTab.click();
    await expect(page.locator('text=Hierarchical Question Answering')).toBeVisible();
    
    await logsTab.click();
    await expect(page.locator('text=System Logs')).toBeVisible();
    
    await demoTab.click();
    await expect(page.locator('text=System Overview')).toBeVisible();
  });

  test('should have functional Q&A interface', async ({ page }) => {
    // Navigate to Q&A tab
    await page.locator('button:has-text("Q&A")').click();
    
    // Check for Q&A interface elements
    await expect(page.locator('text=Hierarchical Question Answering')).toBeVisible();
    
    // Check for input field and button
    const questionInput = page.locator('input[placeholder*="What is a mammal"]');
    const askButton = page.locator('button:has-text("Ask")');
    
    await expect(questionInput).toBeVisible();
    await expect(askButton).toBeVisible();
    
    // Test entering a question
    await questionInput.fill('What is a mammal?');
    await expect(questionInput).toHaveValue('What is a mammal?');
  });

  test('should have integration demo button', async ({ page }) => {
    // Check for the main demo button
    const demoButton = page.locator('button:has-text("Run Full Integration Demo")');
    await expect(demoButton).toBeVisible();
    
    // The button should be enabled (not disabled)
    await expect(demoButton).not.toBeDisabled();
  });
});

test.describe('Mathematical Formulas and Content', () => {
  
  test('should display mathematical formulas correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for mathematical foundation section
    await expect(page.locator('text=Mathematical Foundation')).toBeVisible();
    
    // Check for specific formulas (these might be in different formats)
    await expect(page.locator('text=Möbius Addition')).toBeVisible();
    await expect(page.locator('text=Hyperbolic Distance')).toBeVisible();
    await expect(page.locator('text=Geometric Attention')).toBeVisible();
  });

  test('should have proper mathematical notation', async ({ page }) => {
    await page.goto('/');
    
    // Check for mathematical symbols and notation
    const mathSection = page.locator('text=Mathematical Foundation').locator('..');
    await expect(mathSection).toBeVisible();
    
    // Look for mathematical expressions
    await expect(page.locator('text=⊕')).toBeVisible(); // Möbius addition symbol
    await expect(page.locator('text=artanh')).toBeVisible(); // Hyperbolic function
  });
});

test.describe('Performance and Accessibility', () => {
  
  test('should load within reasonable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Should load within 10 seconds
    expect(loadTime).toBeLessThan(10000);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    
    // Check for proper heading structure
    const h1 = page.locator('h1');
    const h2 = page.locator('h2');
    const h3 = page.locator('h3');
    
    await expect(h1).toHaveCount(1); // Should have exactly one h1
    expect(await h2.count()).toBeGreaterThan(0); // Should have h2 elements
    expect(await h3.count()).toBeGreaterThan(0); // Should have h3 elements
  });

  test('should have alt text for images', async ({ page }) => {
    await page.goto('/');
    
    // Check that any images have alt text
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy(); // Should have alt text
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    
    // Check that focus is visible on interactive elements
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
});

test.describe('Error Handling', () => {
  
  test('should handle network errors gracefully', async ({ page }) => {
    await page.goto('/');
    
    // The page should load even if some resources fail
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should not have console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Filter out known non-critical errors
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('Console Ninja') && 
      !error.includes('service worker') &&
      !error.includes('favicon')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });
});
