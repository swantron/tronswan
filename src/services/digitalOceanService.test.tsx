import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock runtimeConfig before importing
vi.mock('../utils/runtimeConfig', () => ({
  runtimeConfig: {
    get: vi.fn(() => 'test-token'),
    getWithDefault: vi.fn(() => 'test-app-id'),
  },
}));

// Mock fetch
global.fetch = vi.fn();

// Import after mocking
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
      } as Response);

      const result = await digitalOceanService.getApp();

      expect(fetch).toHaveBeenCalledWith(
        'https://api.digitalocean.com/v2/apps/test-app-id',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(result).toEqual(mockApp);
    });

    it('should handle errors and log them', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

      await expect(digitalOceanService.getApp()).rejects.toThrow('Network error');
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error fetching DigitalOcean app:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
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
              v4: [{ ip_address: '192.168.1.1', netmask: '255.255.255.0', gateway: '192.168.1.1', type: 'public' }],
              v6: [{ ip_address: '::1', netmask: 64, gateway: '::1', type: 'public' }],
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
      } as Response);

      const result = await digitalOceanService.getDroplets();

      expect(fetch).toHaveBeenCalledWith(
        'https://api.digitalocean.com/v2/droplets',
        expect.any(Object)
      );
      expect(result).toEqual(mockDroplets.droplets);
    });

    it('should handle errors when fetching droplets', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(fetch).mockRejectedValueOnce(new Error('API error'));

      await expect(digitalOceanService.getDroplets()).rejects.toThrow('API error');
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error fetching DigitalOcean droplets:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('getLoadBalancers', () => {
    it('should fetch load balancers successfully', async () => {
      const mockLoadBalancers = {
        load_balancers: [
          {
            id: 'lb-1',
            name: 'test-lb',
            ip: '192.168.1.100',
            algorithm: 'round_robin',
            status: 'active' as const,
            created_at: '2023-01-01T00:00:00Z',
            forwarding_rules: [
              {
                entry_protocol: 'http',
                entry_port: 80,
                target_protocol: 'http',
                target_port: 80,
              },
            ],
            health_check: {
              protocol: 'http',
              port: 80,
              path: '/health',
              check_interval_seconds: 10,
              response_timeout_seconds: 5,
              healthy_threshold: 3,
              unhealthy_threshold: 3,
            },
            sticky_sessions: {
              type: 'none',
            },
            region: {
              name: 'New York 1',
              slug: 'nyc1',
            },
            droplet_ids: [1, 2],
            redirect_http_to_https: false,
            enable_proxy_protocol: false,
            enable_backend_keepalive: false,
            disable_lets_encrypt_dns_records: false,
            allow_ssl_backend: false,
            enable_lets_encrypt: false,
          },
        ],
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockLoadBalancers),
      } as Response);

      const result = await digitalOceanService.getLoadBalancers();

      expect(fetch).toHaveBeenCalledWith(
        'https://api.digitalocean.com/v2/load_balancers',
        expect.any(Object)
      );
      expect(result).toEqual(mockLoadBalancers.load_balancers);
    });

    it('should handle errors when fetching load balancers', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(fetch).mockRejectedValueOnce(new Error('API error'));

      await expect(digitalOceanService.getLoadBalancers()).rejects.toThrow('API error');
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error fetching DigitalOcean load balancers:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('getDatabases', () => {
    it('should fetch databases successfully', async () => {
      const mockDatabases = {
        databases: [
          {
            id: 'db-1',
            name: 'test-db',
            engine: 'postgres',
            version: '13',
            status: 'online' as const,
            created_at: '2023-01-01T00:00:00Z',
            size: 'db-s-1vcpu-1gb',
            num_nodes: 1,
            region: 'nyc1',
            tags: ['production'],
            db_names: ['app_db'],
            users: [
              {
                name: 'app_user',
                role: 'readwrite',
                password: 'secret',
              },
            ],
            connection: {
              uri: 'postgresql://user:pass@host:5432/db',
              database: 'app_db',
              host: 'db.example.com',
              port: 5432,
              user: 'app_user',
              password: 'secret',
              ssl: true,
            },
            private_connection: {
              uri: 'postgresql://user:pass@private-host:5432/db',
              database: 'app_db',
              host: 'private-db.example.com',
              port: 5432,
              user: 'app_user',
              password: 'secret',
              ssl: true,
            },
            maintenance_window: {
              day: 'sunday',
              hour: '02:00',
              pending: false,
              description: ['Database maintenance'],
            },
            backup_restore: {
              database_name: 'app_db',
              backup_created_at: '2023-01-01T00:00:00Z',
            },
          },
        ],
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDatabases),
      } as Response);

      const result = await digitalOceanService.getDatabases();

      expect(fetch).toHaveBeenCalledWith(
        'https://api.digitalocean.com/v2/databases',
        expect.any(Object)
      );
      expect(result).toEqual(mockDatabases.databases);
    });

    it('should handle errors when fetching databases', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(fetch).mockRejectedValueOnce(new Error('API error'));

      await expect(digitalOceanService.getDatabases()).rejects.toThrow('API error');
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error fetching DigitalOcean databases:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('getAccount', () => {
    it('should fetch account info successfully', async () => {
      const mockAccount = {
        account: {
          droplet_limit: 10,
          floating_ip_limit: 5,
          volume_limit: 20,
          load_balancer_limit: 3,
          database_limit: 2,
        },
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAccount),
      } as Response);

      const result = await digitalOceanService.getAccount();

      expect(fetch).toHaveBeenCalledWith(
        'https://api.digitalocean.com/v2/account',
        expect.any(Object)
      );
      expect(result).toEqual(mockAccount);
    });

    it('should handle errors when fetching account info', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(fetch).mockRejectedValueOnce(new Error('API error'));

      await expect(digitalOceanService.getAccount()).rejects.toThrow('API error');
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error fetching DigitalOcean account info:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });
});
