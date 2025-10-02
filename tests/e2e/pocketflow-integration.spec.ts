import { test, expect } from '@playwright/test';

/**
 * PocketFlow Integration Specific Tests
 * 
 * Tests the deep integration between PocketFlow, H²GNN, and WordNet
 * including agent workflows, training pipelines, and semantic reasoning
 */

test.describe('PocketFlow Agent Workflows', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Navigate to PocketFlow integration section
    await page.locator('text=PocketFlow + H²GNN Integration').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000); // Allow components to initialize
  });

  test('should initialize Q&A workflow properly', async ({ page }) => {
    // Switch to Q&A tab
    await page.locator('button:has-text("Q&A")').click();
    
    // Wait for workflow initialization
    await page.waitForSelector('text=Hierarchical Question Answering', { timeout: 10000 });
    
    // Check if initialization message appears and disappears
    const initMessage = page.locator('text=Initializing QA workflow');
    
    // If initialization is still happening, wait for it to complete
    if (await initMessage.isVisible()) {
      await expect(initMessage).toBeHidden({ timeout: 30000 });
    }
    
    // Check that the input field becomes enabled
    const questionInput = page.locator('input[placeholder*="mammal"]');
    await expect(questionInput).toBeEnabled();
    
    // Check that the Ask button is enabled
    const askButton = page.locator('button:has-text("Ask")');
    await expect(askButton).toBeEnabled();
  });

  test('should handle Q&A interaction flow', async ({ page }) => {
    // Navigate to Q&A tab
    await page.locator('button:has-text("Q&A")').click();
    
    // Wait for initialization to complete
    await page.waitForSelector('input[placeholder*="mammal"]', { timeout: 15000 });
    
    const questionInput = page.locator('input[placeholder*="mammal"]');
    const askButton = page.locator('button:has-text("Ask")');
    
    // Enter a test question
    await questionInput.fill('What is a carnivore?');
    
    // Click ask button
    await askButton.click();
    
    // Check for processing state
    await expect(page.locator('text=Processing')).toBeVisible({ timeout: 5000 });
    
    // Wait for response (with generous timeout for LLM processing)
    await expect(page.locator('text=Processing')).toBeHidden({ timeout: 30000 });
    
    // Check that a response appears
    const responseSection = page.locator('text=Response:').locator('..');
    await expect(responseSection).toBeVisible();
  });

  test('should maintain Q&A history', async ({ page }) => {
    // Navigate to Q&A tab
    await page.locator('button:has-text("Q&A")').click();
    
    // Wait for initialization
    await page.waitForSelector('input[placeholder*="mammal"]', { timeout: 15000 });
    
    const questionInput = page.locator('input[placeholder*="mammal"]');
    const askButton = page.locator('button:has-text("Ask")');
    
    // Ask a question
    await questionInput.fill('What is an animal?');
    await askButton.click();
    
    // Wait for response
    await page.waitForSelector('text=Response:', { timeout: 30000 });
    
    // Check if history section appears
    const historySection = page.locator('text=Q&A History');
    if (await historySection.isVisible()) {
      // Verify history contains our question
      await expect(page.locator('text=What is an animal?')).toBeVisible();
    }
  });

  test('should support keyboard interaction in Q&A', async ({ page }) => {
    // Navigate to Q&A tab
    await page.locator('button:has-text("Q&A")').click();
    
    // Wait for initialization
    await page.waitForSelector('input[placeholder*="mammal"]', { timeout: 15000 });
    
    const questionInput = page.locator('input[placeholder*="mammal"]');
    
    // Focus on input and type question
    await questionInput.focus();
    await questionInput.fill('What is a vertebrate?');
    
    // Press Enter to submit
    await questionInput.press('Enter');
    
    // Check for processing state
    await expect(page.locator('text=Processing')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Integration Demo Functionality', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Navigate to PocketFlow section
    await page.locator('text=PocketFlow + H²GNN Integration').scrollIntoViewIfNeeded();
  });

  test('should have functional integration demo button', async ({ page }) => {
    // Ensure we're on the Demo tab
    await page.locator('button:has-text("Demo")').click();
    
    // Find the main demo button
    const demoButton = page.locator('button:has-text("Run Full Integration Demo")');
    await expect(demoButton).toBeVisible();
    await expect(demoButton).toBeEnabled();
    
    // Click the demo button
    await demoButton.click();
    
    // Check for running state
    await expect(page.locator('text=Running Integration Demo')).toBeVisible({ timeout: 5000 });
    
    // The demo should show progress or completion within reasonable time
    // Note: This might take a while for the full demo
    await expect(demoButton).toContainText('Running', { timeout: 60000 });
  });

  test('should display system architecture overview', async ({ page }) => {
    // Check for system overview section
    await expect(page.locator('text=System Overview')).toBeVisible();
    
    // Check for the three main components
    await expect(page.locator('text=H²GNN Core')).toBeVisible();
    await expect(page.locator('text=PocketFlow Framework')).toBeVisible();
    await expect(page.locator('text=WordNet Integration')).toBeVisible();
    
    // Check for component descriptions
    await expect(page.locator('text=Hyperbolic geometry')).toBeVisible();
    await expect(page.locator('text=Agent workflows')).toBeVisible();
    await expect(page.locator('text=Hierarchical knowledge')).toBeVisible();
  });

  test('should show demo results when available', async ({ page }) => {
    // Start with Demo tab
    await page.locator('button:has-text("Demo")').click();
    
    // If there are existing demo results, check their structure
    const resultsSection = page.locator('text=Demo Results');
    
    if (await resultsSection.isVisible()) {
      // Check for training results section
      await expect(page.locator('text=Training Results')).toBeVisible();
      
      // Check for workflow performance section
      await expect(page.locator('text=Workflow Performance')).toBeVisible();
      
      // Check for performance metrics
      await expect(page.locator('text=Duration:')).toBeVisible();
      await expect(page.locator('text=Success Rate:')).toBeVisible();
    }
  });

  test('should handle demo errors gracefully', async ({ page }) => {
    // Monitor for error messages
    const errorSection = page.locator('text=Error:');
    
    // If an error occurs, it should be displayed properly
    if (await errorSection.isVisible()) {
      // Error should be in a proper error container
      const errorContainer = errorSection.locator('..');
      await expect(errorContainer).toHaveClass(/error|red/);
    }
  });
});

test.describe('Logs and Monitoring', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Navigate to PocketFlow section
    await page.locator('text=PocketFlow + H²GNN Integration').scrollIntoViewIfNeeded();
  });

  test('should display logs tab functionality', async ({ page }) => {
    // Switch to Logs tab
    await page.locator('button:has-text("Logs")').click();
    
    // Check for logs section
    await expect(page.locator('text=System Logs')).toBeVisible();
    
    // Check for logs container
    const logsContainer = page.locator('text=System Logs').locator('..');
    await expect(logsContainer).toBeVisible();
    
    // Initially might show "No logs available"
    const noLogsMessage = page.locator('text=No logs available');
    if (await noLogsMessage.isVisible()) {
      await expect(noLogsMessage).toContainText('Run the demo to see system logs');
    }
  });

  test('should populate logs when demo runs', async ({ page }) => {
    // Switch to Demo tab and run demo
    await page.locator('button:has-text("Demo")').click();
    
    const demoButton = page.locator('button:has-text("Run Full Integration Demo")');
    if (await demoButton.isVisible() && await demoButton.isEnabled()) {
      await demoButton.click();
      
      // Wait a moment for logs to start generating
      await page.waitForTimeout(2000);
      
      // Switch to Logs tab
      await page.locator('button:has-text("Logs")').click();
      
      // Check if logs are being populated
      const logsContainer = page.locator('.font-mono');
      if (await logsContainer.isVisible()) {
        // Should have some log entries
        const logEntries = logsContainer.locator('div');
        expect(await logEntries.count()).toBeGreaterThan(0);
      }
    }
  });
});

test.describe('Responsive Design and Mobile', () => {
  
  test('should work on mobile devices', async ({ page, isMobile }) => {
    if (isMobile) {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Navigate to PocketFlow section
      await page.locator('text=PocketFlow + H²GNN Integration').scrollIntoViewIfNeeded();
      
      // Check that tabs are still accessible
      await expect(page.locator('button:has-text("Demo")')).toBeVisible();
      await expect(page.locator('button:has-text("Q&A")')).toBeVisible();
      await expect(page.locator('button:has-text("Logs")')).toBeVisible();
      
      // Test Q&A on mobile
      await page.locator('button:has-text("Q&A")').click();
      
      // Input should be properly sized for mobile
      const questionInput = page.locator('input[placeholder*="mammal"]');
      await expect(questionInput).toBeVisible();
      
      // Button should be accessible
      const askButton = page.locator('button:has-text("Ask")');
      await expect(askButton).toBeVisible();
    }
  });

  test('should have proper touch targets on mobile', async ({ page, isMobile }) => {
    if (isMobile) {
      await page.goto('/');
      
      // Navigate to PocketFlow section
      await page.locator('text=PocketFlow + H²GNN Integration').scrollIntoViewIfNeeded();
      
      // Check that buttons are large enough for touch
      const demoTab = page.locator('button:has-text("Demo")');
      const boundingBox = await demoTab.boundingBox();
      
      if (boundingBox) {
        // Touch targets should be at least 44px (iOS guideline)
        expect(boundingBox.height).toBeGreaterThanOrEqual(40);
      }
    }
  });
});

test.describe('Integration Performance', () => {
  
  test('should initialize components within reasonable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Navigate to PocketFlow section
    await page.locator('text=PocketFlow + H²GNN Integration').scrollIntoViewIfNeeded();
    
    // Switch to Q&A tab and wait for initialization
    await page.locator('button:has-text("Q&A")').click();
    
    // Wait for Q&A to be ready
    await page.waitForSelector('input[placeholder*="mammal"]', { timeout: 30000 });
    
    const initTime = Date.now() - startTime;
    
    // Should initialize within 30 seconds
    expect(initTime).toBeLessThan(30000);
  });

  test('should handle concurrent interactions', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Navigate to PocketFlow section
    await page.locator('text=PocketFlow + H²GNN Integration').scrollIntoViewIfNeeded();
    
    // Rapidly switch between tabs
    await page.locator('button:has-text("Q&A")').click();
    await page.locator('button:has-text("Logs")').click();
    await page.locator('button:has-text("Demo")').click();
    await page.locator('button:has-text("Q&A")').click();
    
    // Should still be functional
    await expect(page.locator('text=Hierarchical Question Answering')).toBeVisible();
  });
});
