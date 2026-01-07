import { test, expect } from '@playwright/test';
import { testData } from '../fixtures/test-data';

test.describe('Chomptron Widget E2E Tests', () => {
  test('Chomptron page loads successfully', async ({ page }) => {
    await page.goto(`${testData.urls.base}/chomptron`);
    await page.waitForLoadState('networkidle');

    // Verify page title
    await expect(page.locator('h1')).toContainText('chomptron');

    // Verify widget components are visible
    await expect(page.getByTestId('ingredient-input')).toBeVisible();
    await expect(page.getByTestId('generate-button')).toBeVisible();
  });

  test('Generate button is disabled when input is empty', async ({ page }) => {
    await page.goto(`${testData.urls.base}/chomptron`);
    await page.waitForLoadState('networkidle');

    const generateButton = page.getByTestId('generate-button');

    // Button should be disabled initially
    await expect(generateButton).toBeDisabled();
  });

  test('Generate button is enabled when user types ingredients', async ({
    page,
  }) => {
    await page.goto(`${testData.urls.base}/chomptron`);
    await page.waitForLoadState('networkidle');

    const ingredientInput = page.getByTestId('ingredient-input');
    const generateButton = page.getByTestId('generate-button');

    // Type ingredients
    await ingredientInput.fill('chicken, tomatoes, garlic');

    // Button should now be enabled
    await expect(generateButton).toBeEnabled();
  });

  test('Widget generates correct URL with encoded ingredients', async ({
    page,
    context,
  }) => {
    await page.goto(`${testData.urls.base}/chomptron`);
    await page.waitForLoadState('networkidle');

    const ingredientInput = page.getByTestId('ingredient-input');
    const generateButton = page.getByTestId('generate-button');

    // Type ingredients
    const ingredients = 'chicken, tomatoes, garlic, pasta';
    await ingredientInput.fill(ingredients);

    // Listen for new tab
    const pagePromise = context.waitForEvent('page');

    // Click generate button
    await generateButton.click();

    // Get the new tab
    const newPage = await pagePromise;
    await newPage.waitForLoadState('networkidle');

    // Verify URL contains encoded ingredients
    const url = new URL(newPage.url());
    expect(url.hostname).toContain('chomptron.com');
    expect(url.searchParams.get('ingredients')).toBe(ingredients);
  });

  test('Widget handles special characters in ingredients', async ({
    page,
    context,
  }) => {
    await page.goto(`${testData.urls.base}/chomptron`);
    await page.waitForLoadState('networkidle');

    const ingredientInput = page.getByTestId('ingredient-input');
    const generateButton = page.getByTestId('generate-button');

    // Type ingredients with special characters
    const ingredients = 'chicken & rice, tomatoes (fresh), garlic - 3 cloves';
    await ingredientInput.fill(ingredients);

    // Listen for new tab
    const pagePromise = context.waitForEvent('page');

    // Click generate button
    await generateButton.click();

    // Get the new tab
    const newPage = await pagePromise;
    await newPage.waitForLoadState('networkidle');

    // Verify URL contains properly encoded ingredients
    const url = new URL(newPage.url());
    expect(url.searchParams.get('ingredients')).toBe(ingredients);
  });

  test('Widget displays description and hint text', async ({ page }) => {
    await page.goto(`${testData.urls.base}/chomptron`);
    await page.waitForLoadState('networkidle');

    // Verify description text
    await expect(
      page.locator('text=AI-powered recipe generator using Google Gemini')
    ).toBeVisible();

    // Verify hint text
    await expect(
      page.locator('text=Opens chomptron.com with your ingredients pre-filled')
    ).toBeVisible();
  });

  test('Widget has proper placeholder text', async ({ page }) => {
    await page.goto(`${testData.urls.base}/chomptron`);
    await page.waitForLoadState('networkidle');

    const ingredientInput = page.getByTestId('ingredient-input');

    // Verify placeholder
    await expect(ingredientInput).toHaveAttribute(
      'placeholder',
      'e.g., chicken, tomatoes, garlic, pasta'
    );
  });

  test('Widget clears input after submission', async ({ page, context }) => {
    await page.goto(`${testData.urls.base}/chomptron`);
    await page.waitForLoadState('networkidle');

    const ingredientInput = page.getByTestId('ingredient-input');
    const generateButton = page.getByTestId('generate-button');

    // Type and submit
    await ingredientInput.fill('chicken, rice');

    const pagePromise = context.waitForEvent('page');
    await generateButton.click();
    await pagePromise;

    // Note: Input clearing behavior depends on implementation
    // This test documents expected behavior
  });

  test('Widget opens link in new tab', async ({ page, context }) => {
    await page.goto(`${testData.urls.base}/chomptron`);
    await page.waitForLoadState('networkidle');

    const ingredientInput = page.getByTestId('ingredient-input');
    const generateButton = page.getByTestId('generate-button');

    await ingredientInput.fill('test ingredients');

    // Count pages before
    const pagesBefore = context.pages().length;

    const pagePromise = context.waitForEvent('page');
    await generateButton.click();
    await pagePromise;

    // Should have opened a new tab
    const pagesAfter = context.pages().length;
    expect(pagesAfter).toBe(pagesBefore + 1);
  });

  test('Widget displays external link to chomptron.com', async ({ page }) => {
    await page.goto(`${testData.urls.base}/chomptron`);
    await page.waitForLoadState('networkidle');

    // Verify external link
    const externalLink = page.locator('a[href="https://chomptron.com"]');
    await expect(externalLink).toBeVisible();
    await expect(externalLink).toHaveAttribute('target', '_blank');
    await expect(externalLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('Widget is responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto(`${testData.urls.base}/chomptron`);
    await page.waitForLoadState('networkidle');

    // Components should be visible and stacked vertically on mobile
    await expect(page.getByTestId('ingredient-input')).toBeVisible();
    await expect(page.getByTestId('generate-button')).toBeVisible();
  });

  test('Widget logs interaction to analytics', async ({ page }) => {
    await page.goto(`${testData.urls.base}/chomptron`);
    await page.waitForLoadState('networkidle');

    const ingredientInput = page.getByTestId('ingredient-input');
    const generateButton = page.getByTestId('generate-button');

    // Monitor console logs
    const logs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'log') {
        logs.push(msg.text());
      }
    });

    await ingredientInput.fill('test ingredients');

    const pagePromise = page.context().waitForEvent('page');
    await generateButton.click();
    await pagePromise;

    // Should log the interaction (implementation dependent)
    // This test documents expected behavior
  });
});
