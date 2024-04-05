const { test, expect } = require('@playwright/test');

test.describe('TronSwan Website Tests', () => {
  test('Homepage should load and contain the swantron.com link', async ({ page }) => {
    // Navigate to your website
    await page.goto('https://tronswan.com');
    // await page.goto('localhost:3000');

    // Check if the specific link element is visible
    await expect(page.locator('a[data-testid="swantron-link"]')).toBeVisible();
    await expect(page.locator('a[data-testid="swantron-link"]')).toHaveAttribute('href', 'https://swantron.com');
    await expect(page.locator('a[data-testid="swantron-link"]')).toContainText('swan tron dot com');
    
    // New check for the temperature display element
    const temperatureDisplay = page.locator('p[data-testid="temperature-display"]');
    await expect(temperatureDisplay).toBeVisible();

    // Update the regex to check if the temperature is between -30°F and 120°F
    await expect(temperatureDisplay).toHaveText(/thermomotron \| (-3[0-9]|-[1-9]|[0-9]|[1-9][0-9]|1[01][0-9]|120)\.\d+°F/);
  });
});
