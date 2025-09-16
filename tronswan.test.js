import { test, expect } from '@playwright/test';

test.describe('TronSwan Website Tests', () => {
  test('Homepage should load and contain the swantron.com link', async ({ page }) => {
    // Navigate to your website
    await page.goto('https://tronswan.com');
    // await page.goto('localhost:3000');

    // Check if the specific link element is visible
    await expect(page.locator('a[data-testid="swantron-link"]')).toBeVisible();
    await expect(page.locator('a[data-testid="swantron-link"]')).toHaveAttribute('href', 'https://swantron.com');
    await expect(page.locator('a[data-testid="swantron-link"]')).toContainText('tron swan dot com');
  });

  test('Weather page should display temperature data', async ({ page }) => {
    // Navigate to the weather page
    await page.goto('https://tronswan.com/weather');
    // await page.goto('localhost:3000/weather');

    // Check if the temperature display element is visible
    const temperatureDisplay = page.locator('p[data-testid="temperature-display"]');
    await expect(temperatureDisplay).toBeVisible();

    // Update the regex to check if the temperature is between -30°F and 120°F
    await expect(temperatureDisplay).toHaveText(/thermomotron \| (-3[0-9]|-[1-9]|[0-9]|[1-9][0-9]|1[01][0-9]|120)\.\d+°F/);
  });
});
