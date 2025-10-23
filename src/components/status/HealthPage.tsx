import React, { useState, useEffect, useRef } from 'react';

import digitalOceanService from '../../services/digitalOceanService';
import { logger } from '../../utils/logger';
import { runtimeConfig } from '../../utils/runtimeConfig';
import SEO from '../ui/SEO';

import DigitalOceanStatus from './DigitalOceanStatus';
import GitHubStatus from './GitHubStatus';
import ServiceHealth, { ServiceHealthRef } from './ServiceHealth';

import '../../styles/HealthPage.css';

interface HealthData {
  github: {
    user: any;
    repositories: any[];
    tronswanActions: any[];
    chomptronActions: any[];
    loading: boolean;
    error: string | null;
  };
  digitalocean: {
    app: any;
    droplets: any[];
    loadBalancers: any[];
    databases: any[];
    loading: boolean;
    error: string | null;
  };
  services: {
    tronswan: 'healthy' | 'degraded' | 'down';
    chomptron: 'healthy' | 'degraded' | 'down';
    swantron: 'healthy' | 'degraded' | 'down';
    jswan: 'healthy' | 'degraded' | 'down';
    mlbApi: 'healthy' | 'degraded' | 'down';
    spotifyApi: 'healthy' | 'degraded' | 'down';
    weatherApi: 'healthy' | 'degraded' | 'down';
  };
}

function HealthPage() {
  const [healthData, setHealthData] = useState<HealthData>({
    github: {
      user: null,
      repositories: [],
      tronswanActions: [],
      chomptronActions: [],
      loading: true,
      error: null,
    },
    digitalocean: {
      app: null,
      droplets: [],
      loadBalancers: [],
      databases: [],
      loading: true,
      error: null,
    },
    services: {
      tronswan: 'healthy',
      chomptron: 'healthy',
      swantron: 'healthy',
      jswan: 'healthy',
      mlbApi: 'healthy',
      spotifyApi: 'healthy',
      weatherApi: 'healthy',
    },
  });

  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'services' | 'deployments' | 'infrastructure'
  >('services');
  const serviceHealthRef = useRef<ServiceHealthRef>(null);

  const refreshData = async () => {
    setIsRefreshing(true);
    setLastUpdated(new Date());

    // Trigger service health checks
    if (serviceHealthRef.current) {
      await serviceHealthRef.current.checkAllServices();
    }

    setIsRefreshing(false);
  };

  useEffect(() => {
    // Skip data fetching in test environment
    if (typeof window === 'undefined' || process.env.NODE_ENV === 'test') {
      return;
    }

    // Initialize runtime config on component mount
    const initializeConfig = async () => {
      await runtimeConfig.initialize();
    };

    initializeConfig();

    // Fetch DigitalOcean data
    const fetchDigitalOceanData = async () => {
      try {
        setHealthData(prev => ({
          ...prev,
          digitalocean: { ...prev.digitalocean, loading: true, error: null },
        }));

        const [app, droplets] = await Promise.all([
          digitalOceanService.getApp(),
          digitalOceanService.getDroplets(),
        ]);

        logger.info('HealthPage loaded DigitalOcean data', { app, droplets });

        setHealthData(prev => ({
          ...prev,
          digitalocean: {
            app: app.app, // Extract the nested app object
            droplets,
            loadBalancers: [],
            databases: [],
            loading: false,
            error: null,
          },
        }));
      } catch (error) {
        logger.error('Error fetching DigitalOcean data', { error });
        setHealthData(prev => ({
          ...prev,
          digitalocean: {
            ...prev.digitalocean,
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : 'Failed to fetch DigitalOcean data',
          },
        }));
      }
    };

    fetchDigitalOceanData();

    const interval = setInterval(refreshData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className='health-page'>
      <SEO
        title='Service Health & Deployment Status - Tron Swan'
        description='Monitor service health, deployment status, and infrastructure metrics for Tron Swan applications. Real-time status from GitHub Actions and DigitalOcean.'
        keywords='service health, deployment status, GitHub Actions, DigitalOcean, monitoring, DevOps'
        url='/health'
      />

      <div className='health-content'>
        <h1 className='health-title' data-testid='health-title'>
          Service Health & Status
        </h1>

        <div className='health-controls'>
          <button
            className={`refresh-button ${isRefreshing ? 'refreshing' : ''}`}
            onClick={refreshData}
            disabled={isRefreshing}
            data-testid='refresh-button'
          >
            {isRefreshing ? '🔄 Refreshing...' : '🔄 Refresh'}
          </button>
          <span className='last-updated' data-testid='last-updated'>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
        </div>

        {/* Tab Navigation */}
        <div className='tab-navigation'>
          <button
            className={`tab-button ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => {
              logger.info('Health tab changed', {
                from: activeTab,
                to: 'services',
                timestamp: new Date().toISOString(),
              });
              setActiveTab('services');
            }}
          >
            🌐 Services & APIs
          </button>
          <button
            className={`tab-button ${activeTab === 'deployments' ? 'active' : ''}`}
            onClick={() => {
              logger.info('Health tab changed', {
                from: activeTab,
                to: 'deployments',
                timestamp: new Date().toISOString(),
              });
              setActiveTab('deployments');
            }}
          >
            🚀 Deployments
          </button>
          <button
            className={`tab-button ${activeTab === 'infrastructure' ? 'active' : ''}`}
            onClick={() => {
              logger.info('Health tab changed', {
                from: activeTab,
                to: 'infrastructure',
                timestamp: new Date().toISOString(),
              });
              setActiveTab('infrastructure');
            }}
          >
            ☁️ Infrastructure
          </button>
        </div>

        {/* Tab Content */}
        <div className='tab-content'>
          {activeTab === 'services' && (
            <div className='health-section'>
              <ServiceHealth
                ref={serviceHealthRef}
                services={healthData.services}
              />
            </div>
          )}

          {activeTab === 'deployments' && (
            <div className='health-section'>
              <GitHubStatus
                data={healthData.github}
                onDataChange={githubData =>
                  setHealthData(prev => ({ ...prev, github: githubData }))
                }
              />
            </div>
          )}

          {activeTab === 'infrastructure' && (
            <div className='health-section'>
              <DigitalOceanStatus
                data={healthData.digitalocean}
                onDataChange={doData =>
                  setHealthData(prev => ({ ...prev, digitalocean: doData }))
                }
              />
            </div>
          )}
        </div>

        {/* Google Cloud Resources */}
        <div className='health-section google-resources-section'>
          <h2>🔗 Google Cloud Resources</h2>
          <div className='google-resources-links'>
            <a
              href='https://aistudio.google.com/app/projects'
              target='_blank'
              rel='noopener noreferrer'
              className='resource-link'
            >
              📊 AI Studio Projects
            </a>
            <a
              href='https://console.cloud.google.com/cloud-build/builds?project=chomptron'
              target='_blank'
              rel='noopener noreferrer'
              className='resource-link'
            >
              🔨 Cloud Build
            </a>
            <a
              href='https://console.cloud.google.com/run/detail/us-central1/chomptron/observability/metrics?project=chomptron'
              target='_blank'
              rel='noopener noreferrer'
              className='resource-link'
            >
              📈 Cloud Run Metrics
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HealthPage;
