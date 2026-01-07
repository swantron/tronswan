import { test, expect } from '@playwright/test';
import { testData } from '../fixtures/test-data';

test.describe('Weather API Tests', () => {
  test('GET /api/weather returns valid weather data', async ({ request }) => {
    const response = await request.get(`${testData.urls.base}/api/weather`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('temperature');
    expect(data).toHaveProperty('location');
    expect(typeof data.temperature).toBe('number');
    expect(typeof data.location).toBe('string');
  });

  test('Weather API returns temperature in valid range', async ({
    request,
  }) => {
    const response = await request.get(`${testData.urls.base}/api/weather`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    // Temperature should be in a reasonable range (Celsius)
    expect(data.temperature).toBeGreaterThan(-50);
    expect(data.temperature).toBeLessThan(60);
  });

  test('Weather API responds within acceptable time', async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get(`${testData.urls.base}/api/weather`);
    const responseTime = Date.now() - startTime;

    expect(response.status()).toBe(200);
    // API should respond within 3 seconds
    expect(responseTime).toBeLessThan(3000);
  });

  test('Weather API handles errors gracefully', async ({ request }) => {
    // Test with invalid endpoint
    const response = await request.get(
      `${testData.urls.base}/api/weather/invalid`
    );

    // Should return an error status
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('Weather API returns consistent data structure', async ({
    request,
  }) => {
    // Make multiple requests to verify consistency
    const responses = await Promise.all([
      request.get(`${testData.urls.base}/api/weather`),
      request.get(`${testData.urls.base}/api/weather`),
      request.get(`${testData.urls.base}/api/weather`),
    ]);

    // All should return 200
    responses.forEach(response => {
      expect(response.status()).toBe(200);
    });

    // All should have the same structure
    const data = await Promise.all(responses.map(r => r.json()));
    data.forEach(item => {
      expect(item).toHaveProperty('temperature');
      expect(item).toHaveProperty('location');
    });
  });
});
