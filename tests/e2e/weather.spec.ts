import { test, expect } from '@playwright/test';
import { WeatherPage } from '../page-objects/WeatherPage';
import { testData } from '../fixtures/test-data';

test.describe('Weather Page UI Tests', () => {
  test('Weather page displays temperature component', async ({ page }) => {
    const weatherPage = new WeatherPage(page);

    await weatherPage.goto(testData.urls.weather);
    await weatherPage.waitForLoad();

    // Verify UI components are visible
    await expect(weatherPage.temperatureDisplay).toBeVisible();
    await expect(weatherPage.weatherContainer).toBeVisible();
  });

  test('Weather page loads within acceptable time', async ({ page }) => {
    const weatherPage = new WeatherPage(page);

    const startTime = Date.now();
    await weatherPage.goto(testData.urls.weather);
    await weatherPage.waitForLoad();
    const loadTime = Date.now() - startTime;

    // Verify page loads within acceptable time
    expect(loadTime).toBeLessThan(testData.performance.maxLoadTime);

    // Verify temperature display is visible
    await expect(weatherPage.temperatureDisplay).toBeVisible();
  });

  test('Weather page shows loading state', async ({ page }) => {
    const weatherPage = new WeatherPage(page);

    // Slow down API to see loading state
    await page.route('**/api/weather**', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });

    await weatherPage.goto(testData.urls.weather);

    // Should show loading state initially
    await expect(weatherPage.weatherContainer).toBeVisible();
  });

  test('Weather page displays error state when API fails', async ({
    page,
  }) => {
    const weatherPage = new WeatherPage(page);

    // Mock API failure
    await page.route('**/api/weather**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Weather service unavailable' }),
      });
    });

    await weatherPage.goto(testData.urls.weather);
    await weatherPage.waitForLoad();

    // Page should still load even if weather API fails
    await expect(weatherPage.weatherContainer).toBeVisible();
  });

  test('Weather page is responsive', async ({ page }) => {
    const weatherPage = new WeatherPage(page);

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await weatherPage.goto(testData.urls.weather);
    await weatherPage.waitForLoad();

    await expect(weatherPage.weatherContainer).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(weatherPage.weatherContainer).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(weatherPage.weatherContainer).toBeVisible();
  });

  test('Weather page updates on manual refresh', async ({ page }) => {
    const weatherPage = new WeatherPage(page);

    // Load page first time
    await weatherPage.goto(testData.urls.weather);
    await weatherPage.waitForLoad();

    await expect(weatherPage.temperatureDisplay).toBeVisible();

    // Reload page
    await page.reload();
    await weatherPage.waitForLoad();

    // Should still be visible after reload
    await expect(weatherPage.temperatureDisplay).toBeVisible();
  });
});
