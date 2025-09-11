import { runtimeConfig } from '../utils/runtimeConfig';

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
  status: 'creating' | 'online' | 'resizing' | 'migrating' | 'backing_up' | 'restoring' | 'maintenance' | 'offline';
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
  private baseUrl: string;
  private token: string;

  constructor() {
    this.baseUrl = 'https://api.digitalocean.com/v2';
    this.token = runtimeConfig.get('VITE_DIGITALOCEAN_TOKEN');
  }

  private async makeRequest<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`DigitalOcean API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  }

  async getDroplets(): Promise<DigitalOceanDroplet[]> {
    try {
      const response = await this.makeRequest<{ droplets: DigitalOceanDroplet[] }>('/droplets');
      return response.droplets;
    } catch (error) {
      console.error('Error fetching DigitalOcean droplets:', error);
      throw error;
    }
  }

  async getLoadBalancers(): Promise<DigitalOceanLoadBalancer[]> {
    try {
      const response = await this.makeRequest<{ load_balancers: DigitalOceanLoadBalancer[] }>('/load_balancers');
      return response.load_balancers;
    } catch (error) {
      console.error('Error fetching DigitalOcean load balancers:', error);
      throw error;
    }
  }

  async getDatabases(): Promise<DigitalOceanDatabase[]> {
    try {
      const response = await this.makeRequest<{ databases: DigitalOceanDatabase[] }>('/databases');
      return response.databases;
    } catch (error) {
      console.error('Error fetching DigitalOcean databases:', error);
      throw error;
    }
  }

  async getAccount(): Promise<{ account: { droplet_limit: number; floating_ip_limit: number; volume_limit: number; load_balancer_limit: number; database_limit: number; } }> {
    try {
      return await this.makeRequest<{ account: { droplet_limit: number; floating_ip_limit: number; volume_limit: number; load_balancer_limit: number; database_limit: number; } }>('/account');
    } catch (error) {
      console.error('Error fetching DigitalOcean account info:', error);
      throw error;
    }
  }
}

export default new DigitalOceanService();
