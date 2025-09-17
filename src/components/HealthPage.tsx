import React, { useState, useEffect, useRef } from 'react';

import digitalOceanService from '../services/digitalOceanService';
import { runtimeConfig } from '../utils/runtimeConfig';

import DigitalOceanStatus from './DigitalOceanStatus';
import GitHubStatus from './GitHubStatus';
import SEO from './SEO';
import ServiceHealth, { ServiceHealthRef } from './ServiceHealth';

import '../styles/HealthPage.css';

interface HealthData {
  github: {
    user: any;
    repositories: any[];
    actions: any[];
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
  };
}

function HealthPage() {
  const [healthData, setHealthData] = useState<HealthData>({
    github: {
      user: null,
      repositories: [],
      actions: [],
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
    },
  });

  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
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

        console.log('HealthPage loaded DigitalOcean data:', { app, droplets });

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
        console.error('Error fetching DigitalOcean data:', error);
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

      <div className='health-header'>
        <h1 className='health-title' data-testid='health-title'>
          Service Health
        </h1>
        <p className='health-subtitle'>
          Monitor deployments, infrastructure, and service status
        </p>

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
      </div>

      <div className='health-grid'>
        <div className='health-section'>
          <h2 className='section-title'>🚀 Deployment Status</h2>
          <GitHubStatus
            data={healthData.github}
            onDataChange={githubData =>
              setHealthData(prev => ({ ...prev, github: githubData }))
            }
          />
        </div>

        <div className='health-section'>
          <h2 className='section-title'>☁️ Infrastructure</h2>
          <DigitalOceanStatus
            data={healthData.digitalocean}
            onDataChange={doData =>
              setHealthData(prev => ({ ...prev, digitalocean: doData }))
            }
          />
        </div>

        <div className='health-section'>
          <h2 className='section-title'>🌐 Service Health</h2>
          <ServiceHealth
            ref={serviceHealthRef}
            services={healthData.services}
          />
        </div>
      </div>

      <div className='health-footer' />
    </div>
  );
}

export default HealthPage;
