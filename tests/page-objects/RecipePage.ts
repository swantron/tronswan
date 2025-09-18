import type { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class RecipePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Recipe list page locators
  get recipeList() {
    return this.page.locator('[data-testid="recipe-list"]');
  }

  get recipeCards() {
    return this.page.locator('[data-testid="recipe-card"]');
  }

  get firstRecipeCard() {
    return this.recipeCards.first();
  }

  // Recipe detail page locators
  get recipeDetail() {
    return this.page.locator('[data-testid="recipe-detail"]');
  }

  get recipeTitle() {
    return this.page.locator('[data-testid="recipe-title"]');
  }

  get recipeDescription() {
    return this.page.locator('[data-testid="recipe-description"]');
  }

  // Recipe page actions
  async clickFirstRecipe() {
    await this.firstRecipeCard.click();
    await this.waitForLoad();
  }

  async getRecipeCardCount(): Promise<number> {
    return await this.recipeCards.count();
  }

  async getRecipeTitle(): Promise<string> {
    return await this.recipeTitle.textContent() || '';
  }

  // Validation methods
  async isRecipeListVisible(): Promise<boolean> {
    return await this.recipeList.isVisible();
  }

  async isRecipeDetailVisible(): Promise<boolean> {
    return await this.recipeDetail.isVisible();
  }

  async hasRecipeCards(): Promise<boolean> {
    return await this.recipeCards.count() > 0;
  }
}
