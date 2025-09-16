/**
 * Runtime configuration utility for environment variables
 * Supports both local .env files and runtime environment variable injection
 */

interface RuntimeConfig {
  VITE_WEATHER_API_KEY: string;
  VITE_WEATHER_CITY: string;
  VITE_WEATHER_UNITS: string;
  VITE_SITE_URL: string;
  VITE_GITHUB_TOKEN: string;
  VITE_GITHUB_OWNER: string;
  VITE_DIGITALOCEAN_TOKEN: string;
  VITE_DIGITALOCEAN_APP_ID: string;
}

class RuntimeConfigManager {
  private config: Partial<RuntimeConfig> = {};
  private initialized = false;

  /**
   * Initialize configuration from environment variables
   * This method should be called before using any config values
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Load build-time environment variables
    this.loadBuildTimeConfig();

    this.initialized = true;
  }

  /**
   * Load configuration from build-time environment variables
   * This works for both local development and static builds
   */
  private loadBuildTimeConfig(): void {
    const envVars: (keyof RuntimeConfig)[] = [
      'VITE_WEATHER_API_KEY',
      'VITE_WEATHER_CITY',
      'VITE_WEATHER_UNITS',
      'VITE_SITE_URL',
      'VITE_GITHUB_TOKEN',
      'VITE_GITHUB_OWNER',
      'VITE_DIGITALOCEAN_TOKEN',
      'VITE_DIGITALOCEAN_APP_ID',
    ];

    envVars.forEach(key => {
      if (typeof window !== 'undefined' && import.meta.env) {
        // Browser context - use Vite's import.meta.env
        this.config[key] = import.meta.env[key] || '';
      } else {
        // Node.js context - use process.env
        this.config[key] = process.env[key] || '';
      }
    });

    console.log('Loaded build-time configuration');
  }

  /**
   * Get a configuration value
   */
  get<K extends keyof RuntimeConfig>(key: K): string {
    if (!this.initialized) {
      console.warn(`Config not initialized, getting ${key} from fallback`);
      return this.getFallback(key);
    }
    return this.config[key] || '';
  }

  /**
   * Get a configuration value with a default
   */
  getWithDefault<K extends keyof RuntimeConfig>(
    key: K,
    defaultValue: string
  ): string {
    const value = this.get(key);
    return value || defaultValue;
  }

  /**
   * Fallback method for getting config values when not initialized
   */
  private getFallback<K extends keyof RuntimeConfig>(key: K): string {
    if (typeof window !== 'undefined' && import.meta.env) {
      return import.meta.env[key] || '';
    }
    return process.env[key] || '';
  }

  /**
   * Check if a configuration value is set
   */
  has<K extends keyof RuntimeConfig>(key: K): boolean {
    const value = this.get(key);
    return value !== '' && value !== undefined && value !== null;
  }

  /**
   * Get all configuration values
   */
  getAll(): Partial<RuntimeConfig> {
    return { ...this.config };
  }

  /**
   * Check if configuration is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

// Export a singleton instance
export const runtimeConfig = new RuntimeConfigManager();

// Export the type for use in other files
export type { RuntimeConfig };
