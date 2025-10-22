import type { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class SwantronPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Swantron list page locators
  get swantronList() {
    return this.page.locator('[data-testid="swantron-list"]');
  }

  get swantronCards() {
    return this.page.locator('[data-testid="swantron-card"]');
  }

  get firstSwantronCard() {
    return this.swantronCards.first();
  }

  // Swantron detail page locators
  get swantronDetail() {
    return this.page.locator('[data-testid="swantron-detail"]');
  }

  get swantronTitle() {
    return this.page.locator('[data-testid="swantron-title"]');
  }

  get swantronDescription() {
    return this.page.locator('[data-testid="swantron-description"]');
  }

  // Swantron page actions
  async clickFirstSwantron() {
    await this.firstSwantronCard.click();
    await this.waitForLoad();
  }

  async getSwantronCardCount(): Promise<number> {
    return await this.swantronCards.count();
  }

  async getSwantronTitle(): Promise<string> {
    return (await this.swantronTitle.textContent()) || '';
  }

  // Validation methods
  async isSwantronListVisible(): Promise<boolean> {
    return await this.swantronList.isVisible();
  }

  async isSwantronDetailVisible(): Promise<boolean> {
    return await this.swantronDetail.isVisible();
  }

  async hasSwantronCards(): Promise<boolean> {
    return (await this.swantronCards.count()) > 0;
  }
}
