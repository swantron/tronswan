import { logger } from '../utils/logger';

export interface DigitalOceanApp {
  id: string;
  name: string;
  region: string;
  status: string;
  created_at: string;
  updated_at: string;
  spec: {
    name: string;
    region: string;
    services: Array<{
      name: string;
      source_dir: string;
      github: {
        repo: string;
        branch: string;
        deploy_on_push: boolean;
      };
      run_command: string;
      environment_slug: string;
      instance_count: number;
      instance_size_slug: string;
    }>;
  };
}

export interface DigitalOceanDroplet {
  id: number;
  name: string;
  memory: number;
  vcpus: number;
  disk: number;
  locked: boolean;
  status: 'new' | 'active' | 'off' | 'archive';
  kernel: {
    id: number;
    name: string;
    version: string;
  };
  created_at: string;
  features: string[];
  backup_ids: number[];
  snapshot_ids: number[];
  image: {
    id: number;
    name: string;
    distribution: string;
    slug: string;
    public: boolean;
    regions: string[];
    created_at: string;
    min_disk_size: number;
    type: string;
    size_gigabytes: number;
  };
  size: {
    slug: string;
    memory: number;
    vcpus: number;
    disk: number;
    transfer: number;
    price_monthly: number;
    price_hourly: number;
    regions: string[];
    available: boolean;
  };
  size_slug: string;
  networks: {
    v4: Array<{
      ip_address: string;
      netmask: string;
      gateway: string;
      type: string;
    }>;
    v6: Array<{
      ip_address: string;
      netmask: number;
      gateway: string;
      type: string;
    }>;
  };
  region: {
    name: string;
    slug: string;
    features: string[];
    available: boolean;
    sizes: string[];
  };
  tags: string[];
  volume_ids: string[];
  monitoring: boolean;
}

export interface DigitalOceanLoadBalancer {
  id: string;
  name: string;
  ip: string;
  algorithm: string;
  status: 'new' | 'active' | 'errored';
  created_at: string;
  forwarding_rules: Array<{
    entry_protocol: string;
    entry_port: number;
    target_protocol: string;
    target_port: number;
    certificate_id?: string;
    tls_passthrough?: boolean;
  }>;
  health_check: {
    protocol: string;
    port: number;
    path: string;
    check_interval_seconds: number;
    response_timeout_seconds: number;
    healthy_threshold: number;
    unhealthy_threshold: number;
  };
  sticky_sessions: {
    type: string;
    cookie_name?: string;
    cookie_ttl_seconds?: number;
  };
  region: {
    name: string;
    slug: string;
  };
  droplet_ids: number[];
  redirect_http_to_https: boolean;
  enable_proxy_protocol: boolean;
  enable_backend_keepalive: boolean;
  vpc_uuid?: string;
  disable_lets_encrypt_dns_records: boolean;
  allow_ssl_backend: boolean;
  enable_lets_encrypt: boolean;
}

export interface DigitalOceanDatabase {
  id: string;
  name: string;
  engine: string;
  version: string;
  status:
    | 'creating'
    | 'online'
    | 'resizing'
    | 'migrating'
    | 'backing_up'
    | 'restoring'
    | 'maintenance'
    | 'offline';
  created_at: string;
  size: string;
  num_nodes: number;
  region: string;
  tags: string[];
  db_names: string[];
  users: Array<{
    name: string;
    role: string;
    password: string;
  }>;
  connection: {
    uri: string;
    database: string;
    host: string;
    port: number;
    user: string;
    password: string;
    ssl: boolean;
  };
  private_connection: {
    uri: string;
    database: string;
    host: string;
    port: number;
    user: string;
    password: string;
    ssl: boolean;
  };
  maintenance_window: {
    day: string;
    hour: string;
    pending: boolean;
    description: string[];
  };
  backup_restore: {
    database_name: string;
    backup_created_at: string;
  };
}

class DigitalOceanService {
  // Requests go through tronswan's own server (server.js), which holds the
  // DigitalOcean token. Never put a token in client code: it ships in the bundle.
  private baseUrl = '/api/digitalocean';

  private async makeRequest<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    logger.debug('Making DigitalOcean API request', {
      endpoint,
      url,
      timestamp: new Date().toISOString(),
    });

    const response = await logger.measureAsync(
      'digitalocean-api-call',
      async () => {
        return await fetch(url, {
          headers: { Accept: 'application/json' },
        });
      },
      { endpoint }
    );

    if (!response.ok) {
      logger.error('DigitalOcean API request failed', {
        endpoint,
        status: response.status,
        statusText: response.statusText,
        url,
      });
      throw new Error(
        `DigitalOcean API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    logger.info('DigitalOcean API request successful', {
      endpoint,
      status: response.status,
      url,
    });

    return data;
  }

  async getApp(): Promise<{ app: DigitalOceanApp }> {
    logger.info('Fetching DigitalOcean app data', {
      timestamp: new Date().toISOString(),
    });

    try {
      const result = (await this.makeRequest('/app')) as {
        app: DigitalOceanApp;
      };

      logger.info('DigitalOcean app data fetched successfully', {
        appId: result.app.id,
        appName: result.app.name,
        region: result.app.region,
        status: result.app.status,
        timestamp: new Date().toISOString(),
      });

      return result;
    } catch (error) {
      logger.apiError(
        'DigitalOcean',
        'getApp',
        error instanceof Error ? error : new Error('Unknown error')
      );
      throw error;
    }
  }

  async getDroplets(): Promise<DigitalOceanDroplet[]> {
    logger.info('Fetching DigitalOcean droplets data', {
      timestamp: new Date().toISOString(),
    });

    try {
      const response = await this.makeRequest<{
        droplets: DigitalOceanDroplet[];
      }>('/droplets');

      logger.info('DigitalOcean droplets data fetched successfully', {
        dropletCount: response.droplets.length,
        droplets: response.droplets.map(d => ({
          id: d.id,
          name: d.name,
          status: d.status,
          region: d.region?.slug,
        })),
        timestamp: new Date().toISOString(),
      });

      return response.droplets;
    } catch (error) {
      logger.apiError(
        'DigitalOcean',
        'getDroplets',
        error instanceof Error ? error : new Error('Unknown error')
      );
      throw error;
    }
  }
}

export default new DigitalOceanService();
