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
      home: this.page.locator('a.nav-link').filter({ hasText: 'home' }),
      projects: this.page
        .locator('a.nav-link')
        .filter({ hasText: 'projects' }),
      about: this.page.locator('a.nav-link').filter({ hasText: 'about' }),
      blog: this.page.locator('a.nav-link').filter({ hasText: 'blog' }),
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
