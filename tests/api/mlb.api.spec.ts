import { test, expect } from '@playwright/test';
import { testData } from '../fixtures/test-data';

test.describe('MLB API Tests', () => {
  test('GET /api/mlb/games returns valid game data', async ({ request }) => {
    const response = await request.get(`${testData.urls.base}/api/mlb/games`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);

    if (data.length > 0) {
      const game = data[0];
      expect(game).toHaveProperty('homeTeam');
      expect(game).toHaveProperty('awayTeam');
      expect(game).toHaveProperty('gameDate');
    }
  });

  test('GET /api/mlb/standings returns valid standings data', async ({
    request,
  }) => {
    const response = await request.get(
      `${testData.urls.base}/api/mlb/standings`
    );

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);

    if (data.length > 0) {
      const standing = data[0];
      expect(standing).toHaveProperty('team');
      expect(standing).toHaveProperty('wins');
      expect(standing).toHaveProperty('losses');
    }
  });

  test('MLB API responds within acceptable time', async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get(`${testData.urls.base}/api/mlb/games`);
    const responseTime = Date.now() - startTime;

    expect(response.status()).toBe(200);
    // API should respond within 5 seconds (external API dependency)
    expect(responseTime).toBeLessThan(5000);
  });

  test('MLB API handles invalid endpoints', async ({ request }) => {
    const response = await request.get(
      `${testData.urls.base}/api/mlb/invalid`
    );

    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('MLB API returns proper content type', async ({ request }) => {
    const response = await request.get(`${testData.urls.base}/api/mlb/games`);

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
  });
});
