import { test, expect } from '@playwright/test';
import { HomePage } from '../page-objects/HomePage';
import { WeatherPage } from '../page-objects/WeatherPage';
import { TestHelpers } from '../utils/test-helpers';
import { testData } from '../fixtures/test-data';

test.describe('Performance Regression Tests', () => {
  test('Homepage loads within performance budget', async ({ page }) => {
    const homePage = new HomePage(page);

    // Start performance measurement
    await page.goto(testData.urls.home);
    await homePage.waitForLoad();

    // Measure performance metrics
    const metrics = await TestHelpers.validatePagePerformance(page);

    // Verify performance thresholds
    expect(metrics.loadTime).toBeLessThan(testData.performance.maxLoadTime);
    expect(metrics.domContentLoaded).toBeLessThan(
      testData.performance.maxDomContentLoaded
    );
    expect(metrics.firstPaint).toBeLessThan(testData.performance.maxFirstPaint);
  });

  test('Weather page loads within performance budget', async ({ page }) => {
    const weatherPage = new WeatherPage(page);

    // Start performance measurement
    await page.goto(testData.urls.weather);
    await weatherPage.waitForLoad();

    // Measure performance metrics
    const metrics = await TestHelpers.validatePagePerformance(page);

    // Verify performance thresholds
    expect(metrics.loadTime).toBeLessThan(testData.performance.maxLoadTime);
    expect(metrics.domContentLoaded).toBeLessThan(
      testData.performance.maxDomContentLoaded
    );
  });

  test('No console errors on page load', async ({ page }) => {
    const homePage = new HomePage(page);

    // Set up error collection
    const consoleErrors = await TestHelpers.checkConsoleErrors(page);
    const networkErrors = await TestHelpers.checkNetworkErrors(page);

    await homePage.goto(testData.urls.home);
    await homePage.waitForLoad();

    // Verify no console errors
    expect(consoleErrors).toHaveLength(0);
    expect(networkErrors).toHaveLength(0);
  });

  // Memory usage test removed due to browser compatibility issues

  test('Page handles slow network conditions', async ({ page }) => {
    const homePage = new HomePage(page);

    // Simulate slow 3G network
    await page.route('**/*', route => {
      // Add delay to simulate slow network
      setTimeout(() => route.continue(), 1000);
    });

    const startTime = Date.now();
    await homePage.goto(testData.urls.home);
    await homePage.waitForLoad();
    const loadTime = Date.now() - startTime;

    // Page should still load within reasonable time even with slow network
    expect(loadTime).toBeLessThan(15000); // 15 seconds max for slow network

    // Verify page still functions correctly
    await expect(homePage.appContainer).toBeVisible();
    await expect(homePage.swantronLink).toBeVisible();
  });

  test('Large viewport performance', async ({ page }) => {
    const homePage = new HomePage(page);

    // Set large viewport
    await page.setViewportSize({ width: 2560, height: 1440 });

    await homePage.goto(testData.urls.home);
    await homePage.waitForLoad();

    // Measure performance on large viewport
    const metrics = await TestHelpers.validatePagePerformance(page);

    // Should still meet performance requirements
    expect(metrics.loadTime).toBeLessThan(testData.performance.maxLoadTime);
    expect(metrics.domContentLoaded).toBeLessThan(
      testData.performance.maxDomContentLoaded
    );
  });
});
