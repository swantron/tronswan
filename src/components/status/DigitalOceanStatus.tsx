import React, { useState } from 'react';

import {
  DigitalOceanDroplet,
  DigitalOceanLoadBalancer,
  DigitalOceanDatabase,
  type DigitalOceanApp,
} from '../../services/digitalOceanService';
import '../../styles/DigitalOceanStatus.css';

interface DigitalOceanData {
  app: DigitalOceanApp | unknown;
  droplets: DigitalOceanDroplet[] | unknown[];
  loadBalancers: DigitalOceanLoadBalancer[] | unknown[];
  databases: DigitalOceanDatabase[] | unknown[];
  loading: boolean;
  error: string | null;
}

interface DigitalOceanStatusProps {
  data: DigitalOceanData;
  onDataChange: (data: DigitalOceanData) => void;
}

function DigitalOceanStatus({
  data,
  onDataChange: _onDataChange,
}: DigitalOceanStatusProps) {
  const [activeTab, setActiveTab] = useState<'app' | 'droplets'>('app');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const app = data.app as any;
  const droplets = data.droplets as DigitalOceanDroplet[];

  // Data fetching is now handled by the parent HealthPage component

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return '✅';
      case 'new':
        return '🆕';
      case 'off':
        return '⏸️';
      case 'archive':
        return '📦';
      case 'online':
        return '✅';
      case 'creating':
        return '🔄';
      case 'resizing':
        return '📏';
      case 'migrating':
        return '🚚';
      case 'backing_up':
        return '💾';
      case 'restoring':
        return '🔄';
      case 'maintenance':
        return '🔧';
      case 'offline':
        return '❌';
      case 'errored':
        return '❌';
      default:
        return '❓';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'active':
      case 'online':
        return 'status-active';
      case 'new':
      case 'creating':
        return 'status-new';
      case 'off':
      case 'offline':
        return 'status-off';
      case 'archive':
        return 'status-archive';
      case 'errored':
        return 'status-error';
      case 'resizing':
      case 'migrating':
      case 'backing_up':
      case 'restoring':
      case 'maintenance':
        return 'status-maintenance';
      default:
        return 'status-unknown';
    }
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  if (data.loading) {
    return (
      <div className='digitalocean-status loading'>
        <div className='loading-spinner'>🔄</div>
        <p>Loading DigitalOcean data...</p>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className='digitalocean-status error'>
        <div className='error-icon'>⚠️</div>
        <p>Error: {data.error}</p>
        <small>Check your DigitalOcean API token configuration</small>
      </div>
    );
  }

  return (
    <div className='digitalocean-status'>
      <div className='do-tabs'>
        <button
          className={`tab ${activeTab === 'app' ? 'active' : ''}`}
          onClick={() => setActiveTab('app')}
        >
          App Platform
        </button>
        <button
          className={`tab ${activeTab === 'droplets' ? 'active' : ''}`}
          onClick={() => setActiveTab('droplets')}
        >
          Droplets ({droplets?.length || 0})
        </button>
      </div>

      <div className='do-content'>
        {activeTab === 'app' && (
          <div className='app-tab'>
            {app ? (
              <div className='app-info'>
                <div className='app-header'>
                  <div className='app-title-section'>
                    <h4>{app.spec?.name || 'tronswan-react-app'}</h4>
                    <p className='app-description'>
                      DigitalOcean App Platform Application
                    </p>
                  </div>
                  <div className='status-section'>
                    <span
                      className={`status ${getStatusClass(app.last_deployment_active_at ? 'active' : 'inactive')}`}
                    >
                      {getStatusIcon(
                        app.last_deployment_active_at ? 'active' : 'inactive'
                      )}
                      {app.last_deployment_active_at ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                    {app.active_deployment?.phase && (
                      <span className='deployment-phase'>
                        Phase: {app.active_deployment.phase}
                      </span>
                    )}
                  </div>
                </div>
                <div className='app-details'>
                  <div className='detail-item'>
                    <span className='label'>App ID:</span>
                    <span className='value'>{app.id}</span>
                  </div>
                  <div className='detail-item'>
                    <span className='label'>Region:</span>
                    <span className='value'>
                      {app.region?.label || app.region?.slug || 'N/A'}
                    </span>
                  </div>
                  <div className='detail-item'>
                    <span className='label'>Tier:</span>
                    <span className='value'>
                      {app.tier_slug?.toUpperCase() || 'N/A'}
                    </span>
                  </div>
                  <div className='detail-item'>
                    <span className='label'>Created:</span>
                    <span className='value'>
                      {app.created_at
                        ? new Date(app.created_at).toLocaleDateString()
                        : 'N/A'}
                    </span>
                  </div>
                  <div className='detail-item'>
                    <span className='label'>Last Updated:</span>
                    <span className='value'>
                      {app.updated_at
                        ? new Date(app.updated_at).toLocaleDateString()
                        : 'N/A'}
                    </span>
                  </div>
                  <div className='detail-item'>
                    <span className='label'>Last Deployed:</span>
                    <span className='value'>
                      {app.last_deployment_active_at
                        ? new Date(
                            app.last_deployment_active_at
                          ).toLocaleDateString()
                        : 'N/A'}
                    </span>
                  </div>
                  <div className='detail-item'>
                    <span className='label'>Live URL:</span>
                    <span className='value'>
                      <a
                        href={app.live_url}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        {app.live_url || 'N/A'}
                      </a>
                    </span>
                  </div>
                  <div className='detail-item'>
                    <span className='label'>Default Ingress:</span>
                    <span className='value'>
                      <a
                        href={app.default_ingress}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        {app.default_ingress || 'N/A'}
                      </a>
                    </span>
                  </div>
                  <div className='detail-item'>
                    <span className='label'>Live Domain:</span>
                    <span className='value'>{app.live_domain || 'N/A'}</span>
                  </div>
                  <div className='detail-item'>
                    <span className='label'>Active Deployment ID:</span>
                    <span className='value'>
                      {app.active_deployment?.id || 'N/A'}
                    </span>
                  </div>
                  <div className='detail-item'>
                    <span className='label'>Deployment Phase:</span>
                    <span className='value'>
                      {app.active_deployment?.phase || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className='no-data'>App information not available</p>
            )}
          </div>
        )}

        {activeTab === 'droplets' && (
          <div className='droplets-tab'>
            <h3>Droplets</h3>
            {(droplets?.length || 0) === 0 ? (
              <p className='no-data'>No droplets found</p>
            ) : (
              <div className='droplets-list'>
                {(droplets || []).map(droplet => (
                  <div key={droplet.id} className='droplet-item'>
                    <div className='droplet-header'>
                      <h4>{droplet.name}</h4>
                      <span
                        className={`status ${getStatusClass(droplet.status)}`}
                      >
                        {getStatusIcon(droplet.status)} {droplet.status}
                      </span>
                    </div>
                    <div className='droplet-info'>
                      <div className='droplet-specs'>
                        <span>
                          <strong>vCPUs:</strong> {droplet.vcpus}
                        </span>
                        <span>
                          <strong>RAM:</strong>{' '}
                          {formatBytes(droplet.memory * 1024 * 1024)}
                        </span>
                        <span>
                          <strong>Disk:</strong>{' '}
                          {formatBytes(droplet.disk * 1024 * 1024 * 1024)}
                        </span>
                        <span>
                          <strong>Size:</strong> {droplet.size_slug}
                        </span>
                      </div>
                      <div className='droplet-details'>
                        <span>
                          <strong>Region:</strong> {droplet.region.name}
                        </span>
                        <span>
                          <strong>Image:</strong> {droplet.image.name}
                        </span>
                        <span>
                          <strong>Created:</strong>{' '}
                          {new Date(droplet.created_at).toLocaleDateString()}
                        </span>
                        <span>
                          <strong>Price:</strong>{' '}
                          {formatPrice(droplet.size.price_monthly)}/month
                        </span>
                      </div>
                      <div className='droplet-networks'>
                        <strong>IP Addresses:</strong>
                        {droplet.networks.v4.map((network, index) => (
                          <span key={index} className='ip-address'>
                            {network.ip_address} ({network.type})
                          </span>
                        ))}
                      </div>
                      {droplet.tags.length > 0 && (
                        <div className='droplet-tags'>
                          <strong>Tags:</strong>
                          {droplet.tags.map(tag => (
                            <span key={tag} className='tag'>
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DigitalOceanStatus;
