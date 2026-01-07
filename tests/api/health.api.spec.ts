import { test, expect } from '@playwright/test';
import { testData } from '../fixtures/test-data';

test.describe('Health and Status API Tests', () => {
  test('GET /health returns healthy status', async ({ request }) => {
    const response = await request.get(`${testData.urls.base}/health`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('status');
    expect(data.status).toBe('healthy');
  });

  test('GET /ready returns ready status', async ({ request }) => {
    const response = await request.get(`${testData.urls.base}/ready`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('status');
    expect(data.status).toBe('ready');
  });

  test('Health endpoint responds quickly', async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get(`${testData.urls.base}/health`);
    const responseTime = Date.now() - startTime;

    expect(response.status()).toBe(200);
    // Health checks should be very fast
    expect(responseTime).toBeLessThan(1000);
  });

  test('Ready endpoint checks dependencies', async ({ request }) => {
    const response = await request.get(`${testData.urls.base}/ready`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    // Should include dependency status if applicable
    if (data.dependencies) {
      expect(typeof data.dependencies).toBe('object');
    }
  });

  test('Health endpoints return proper content type', async ({ request }) => {
    const healthResponse = await request.get(`${testData.urls.base}/health`);
    const readyResponse = await request.get(`${testData.urls.base}/ready`);

    expect(healthResponse.headers()['content-type']).toContain(
      'application/json'
    );
    expect(readyResponse.headers()['content-type']).toContain(
      'application/json'
    );
  });

  test('Health endpoints are idempotent', async ({ request }) => {
    const responses = await Promise.all([
      request.get(`${testData.urls.base}/health`),
      request.get(`${testData.urls.base}/health`),
      request.get(`${testData.urls.base}/health`),
    ]);

    // All should return 200
    responses.forEach(response => {
      expect(response.status()).toBe(200);
    });

    // All should return the same status
    const data = await Promise.all(responses.map(r => r.json()));
    data.forEach(item => {
      expect(item.status).toBe('healthy');
    });
  });
});
