import type { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Home page specific locators
  get swantronLink() {
    return this.page.locator('[data-testid="swantron-link"]');
  }

  get homeDescription() {
    return this.page.locator('.home-description');
  }

  // Home page specific actions
  async clickSwantronLink() {
    await this.swantronLink.click();
  }

  async getSwantronLinkHref(): Promise<string | null> {
    return await this.swantronLink.getAttribute('href');
  }

  async getSwantronLinkText(): Promise<string> {
    return await this.swantronLink.textContent() || '';
  }

  // Validation methods
  async isSwantronLinkVisible(): Promise<boolean> {
    return await this.swantronLink.isVisible();
  }

  async isHomeDescriptionVisible(): Promise<boolean> {
    return await this.homeDescription.isVisible();
  }
}
