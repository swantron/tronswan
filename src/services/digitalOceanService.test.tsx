// Remove node-fetch import - use global Response type instead
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

// Mock logger before importing
vi.mock('../utils/logger', () => ({
  logger: {
    apiError: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    measureAsync: vi.fn((label, fn) => fn()),
  },
}));

// Mock fetch
global.fetch = vi.fn();

// Import after mocking
import { logger } from '../utils/logger';

import digitalOceanService from './digitalOceanService';

describe('DigitalOceanService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getApp', () => {
    it('should fetch app data successfully', async () => {
      const mockApp = { app: { id: 'test-app', name: 'Test App' } };
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApp),
      } as any);

      const result = await digitalOceanService.getApp();

      expect(fetch).toHaveBeenCalledWith(
        '/api/digitalocean/app',
        expect.any(Object)
      );
      const [, init] = vi.mocked(fetch).mock.calls[0];
      expect(JSON.stringify(init)).not.toMatch(/authorization/i);
      expect(result).toEqual(mockApp);
    });

    it('should handle errors and log them', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

      await expect(digitalOceanService.getApp()).rejects.toThrow(
        'Network error'
      );
      expect(logger.apiError).toHaveBeenCalledWith(
        'DigitalOcean',
        'getApp',
        expect.any(Error)
      );
    });
  });

  describe('getDroplets', () => {
    it('should fetch droplets successfully', async () => {
      const mockDroplets = {
        droplets: [
          {
            id: 1,
            name: 'test-droplet',
            memory: 1024,
            vcpus: 1,
            disk: 25,
            locked: false,
            status: 'active' as const,
            kernel: { id: 1, name: 'Ubuntu', version: '20.04' },
            created_at: '2023-01-01T00:00:00Z',
            features: ['monitoring'],
            backup_ids: [],
            snapshot_ids: [],
            image: {
              id: 1,
              name: 'Ubuntu 20.04',
              distribution: 'Ubuntu',
              slug: 'ubuntu-20-04',
              public: true,
              regions: ['nyc1'],
              created_at: '2023-01-01T00:00:00Z',
              min_disk_size: 20,
              type: 'snapshot',
              size_gigabytes: 2,
            },
            size: {
              slug: 's-1vcpu-1gb',
              memory: 1024,
              vcpus: 1,
              disk: 25,
              transfer: 1000,
              price_monthly: 5,
              price_hourly: 0.007,
              regions: ['nyc1'],
              available: true,
            },
            size_slug: 's-1vcpu-1gb',
            networks: {
              v4: [
                {
                  ip_address: '192.168.1.1',
                  netmask: '255.255.255.0',
                  gateway: '192.168.1.1',
                  type: 'public',
                },
              ],
              v6: [
                {
                  ip_address: '::1',
                  netmask: 64,
                  gateway: '::1',
                  type: 'public',
                },
              ],
            },
            region: {
              name: 'New York 1',
              slug: 'nyc1',
              features: ['monitoring'],
              available: true,
              sizes: ['s-1vcpu-1gb'],
            },
            tags: ['web'],
            volume_ids: [],
            monitoring: true,
          },
        ],
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDroplets),
      } as any);

      const result = await digitalOceanService.getDroplets();

      expect(fetch).toHaveBeenCalledWith(
        '/api/digitalocean/droplets',
        expect.any(Object)
      );
      expect(result).toEqual(mockDroplets.droplets);
    });

    it('should handle errors when fetching droplets', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('API error'));

      await expect(digitalOceanService.getDroplets()).rejects.toThrow(
        'API error'
      );
      expect(logger.apiError).toHaveBeenCalledWith(
        'DigitalOcean',
        'getDroplets',
        expect.any(Error)
      );
    });
  });
});
