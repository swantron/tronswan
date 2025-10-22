import type { Page, Locator } from '@playwright/test';

export class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Common navigation methods
  async goto(path: string = '') {
    await this.page.goto(path);
  }

  async waitForLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  // Common locators
  get appContainer(): Locator {
    return this.page.locator('[data-testid="app-container"]');
  }

  get appHeader(): Locator {
    return this.page.locator('[data-testid="app-header"]');
  }

  get appLogo(): Locator {
    return this.page.locator('[data-testid="app-logo"]');
  }

  get appTitle(): Locator {
    return this.page.locator('[data-testid="app-title"]');
  }

  // Navigation menu
  get navLinks() {
    return {
      home: this.page.locator('a.nav-link').filter({ hasText: 'Home' }),
      chomptron: this.page
        .locator('a.nav-link')
        .filter({ hasText: 'chomptron' }),
      swantron: this.page.locator('a.nav-link').filter({ hasText: 'swantron' }),
      music: this.page.locator('a.nav-link').filter({ hasText: 'music' }),
      mlb: this.page.locator('a.nav-link').filter({ hasText: 'mlb' }),
      weather: this.page
        .locator('a.nav-link')
        .filter({ hasText: 'weathertron' }),
      hello: this.page.locator('a.nav-link').filter({ hasText: 'hello' }),
      health: this.page.locator('a.nav-link').filter({ hasText: 'health' }),
    };
  }

  // Common actions
  async clickNavLink(linkName: keyof typeof this.navLinks) {
    await this.navLinks[linkName].click();
    await this.waitForLoad();
  }

  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  // Error handling
  async isErrorVisible(): Promise<boolean> {
    return await this.page
      .locator('[data-testid="error-boundary"]')
      .isVisible();
  }
}
