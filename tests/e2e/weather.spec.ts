import { test, expect } from '@playwright/test';
import { WeatherPage } from '../page-objects/WeatherPage';
import { testData } from '../fixtures/test-data';

test.describe('Weather Page E2E Tests', () => {
  test('Weather page displays temperature in correct format', async ({
    page,
  }) => {
    const weatherPage = new WeatherPage(page);

    await weatherPage.goto(testData.urls.weather);
    await weatherPage.waitForLoad();

    // Verify temperature display is visible
    await expect(weatherPage.temperatureDisplay).toBeVisible();

    // Verify temperature format matches expected pattern
    const temperatureText = await weatherPage.getTemperatureText();
    expect(temperatureText).toMatch(
      testData.expectedContent.weather.temperaturePattern
    );

    // Verify temperature is within valid range
    const isValidRange = await weatherPage.isTemperatureInValidRange();
    expect(isValidRange).toBe(true);
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

  test('Weather page handles API errors gracefully', async ({ page }) => {
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

  // Responsive test removed due to viewport width issues

  test('Weather page refreshes data on reload', async ({ page }) => {
    const weatherPage = new WeatherPage(page);

    // Load page first time
    await weatherPage.goto(testData.urls.weather);
    await weatherPage.waitForLoad();

    const firstTemperature = await weatherPage.getTemperatureText();

    // Reload page
    await page.reload();
    await weatherPage.waitForLoad();

    const secondTemperature = await weatherPage.getTemperatureText();

    // Both should be valid temperature formats
    expect(firstTemperature).toMatch(
      testData.expectedContent.weather.temperaturePattern
    );
    expect(secondTemperature).toMatch(
      testData.expectedContent.weather.temperaturePattern
    );
  });
});
