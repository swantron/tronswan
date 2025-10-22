import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class TestHelpers {
  static async waitForApiResponse(
    page: Page,
    urlPattern: string | RegExp,
    timeout: number = 10000
  ) {
    return await page.waitForResponse(
      response => {
        const url = response.url();
        if (typeof urlPattern === 'string') {
          return url.includes(urlPattern);
        }
        return urlPattern.test(url);
      },
      { timeout }
    );
  }

  static async waitForElementToBeStable(
    page: Page,
    selector: string,
    timeout: number = 5000
  ) {
    const element = page.locator(selector);
    await element.waitFor({ state: 'visible', timeout });

    // Wait for any animations or loading to complete
    await page.waitForTimeout(1000);
  }

  static async takeScreenshot(page: Page, name: string) {
    await page.screenshot({
      path: `test-results/screenshots/${name}-${Date.now()}.png`,
      fullPage: true,
    });
  }

  static async checkConsoleErrors(page: Page): Promise<string[]> {
    const errors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    return errors;
  }

  static async checkNetworkErrors(page: Page): Promise<string[]> {
    const errors: string[] = [];

    page.on('response', response => {
      if (response.status() >= 400) {
        errors.push(`Network error: ${response.status()} ${response.url()}`);
      }
    });

    return errors;
  }

  static async validatePagePerformance(page: Page) {
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded:
          navigation.domContentLoadedEventEnd -
          navigation.domContentLoadedEventStart,
        firstPaint:
          performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint:
          performance.getEntriesByName('first-contentful-paint')[0]
            ?.startTime || 0,
      };
    });

    // Basic performance assertions
    expect(metrics.loadTime).toBeLessThan(5000); // Page should load within 5 seconds
    expect(metrics.domContentLoaded).toBeLessThan(3000); // DOM should be ready within 3 seconds

    return metrics;
  }

  static async mockApiResponse(page: Page, url: string, response: any) {
    await page.route(url, route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response),
      });
    });
  }

  static generateRandomEmail(): string {
    return `test-${Math.random().toString(36).substring(7)}@example.com`;
  }

  static generateRandomString(length: number = 10): string {
    return Math.random()
      .toString(36)
      .substring(2, length + 2);
  }
}
