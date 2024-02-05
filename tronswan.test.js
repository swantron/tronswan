const { test, expect } = require('@playwright/test');

test.describe('TronSwan Website Tests', () => {
  test('Homepage should load and contain the swantron.com link', async ({ page }) => {
    // Navigate to your website
    await page.goto('https://tronswan.com');

    // Check if the specific link element is visible
    // We're using the data-testid attribute for a precise selection
    await expect(page.locator('a[data-testid="swantron-link"]')).toBeVisible();

    // Additional assertion to check the href attribute if needed
    await expect(page.locator('a[data-testid="swantron-link"]')).toHaveAttribute('href', 'https://swantron.com');

    // You can also verify the link text if necessary
    await expect(page.locator('a[data-testid="swantron-link"]')).toContainText('swan tron dot com');
  });
});
