import { test, expect } from '@playwright/test';
import { HomePage } from '../page-objects/HomePage';
import { SwantronPage } from '../page-objects/SwantronPage';
import { testData } from '../fixtures/test-data';

test.describe('Navigation E2E Tests', () => {
  test('Navigate to all main pages', async ({ page }) => {
    const homePage = new HomePage(page);

    // Start at home page
    await homePage.goto(testData.urls.home);
    await homePage.waitForLoad();

    // Walk the new top-level nav: projects + blog (both internal pages with
    // recognizable content). about/home are covered implicitly.
    const navTargets = [
      { name: 'projects' as const, expectedUrl: testData.urls.work },
      { name: 'blog' as const, expectedUrl: testData.urls.swantron },
    ];

    for (const { name, expectedUrl } of navTargets) {
      await homePage.clickNavLink(name);

      const currentUrl = await homePage.getCurrentUrl();
      expect(currentUrl).toContain(expectedUrl);

      if (name === 'projects') {
        await expect(page.locator('[data-testid="work-title"]')).toBeVisible();
      } else if (name === 'blog') {
        const swantronPage = new SwantronPage(page);
        await expect(swantronPage.swantronList).toBeVisible();
      }

      await homePage.clickNavLink('home');
      await homePage.waitForLoad();
    }
  });

  test('Browser back/forward navigation works', async ({ page }) => {
    const homePage = new HomePage(page);

    // Start at home
    await homePage.goto(testData.urls.home);
    await homePage.waitForLoad();

    // Navigate to projects
    await homePage.clickNavLink('projects');
    await homePage.waitForLoad();

    // Go back
    await page.goBack();
    await homePage.waitForLoad();

    // Should be back at home
    const currentUrl = await homePage.getCurrentUrl();
    expect(currentUrl).toContain(testData.urls.home);

    // Go forward
    await page.goForward();
    await homePage.waitForLoad();

    // Should be at work again
    await expect(page.locator('[data-testid="work-title"]')).toBeVisible();
  });
});
