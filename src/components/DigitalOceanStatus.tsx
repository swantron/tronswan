import React, { useState } from 'react';

import {
  DigitalOceanDroplet,
  DigitalOceanLoadBalancer,
  DigitalOceanDatabase,
} from '../services/digitalOceanService';
import '../styles/DigitalOceanStatus.css';

interface DigitalOceanStatusProps {
  data: {
    app: any;
    droplets: DigitalOceanDroplet[];
    loadBalancers: DigitalOceanLoadBalancer[];
    databases: DigitalOceanDatabase[];
    loading: boolean;
    error: string | null;
  };
  onDataChange: (data: any) => void;
}

function DigitalOceanStatus({
  data,
  onDataChange: _onDataChange,
}: DigitalOceanStatusProps) {
  const [activeTab, setActiveTab] = useState<'app' | 'droplets'>('app');

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
          Droplets ({data.droplets?.length || 0})
        </button>
      </div>

      <div className='do-content'>
        {activeTab === 'app' && (
          <div className='app-tab'>
            {data.app ? (
              <div className='app-info'>
                <div className='app-header'>
                  <div className='app-title-section'>
                    <h4>{data.app.spec?.name || 'tronswan-react-app'}</h4>
                    <p className='app-description'>
                      DigitalOcean App Platform Application
                    </p>
                  </div>
                  <div className='status-section'>
                    <span
                      className={`status ${getStatusClass(data.app.last_deployment_active_at ? 'active' : 'inactive')}`}
                    >
                      {getStatusIcon(
                        data.app.last_deployment_active_at
                          ? 'active'
                          : 'inactive'
                      )}
                      {data.app.last_deployment_active_at
                        ? 'ACTIVE'
                        : 'INACTIVE'}
                    </span>
                    {data.app.active_deployment?.phase && (
                      <span className='deployment-phase'>
                        Phase: {data.app.active_deployment.phase}
                      </span>
                    )}
                  </div>
                </div>
                <div className='app-details'>
                  <div className='detail-item'>
                    <span className='label'>App ID:</span>
                    <span className='value'>{data.app.id}</span>
                  </div>
                  <div className='detail-item'>
                    <span className='label'>Region:</span>
                    <span className='value'>
                      {data.app.region?.label || data.app.region?.slug || 'N/A'}
                    </span>
                  </div>
                  <div className='detail-item'>
                    <span className='label'>Tier:</span>
                    <span className='value'>
                      {data.app.tier_slug?.toUpperCase() || 'N/A'}
                    </span>
                  </div>
                  <div className='detail-item'>
                    <span className='label'>Created:</span>
                    <span className='value'>
                      {data.app.created_at
                        ? new Date(data.app.created_at).toLocaleDateString()
                        : 'N/A'}
                    </span>
                  </div>
                  <div className='detail-item'>
                    <span className='label'>Last Updated:</span>
                    <span className='value'>
                      {data.app.updated_at
                        ? new Date(data.app.updated_at).toLocaleDateString()
                        : 'N/A'}
                    </span>
                  </div>
                  <div className='detail-item'>
                    <span className='label'>Last Deployed:</span>
                    <span className='value'>
                      {data.app.last_deployment_active_at
                        ? new Date(
                            data.app.last_deployment_active_at
                          ).toLocaleDateString()
                        : 'N/A'}
                    </span>
                  </div>
                  <div className='detail-item'>
                    <span className='label'>Live URL:</span>
                    <span className='value'>
                      <a
                        href={data.app.live_url}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        {data.app.live_url || 'N/A'}
                      </a>
                    </span>
                  </div>
                  <div className='detail-item'>
                    <span className='label'>Default Ingress:</span>
                    <span className='value'>
                      <a
                        href={data.app.default_ingress}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        {data.app.default_ingress || 'N/A'}
                      </a>
                    </span>
                  </div>
                  <div className='detail-item'>
                    <span className='label'>Live Domain:</span>
                    <span className='value'>
                      {data.app.live_domain || 'N/A'}
                    </span>
                  </div>
                  <div className='detail-item'>
                    <span className='label'>Active Deployment ID:</span>
                    <span className='value'>
                      {data.app.active_deployment?.id || 'N/A'}
                    </span>
                  </div>
                  <div className='detail-item'>
                    <span className='label'>Deployment Phase:</span>
                    <span className='value'>
                      {data.app.active_deployment?.phase || 'N/A'}
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
            {(data.droplets?.length || 0) === 0 ? (
              <p className='no-data'>No droplets found</p>
            ) : (
              <div className='droplets-list'>
                {(data.droplets || []).map(droplet => (
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
