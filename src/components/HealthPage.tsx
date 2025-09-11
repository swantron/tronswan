import React, { useState, useEffect } from 'react';
import SEO from './SEO';
import GitHubStatus from './GitHubStatus';
import DigitalOceanStatus from './DigitalOceanStatus';
import ServiceHealth from './ServiceHealth';
import { runtimeConfig } from '../utils/runtimeConfig';
import '../styles/HealthPage.css';

interface HealthData {
  github: {
    user: any;
    repositories: any[];
    workflows: any[];
    workflowRuns: any[];
    loading: boolean;
    error: string | null;
  };
  digitalocean: {
    droplets: any[];
    loadBalancers: any[];
    databases: any[];
    account: any;
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
      workflows: [],
      workflowRuns: [],
      loading: true,
      error: null,
    },
    digitalocean: {
      droplets: [],
      loadBalancers: [],
      databases: [],
      account: null,
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

  const refreshData = async () => {
    setIsRefreshing(true);
    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  useEffect(() => {
    // Initialize runtime config on component mount
    const initializeConfig = async () => {
      await runtimeConfig.initialize();
    };
    
    initializeConfig();
    
    const interval = setInterval(refreshData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="health-page">
      <SEO
        title="Service Health & Deployment Status - Tron Swan"
        description="Monitor service health, deployment status, and infrastructure metrics for Tron Swan applications. Real-time status from GitHub Actions and DigitalOcean."
        keywords="service health, deployment status, GitHub Actions, DigitalOcean, monitoring, DevOps"
        url="/health"
      />
      
      <div className="health-header">
        <h1 className="health-title" data-testid="health-title">Service Health</h1>
        <p className="health-subtitle">Monitor deployments, infrastructure, and service status</p>
        
        <div className="health-controls">
          <button 
            className={`refresh-button ${isRefreshing ? 'refreshing' : ''}`}
            onClick={refreshData}
            disabled={isRefreshing}
            data-testid="refresh-button"
          >
            {isRefreshing ? '🔄 Refreshing...' : '🔄 Refresh'}
          </button>
          <span className="last-updated" data-testid="last-updated">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
        </div>
      </div>

      <div className="health-grid">
        <div className="health-section">
          <h2 className="section-title">🚀 Deployment Status</h2>
          <GitHubStatus 
            data={healthData.github}
            onDataChange={(githubData) => 
              setHealthData(prev => ({ ...prev, github: githubData }))
            }
          />
        </div>

        <div className="health-section">
          <h2 className="section-title">☁️ Infrastructure</h2>
          <DigitalOceanStatus 
            data={healthData.digitalocean}
            onDataChange={(doData) => 
              setHealthData(prev => ({ ...prev, digitalocean: doData }))
            }
          />
        </div>

        <div className="health-section">
          <h2 className="section-title">🌐 Service Health</h2>
          <ServiceHealth services={healthData.services} />
        </div>
      </div>

      <div className="health-footer">
        <p className="health-note">
          💡 This dashboard shows real-time status from GitHub Actions and DigitalOcean APIs.
          <br />
          Configure API tokens in environment variables for full functionality.
        </p>
      </div>
    </div>
  );
}

export default HealthPage;
