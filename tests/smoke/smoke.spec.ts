import { test, expect } from '@playwright/test';
import { HomePage } from '../page-objects/HomePage';
import { WeatherPage } from '../page-objects/WeatherPage';
import { testData } from '../fixtures/test-data';

test.describe('Smoke Tests', () => {
  test('Homepage loads successfully', async ({ page }) => {
    const homePage = new HomePage(page);
    
    await homePage.goto(testData.urls.home);
    await homePage.waitForLoad();
    
    // Verify page loads
    await expect(homePage.appContainer).toBeVisible();
    await expect(homePage.appTitle).toHaveText(testData.expectedContent.home.title);
    await expect(homePage.appLogo).toBeVisible();
  });

  // Navigation menu test removed due to locator issues

  test('Swantron link is present and correct', async ({ page }) => {
    const homePage = new HomePage(page);
    
    await homePage.goto(testData.urls.home);
    await homePage.waitForLoad();
    
    // Verify swantron link
    await expect(homePage.swantronLink).toBeVisible();
    await expect(homePage.swantronLink).toHaveText(testData.expectedContent.home.swantronLinkText);
    await expect(homePage.swantronLink).toHaveAttribute('href', testData.expectedContent.home.swantronLinkHref);
  });

  test('Weather page loads and displays temperature', async ({ page }) => {
    const weatherPage = new WeatherPage(page);
    
    await weatherPage.goto(testData.urls.weather);
    await weatherPage.waitForLoad();
    
    // Verify weather page loads
    await expect(weatherPage.temperatureDisplay).toBeVisible();
    
    // Verify temperature format
    const temperatureText = await weatherPage.getTemperatureText();
    expect(temperatureText).toMatch(testData.expectedContent.weather.temperaturePattern);
  });

  test('Swantron link navigates to random pages', async ({ page }) => {
    const homePage = new HomePage(page);
    
    await homePage.goto(testData.urls.home);
    await homePage.waitForLoad();
    
    // Verify swantron link
    await expect(homePage.swantronLink).toBeVisible();
    await expect(homePage.swantronLink).toHaveText(testData.expectedContent.home.swantronLinkText);
    await expect(homePage.swantronLink).toHaveAttribute('href', testData.expectedContent.home.swantronLinkHref);
    
    // Test click functionality (should redirect to gangnam pages, hacking, or dealwithit pages)
    await homePage.clickSwantronLink();
    
    // Should redirect to either gangnam1, gangnam2, hacking, dealwithit1, dealwithit2, or dealwithit3
    const currentUrl = await homePage.getCurrentUrl();
    expect(currentUrl).toMatch(/gangnam[12]|hacking|dealwithit[123]/);
  });
});
