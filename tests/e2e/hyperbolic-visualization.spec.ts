import { test, expect } from '@playwright/test';

/**
 * Hyperbolic Visualization Tests
 * 
 * Tests the interactive Poincaré disk visualization and geometric controls
 */

test.describe('Hyperbolic Visualization', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Navigate to the demo section
    await page.locator('#demo').scrollIntoViewIfNeeded();
  });

  test('should display Poincaré disk visualization', async ({ page }) => {
    // Check for visualization section
    await expect(page.locator('text=Interactive Hyperbolic Visualization')).toBeVisible();
    
    // Check for canvas element
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // Canvas should have reasonable dimensions
    const boundingBox = await canvas.boundingBox();
    expect(boundingBox).toBeTruthy();
    if (boundingBox) {
      expect(boundingBox.width).toBeGreaterThan(200);
      expect(boundingBox.height).toBeGreaterThan(200);
    }
  });

  test('should have functional visualization controls', async ({ page }) => {
    // Check for control buttons
    const tilingButton = page.locator('button:has-text("Tiling")');
    const geodesicsButton = page.locator('button:has-text("Geodesics")');
    
    await expect(tilingButton).toBeVisible();
    await expect(geodesicsButton).toBeVisible();
    
    // Test toggling tiling
    const initialTilingState = await tilingButton.getAttribute('class');
    await tilingButton.click();
    
    // Wait for state change
    await page.waitForTimeout(500);
    
    const newTilingState = await tilingButton.getAttribute('class');
    expect(newTilingState).not.toBe(initialTilingState);
    
    // Test toggling geodesics
    const initialGeodesicsState = await geodesicsButton.getAttribute('class');
    await geodesicsButton.click();
    
    await page.waitForTimeout(500);
    
    const newGeodesicsState = await geodesicsButton.getAttribute('class');
    expect(newGeodesicsState).not.toBe(initialGeodesicsState);
  });

  test('should have working geometry controls', async ({ page }) => {
    // Check for geometry mode selector
    const geometrySelect = page.locator('select');
    await expect(geometrySelect).toBeVisible();
    
    // Test changing geometry modes
    await geometrySelect.selectOption('euclidean');
    await expect(geometrySelect).toHaveValue('euclidean');
    
    await geometrySelect.selectOption('hyperbolic');
    await expect(geometrySelect).toHaveValue('hyperbolic');
    
    await geometrySelect.selectOption('adaptive');
    await expect(geometrySelect).toHaveValue('adaptive');
    
    // Check curvature slider
    const curvatureSlider = page.locator('input[type="range"]');
    await expect(curvatureSlider).toBeVisible();
    
    // Test slider interaction
    await curvatureSlider.fill('-1.5');
    await expect(curvatureSlider).toHaveValue('-1.5');
    
    // Slider should be disabled in adaptive mode
    await geometrySelect.selectOption('adaptive');
    await expect(curvatureSlider).toBeDisabled();
    
    // Re-enable for other modes
    await geometrySelect.selectOption('hyperbolic');
    await expect(curvatureSlider).toBeEnabled();
  });

  test('should display curvature value', async ({ page }) => {
    // Check for curvature display
    const curvatureLabel = page.locator('text=Curvature:');
    await expect(curvatureLabel).toBeVisible();
    
    // Should show current curvature value
    const curvatureValue = page.locator('text=Curvature:').locator('..').locator('text=/-\\d+\\.\\d+/');
    await expect(curvatureValue).toBeVisible();
  });

  test('should have interactive canvas features', async ({ page }) => {
    const canvas = page.locator('canvas');
    
    // Check for interaction hints
    await expect(page.locator('text=Click and drag points')).toBeVisible();
    await expect(page.locator('text=Scroll to zoom')).toBeVisible();
    await expect(page.locator('text=Drag to pan')).toBeVisible();
    
    // Test canvas interaction (basic click)
    const canvasBounds = await canvas.boundingBox();
    if (canvasBounds) {
      const centerX = canvasBounds.x + canvasBounds.width / 2;
      const centerY = canvasBounds.y + canvasBounds.height / 2;
      
      // Click on canvas center
      await page.mouse.click(centerX, centerY);
      
      // Canvas should still be visible after interaction
      await expect(canvas).toBeVisible();
    }
  });

  test('should handle training network functionality', async ({ page }) => {
    // Check for training button
    const trainButton = page.locator('button:has-text("Train Network")');
    await expect(trainButton).toBeVisible();
    await expect(trainButton).toBeEnabled();
    
    // Click train button
    await trainButton.click();
    
    // Should show training state
    await expect(page.locator('text=Training')).toBeVisible({ timeout: 5000 });
    
    // Wait for training to complete or timeout
    await expect(trainButton).not.toContainText('Training', { timeout: 30000 });
    
    // Button should be enabled again after training
    await expect(trainButton).toBeEnabled();
  });

  test('should display training progress when available', async ({ page }) => {
    // Look for training progress section
    const progressSection = page.locator('text=Training Progress');
    
    if (await progressSection.isVisible()) {
      // Check for progress metrics
      await expect(page.locator('text=Epochs:')).toBeVisible();
      await expect(page.locator('text=Final Loss:')).toBeVisible();
      await expect(page.locator('text=Geometric Loss:')).toBeVisible();
    }
  });

  test('should generate new data on demand', async ({ page }) => {
    // Check for generate data button
    const generateButton = page.locator('button:has-text("Generate Data")');
    await expect(generateButton).toBeVisible();
    
    // Click generate data
    await generateButton.click();
    
    // Button should remain functional
    await expect(generateButton).toBeVisible();
    await expect(generateButton).toBeEnabled();
    
    // Canvas should still be visible (data should be rendered)
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('should display mathematical foundations', async ({ page }) => {
    // Check for mathematical foundation section
    await expect(page.locator('text=Mathematical Foundation')).toBeVisible();
    
    // Check for specific mathematical concepts
    await expect(page.locator('text=Möbius Addition')).toBeVisible();
    await expect(page.locator('text=Hyperbolic Distance')).toBeVisible();
    await expect(page.locator('text=Geometric Attention')).toBeVisible();
    
    // Check for mathematical formulas
    await expect(page.locator('text=⊕')).toBeVisible(); // Möbius addition symbol
    await expect(page.locator('text=artanh')).toBeVisible(); // Hyperbolic function
    await expect(page.locator('text=exp')).toBeVisible(); // Exponential function
  });

  test('should be responsive on different screen sizes', async ({ page }) => {
    // Test on different viewport sizes
    await page.setViewportSize({ width: 1200, height: 800 });
    
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // Test mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(canvas).toBeVisible();
    
    // Controls should still be accessible
    await expect(page.locator('button:has-text("Tiling")')).toBeVisible();
    await expect(page.locator('button:has-text("Geodesics")')).toBeVisible();
    
    // Test tablet size
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(canvas).toBeVisible();
  });

  test('should handle canvas resize properly', async ({ page }) => {
    const canvas = page.locator('canvas');
    
    // Get initial canvas size
    const initialBounds = await canvas.boundingBox();
    expect(initialBounds).toBeTruthy();
    
    // Resize viewport
    await page.setViewportSize({ width: 800, height: 600 });
    
    // Canvas should still be visible and properly sized
    await expect(canvas).toBeVisible();
    
    const newBounds = await canvas.boundingBox();
    expect(newBounds).toBeTruthy();
    
    // Canvas should adapt to new size
    if (initialBounds && newBounds) {
      // Canvas dimensions should be reasonable for the new viewport
      expect(newBounds.width).toBeGreaterThan(100);
      expect(newBounds.height).toBeGreaterThan(100);
    }
  });
});

test.describe('Visualization Performance', () => {
  
  test('should render canvas without performance issues', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Navigate to demo section
    await page.locator('#demo').scrollIntoViewIfNeeded();
    
    const startTime = Date.now();
    
    // Perform multiple interactions quickly
    const generateButton = page.locator('button:has-text("Generate Data")');
    
    for (let i = 0; i < 3; i++) {
      await generateButton.click();
      await page.waitForTimeout(100);
    }
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    // Should handle multiple rapid interactions within reasonable time
    expect(totalTime).toBeLessThan(5000);
    
    // Canvas should still be responsive
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('should handle geometry mode changes smoothly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.locator('#demo').scrollIntoViewIfNeeded();
    
    const geometrySelect = page.locator('select');
    
    // Rapidly change geometry modes
    await geometrySelect.selectOption('euclidean');
    await page.waitForTimeout(100);
    
    await geometrySelect.selectOption('hyperbolic');
    await page.waitForTimeout(100);
    
    await geometrySelect.selectOption('adaptive');
    await page.waitForTimeout(100);
    
    await geometrySelect.selectOption('hyperbolic');
    
    // Should still be functional
    await expect(geometrySelect).toHaveValue('hyperbolic');
    
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });
});

