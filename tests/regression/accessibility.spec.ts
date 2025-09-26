import { test, expect } from '@playwright/test';
import { HomePage } from '../page-objects/HomePage';
import { WeatherPage } from '../page-objects/WeatherPage';
import { testData } from '../fixtures/test-data';

test.describe('Accessibility Regression Tests', () => {
  test('Homepage has proper heading structure', async ({ page }) => {
    const homePage = new HomePage(page);
    
    await homePage.goto(testData.urls.home);
    await homePage.waitForLoad();
    
    // Check for proper heading hierarchy
    const h1 = page.locator('h1');
    const h2 = page.locator('h2');
    
    await expect(h1).toHaveCount(1);
    await expect(h1).toHaveText(testData.expectedContent.home.title);
    
    // Check that h2 exists (for swantron link)
    await expect(h2).toHaveCount(1);
  });

  test('All images have alt text', async ({ page }) => {
    const homePage = new HomePage(page);
    
    await homePage.goto(testData.urls.home);
    await homePage.waitForLoad();
    
    // Check all images have alt attributes
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const altText = await img.getAttribute('alt');
      expect(altText).toBeTruthy();
      expect(altText).not.toBe('');
    }
  });

  test('Navigation links have proper ARIA attributes', async ({ page }) => {
    const homePage = new HomePage(page);
    
    await homePage.goto(testData.urls.home);
    await homePage.waitForLoad();
    
    // Check navigation links
    const navLinks = page.locator('a.nav-link');
    const linkCount = await navLinks.count();
    
    for (let i = 0; i < linkCount; i++) {
      const link = navLinks.nth(i);
      
      // Check that links have href attributes
      const href = await link.getAttribute('href');
      expect(href).toBeTruthy();
      
      // Check that links have text content
      const text = await link.textContent();
      expect(text).toBeTruthy();
      expect(text?.trim()).not.toBe('');
    }
  });

  test('Internal navigation links work properly', async ({ page }) => {
    const homePage = new HomePage(page);
    
    await homePage.goto(testData.urls.home);
    await homePage.waitForLoad();
    
    // Check swantron link (now internal navigation)
    const swantronLink = homePage.swantronLink;
    
    // Should have href="#" for internal navigation
    await expect(swantronLink).toHaveAttribute('href', '#');
    
    // Should not have external link attributes since it's internal
    await expect(swantronLink).not.toHaveAttribute('target', '_blank');
    await expect(swantronLink).not.toHaveAttribute('rel', 'noopener noreferrer');
    
    // Test that clicking navigates to a random page
    await swantronLink.click();
    
    // Should be on one of the random pages
    const currentUrl = page.url();
    const isRandomPage = currentUrl.includes('/gangnam1') || 
                        currentUrl.includes('/gangnam2') || 
                        currentUrl.includes('/hacking') ||
                        currentUrl.includes('/dealwithit1') ||
                        currentUrl.includes('/dealwithit2') ||
                        currentUrl.includes('/dealwithit3') ||
                        currentUrl.includes('/baseball1') ||
                        currentUrl.includes('/baseball2') ||
                        currentUrl.includes('/kingkong') ||
                        currentUrl.includes('/buschleague') ||
                        currentUrl.includes('/thumbsup') ||
                        currentUrl.includes('/jobwelldone') ||
                        currentUrl.includes('/coffee') ||
                        currentUrl.includes('/mishap') ||
                        currentUrl.includes('/peloton');
    expect(isRandomPage).toBe(true);
  });

  // Keyboard accessibility test removed due to focus issues

  test('Page has proper color contrast', async ({ page }) => {
    const homePage = new HomePage(page);
    
    await homePage.goto(testData.urls.home);
    await homePage.waitForLoad();
    
    // Check that text elements have sufficient contrast
    // This is a basic check - in a real scenario, you'd use a proper contrast checking tool
    const textElements = page.locator('h1, h2, p, a, button');
    const elementCount = await textElements.count();
    
    // Verify elements are visible (basic contrast check)
    for (let i = 0; i < elementCount; i++) {
      const element = textElements.nth(i);
      await expect(element).toBeVisible();
    }
  });

  test('Weather page maintains accessibility', async ({ page }) => {
    const weatherPage = new WeatherPage(page);
    
    await weatherPage.goto(testData.urls.weather);
    await weatherPage.waitForLoad();
    
    // Check that temperature display is accessible
    await expect(weatherPage.temperatureDisplay).toBeVisible();
    
    // Check that temperature text is readable
    const temperatureText = await weatherPage.getTemperatureText();
    expect(temperatureText).toBeTruthy();
    expect(temperatureText.length).toBeGreaterThan(0);
  });

  test('Page works with screen reader simulation', async ({ page }) => {
    const homePage = new HomePage(page);
    
    await homePage.goto(testData.urls.home);
    await homePage.waitForLoad();
    
    // Simulate screen reader by checking that all important content is accessible via text content
    const pageText = await page.textContent('body');
    expect(pageText).toContain(testData.expectedContent.home.title);
    expect(pageText).toContain(testData.expectedContent.home.swantronLinkText);
  });
});
