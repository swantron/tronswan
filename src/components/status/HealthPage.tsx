import React, { useState, useEffect, useRef } from 'react';

import digitalOceanService from '../../services/digitalOceanService';
import type {
  GitHubRepository,
  GitHubWorkflowRun,
  GitHubUser,
} from '../../services/githubService';
import { logger } from '../../utils/logger';
import { runtimeConfig } from '../../utils/runtimeConfig';
import SEO from '../ui/SEO';

import DigitalOceanStatus from './DigitalOceanStatus';
import GitHubStatus from './GitHubStatus';
import IncidentHistory from './IncidentHistory';
import ServiceHealth, { ServiceHealthRef } from './ServiceHealth';

import '../../styles/HealthPage.css';

interface HealthData {
  github: {
    user: GitHubUser | null;
    repositories: GitHubRepository[];
    tronswanActions: GitHubWorkflowRun[];
    chomptronActions: GitHubWorkflowRun[];
    secureBaseImagesActions: GitHubWorkflowRun[];
    readmeLintActions: GitHubWorkflowRun[];
    loading: boolean;
    error: string | null;
  };
  digitalocean: {
    app: unknown;
    droplets: unknown[];
    loadBalancers: unknown[];
    databases: unknown[];
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
      secureBaseImagesActions: [],
      readmeLintActions: [],
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
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [countdown, setCountdown] = useState(30);
  const serviceHealthRef = useRef<ServiceHealthRef>(null);

  const refreshData = async () => {
    setIsRefreshing(true);
    setLastUpdated(new Date());
    setCountdown(30);

    // Trigger service health checks
    if (serviceHealthRef.current) {
      await serviceHealthRef.current.checkAllServices();
    }

    setIsRefreshing(false);
  };

  // Calculate overall status
  const getOverallStatus = () => {
    const services = Object.values(healthData.services);
    const healthyCount = services.filter(s => s === 'healthy').length;
    const totalCount = services.length;
    const downCount = services.filter(s => s === 'down').length;
    const degradedCount = services.filter(s => s === 'degraded').length;

    return {
      allHealthy: healthyCount === totalCount,
      healthyCount,
      totalCount,
      downCount,
      degradedCount,
      status:
        downCount > 0 ? 'down' : degradedCount > 0 ? 'degraded' : 'healthy',
    };
  };

  // Count deployment issues
  const getDeploymentStatus = () => {
    const failedDeployments = [
      ...healthData.github.tronswanActions,
      ...healthData.github.chomptronActions,
      ...healthData.github.secureBaseImagesActions,
      ...healthData.github.readmeLintActions,
    ].filter(run => run.conclusion === 'failure').length;

    return { failedDeployments };
  };

  // Count infrastructure issues
  const getInfrastructureStatus = () => {
    return {
      hasError: !!healthData.digitalocean.error,
    };
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

    // Auto-refresh interval with countdown
    const interval = setInterval(() => {
      if (autoRefreshEnabled) {
        refreshData();
      }
    }, 30000);

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(countdownInterval);
    };
  }, [autoRefreshEnabled]);

  return (
    <div className='health-page'>
      <SEO
        title='Service Health & Deployment Status - Tron Swan'
        description='Monitor service health, deployment status, and infrastructure metrics for Tron Swan applications. Real-time status from GitHub Actions and DigitalOcean.'
        keywords='service health, deployment status, GitHub Actions, DigitalOcean, monitoring, DevOps'
        url='/status'
      />

      <div className='health-content'>
        <h1 className='page-title health-title' data-testid='health-title'>
          service health & status
        </h1>

        {/* Overall Status Summary */}
        {(() => {
          const overallStatus = getOverallStatus();
          return (
            <div
              className={`overall-status-card status-${overallStatus.status}`}
            >
              <div className='status-indicator'>
                {overallStatus.allHealthy ? (
                  <>
                    <span className='status-icon'>✅</span>
                    <span className='status-text'>All Systems Operational</span>
                  </>
                ) : overallStatus.downCount > 0 ? (
                  <>
                    <span className='status-icon'>🔴</span>
                    <span className='status-text'>System Issues Detected</span>
                  </>
                ) : (
                  <>
                    <span className='status-icon'>⚠️</span>
                    <span className='status-text'>Degraded Performance</span>
                  </>
                )}
              </div>
              <div className='status-metrics'>
                <div className='metric'>
                  <span className='metric-value'>
                    {overallStatus.healthyCount}/{overallStatus.totalCount}
                  </span>
                  <span className='metric-label'>services healthy</span>
                </div>
                {overallStatus.downCount > 0 && (
                  <div className='metric metric-error'>
                    <span className='metric-value'>
                      {overallStatus.downCount}
                    </span>
                    <span className='metric-label'>down</span>
                  </div>
                )}
                {overallStatus.degradedCount > 0 && (
                  <div className='metric metric-warning'>
                    <span className='metric-value'>
                      {overallStatus.degradedCount}
                    </span>
                    <span className='metric-label'>degraded</span>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Incident History */}
        <IncidentHistory days={7} />

        <div className='health-controls'>
          <button
            className={`refresh-button ${isRefreshing ? 'refreshing' : ''}`}
            onClick={refreshData}
            disabled={isRefreshing}
            data-testid='refresh-button'
          >
            {isRefreshing ? '🔄 Refreshing...' : '🔄 Refresh'}
          </button>
          <button
            className={`auto-refresh-toggle ${autoRefreshEnabled ? 'enabled' : 'disabled'}`}
            onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
            title={
              autoRefreshEnabled
                ? 'Disable auto-refresh'
                : 'Enable auto-refresh'
            }
          >
            {autoRefreshEnabled ? '⏸️ Pause' : '▶️ Resume'}
          </button>
          <span className='last-updated' data-testid='last-updated'>
            Last updated: {lastUpdated.toLocaleTimeString()}
            {autoRefreshEnabled && (
              <span className='countdown'> • Next refresh in {countdown}s</span>
            )}
          </span>
        </div>

        {/* Quick Actions */}
        <div className='quick-actions'>
          <a
            href='https://github.com/swantron/tronswan/actions'
            target='_blank'
            rel='noopener noreferrer'
            className='quick-action-link'
          >
            📊 GitHub Actions →
          </a>
          <a
            href='https://cloud.digitalocean.com/apps'
            target='_blank'
            rel='noopener noreferrer'
            className='quick-action-link'
          >
            ☁️ DO Dashboard →
          </a>
          <a
            href='https://console.cloud.google.com/run/detail/us-central1/chomptron/observability/metrics?project=chomptron'
            target='_blank'
            rel='noopener noreferrer'
            className='quick-action-link'
          >
            📈 GCP Metrics →
          </a>
        </div>

        {/* Tab Navigation */}
        <div className='tab-navigation'>
          {(() => {
            const overallStatus = getOverallStatus();
            const deploymentStatus = getDeploymentStatus();
            const infraStatus = getInfrastructureStatus();

            return (
              <>
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
                  {overallStatus.downCount > 0 && (
                    <span className='tab-badge badge-error'>
                      {overallStatus.downCount}
                    </span>
                  )}
                  {overallStatus.downCount === 0 &&
                    overallStatus.degradedCount === 0 && (
                      <span className='tab-badge badge-success'>✓</span>
                    )}
                  {overallStatus.degradedCount > 0 &&
                    overallStatus.downCount === 0 && (
                      <span className='tab-badge badge-warning'>
                        {overallStatus.degradedCount}
                      </span>
                    )}
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
                  {deploymentStatus.failedDeployments > 0 && (
                    <span className='tab-badge badge-error'>
                      {deploymentStatus.failedDeployments}
                    </span>
                  )}
                  {!healthData.github.loading &&
                    deploymentStatus.failedDeployments === 0 && (
                      <span className='tab-badge badge-success'>✓</span>
                    )}
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
                  {infraStatus.hasError && (
                    <span className='tab-badge badge-error'>!</span>
                  )}
                  {!healthData.digitalocean.loading &&
                    !infraStatus.hasError && (
                      <span className='tab-badge badge-success'>✓</span>
                    )}
                </button>
              </>
            );
          })()}
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
