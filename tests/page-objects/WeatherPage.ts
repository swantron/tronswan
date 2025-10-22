import type { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class WeatherPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Weather page specific locators
  get temperatureDisplay() {
    return this.page.locator('[data-testid="temperature-display"]');
  }

  get weatherContainer() {
    return this.page.locator('.weather-container');
  }

  // Weather page specific actions
  async getTemperatureText(): Promise<string> {
    return (await this.temperatureDisplay.textContent()) || '';
  }

  async isTemperatureDisplayVisible(): Promise<boolean> {
    return await this.temperatureDisplay.isVisible();
  }

  // Validation methods
  async isTemperatureInValidRange(): Promise<boolean> {
    const temperatureText = await this.getTemperatureText();
    const temperatureMatch = temperatureText.match(/(-?\d+\.?\d*)°F/);

    if (!temperatureMatch) return false;

    const temperature = parseFloat(temperatureMatch[1]);
    return temperature >= -30 && temperature <= 120;
  }

  async isWeatherPageLoaded(): Promise<boolean> {
    return (
      (await this.temperatureDisplay.isVisible()) &&
      (await this.weatherContainer.isVisible())
    );
  }
}
