import React, { useState, useEffect } from 'react';
import digitalOceanService, { DigitalOceanDroplet, DigitalOceanLoadBalancer, DigitalOceanDatabase } from '../services/digitalOceanService';
import '../styles/DigitalOceanStatus.css';

interface DigitalOceanStatusProps {
  data: {
    droplets: DigitalOceanDroplet[];
    loadBalancers: DigitalOceanLoadBalancer[];
    databases: DigitalOceanDatabase[];
    account: any;
    loading: boolean;
    error: string | null;
  };
  onDataChange: (data: any) => void;
}

function DigitalOceanStatus({ data, onDataChange }: DigitalOceanStatusProps) {
  const [activeTab, setActiveTab] = useState<'droplets' | 'loadbalancers' | 'databases' | 'account'>('droplets');

  useEffect(() => {
    const fetchData = async () => {
      try {
        onDataChange({ ...data, loading: true, error: null });
        
        const [droplets, loadBalancers, databases, account] = await Promise.all([
          digitalOceanService.getDroplets(),
          digitalOceanService.getLoadBalancers(),
          digitalOceanService.getDatabases(),
          digitalOceanService.getAccount(),
        ]);
        
        onDataChange({ 
          ...data, 
          droplets, 
          loadBalancers, 
          databases, 
          account: account.account,
          loading: false 
        });
      } catch (error) {
        onDataChange({ 
          ...data, 
          loading: false, 
          error: error instanceof Error ? error.message : 'Failed to fetch DigitalOcean data'
        });
      }
    };

    fetchData();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '✅';
      case 'new': return '🆕';
      case 'off': return '⏸️';
      case 'archive': return '📦';
      case 'online': return '✅';
      case 'creating': return '🔄';
      case 'resizing': return '📏';
      case 'migrating': return '🚚';
      case 'backing_up': return '💾';
      case 'restoring': return '🔄';
      case 'maintenance': return '🔧';
      case 'offline': return '❌';
      case 'errored': return '❌';
      default: return '❓';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'active':
      case 'online': return 'status-active';
      case 'new':
      case 'creating': return 'status-new';
      case 'off':
      case 'offline': return 'status-off';
      case 'archive': return 'status-archive';
      case 'errored': return 'status-error';
      case 'resizing':
      case 'migrating':
      case 'backing_up':
      case 'restoring':
      case 'maintenance': return 'status-maintenance';
      default: return 'status-unknown';
    }
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  if (data.loading) {
    return (
      <div className="digitalocean-status loading">
        <div className="loading-spinner">🔄</div>
        <p>Loading DigitalOcean data...</p>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="digitalocean-status error">
        <div className="error-icon">⚠️</div>
        <p>Error: {data.error}</p>
        <small>Check your DigitalOcean API token configuration</small>
      </div>
    );
  }

  return (
    <div className="digitalocean-status">
      <div className="do-tabs">
        <button 
          className={`tab ${activeTab === 'droplets' ? 'active' : ''}`}
          onClick={() => setActiveTab('droplets')}
        >
          Droplets ({data.droplets?.length || 0})
        </button>
        <button 
          className={`tab ${activeTab === 'loadbalancers' ? 'active' : ''}`}
          onClick={() => setActiveTab('loadbalancers')}
        >
          Load Balancers ({data.loadBalancers?.length || 0})
        </button>
        <button 
          className={`tab ${activeTab === 'databases' ? 'active' : ''}`}
          onClick={() => setActiveTab('databases')}
        >
          Databases ({data.databases?.length || 0})
        </button>
        <button 
          className={`tab ${activeTab === 'account' ? 'active' : ''}`}
          onClick={() => setActiveTab('account')}
        >
          Account
        </button>
      </div>

      <div className="do-content">
        {activeTab === 'droplets' && (
          <div className="droplets-tab">
            <h3>Droplets</h3>
            {(data.droplets?.length || 0) === 0 ? (
              <p className="no-data">No droplets found</p>
            ) : (
              <div className="droplets-list">
                {(data.droplets || []).map(droplet => (
                  <div key={droplet.id} className="droplet-item">
                    <div className="droplet-header">
                      <h4>{droplet.name}</h4>
                      <span className={`status ${getStatusClass(droplet.status)}`}>
                        {getStatusIcon(droplet.status)} {droplet.status}
                      </span>
                    </div>
                    <div className="droplet-info">
                      <div className="droplet-specs">
                        <span><strong>vCPUs:</strong> {droplet.vcpus}</span>
                        <span><strong>RAM:</strong> {formatBytes(droplet.memory * 1024 * 1024)}</span>
                        <span><strong>Disk:</strong> {formatBytes(droplet.disk * 1024 * 1024 * 1024)}</span>
                        <span><strong>Size:</strong> {droplet.size_slug}</span>
                      </div>
                      <div className="droplet-details">
                        <span><strong>Region:</strong> {droplet.region.name}</span>
                        <span><strong>Image:</strong> {droplet.image.name}</span>
                        <span><strong>Created:</strong> {new Date(droplet.created_at).toLocaleDateString()}</span>
                        <span><strong>Price:</strong> {formatPrice(droplet.size.price_monthly)}/month</span>
                      </div>
                      <div className="droplet-networks">
                        <strong>IP Addresses:</strong>
                        {droplet.networks.v4.map((network, index) => (
                          <span key={index} className="ip-address">
                            {network.ip_address} ({network.type})
                          </span>
                        ))}
                      </div>
                      {droplet.tags.length > 0 && (
                        <div className="droplet-tags">
                          <strong>Tags:</strong>
                          {droplet.tags.map(tag => (
                            <span key={tag} className="tag">{tag}</span>
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

        {activeTab === 'loadbalancers' && (
          <div className="loadbalancers-tab">
            <h3>Load Balancers</h3>
            {(data.loadBalancers?.length || 0) === 0 ? (
              <p className="no-data">No load balancers found</p>
            ) : (
              <div className="loadbalancers-list">
                {(data.loadBalancers || []).map(lb => (
                  <div key={lb.id} className="loadbalancer-item">
                    <div className="lb-header">
                      <h4>{lb.name}</h4>
                      <span className={`status ${getStatusClass(lb.status)}`}>
                        {getStatusIcon(lb.status)} {lb.status}
                      </span>
                    </div>
                    <div className="lb-info">
                      <div className="lb-details">
                        <span><strong>IP:</strong> {lb.ip}</span>
                        <span><strong>Algorithm:</strong> {lb.algorithm}</span>
                        <span><strong>Region:</strong> {lb.region.name}</span>
                        <span><strong>Droplets:</strong> {lb.droplet_ids.length}</span>
                      </div>
                      <div className="lb-rules">
                        <strong>Forwarding Rules:</strong>
                        {lb.forwarding_rules.map((rule, index) => (
                          <div key={index} className="rule">
                            {rule.entry_protocol}:{rule.entry_port} → {rule.target_protocol}:{rule.target_port}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'databases' && (
          <div className="databases-tab">
            <h3>Databases</h3>
            {(data.databases?.length || 0) === 0 ? (
              <p className="no-data">No databases found</p>
            ) : (
              <div className="databases-list">
                {(data.databases || []).map(db => (
                  <div key={db.id} className="database-item">
                    <div className="db-header">
                      <h4>{db.name}</h4>
                      <span className={`status ${getStatusClass(db.status)}`}>
                        {getStatusIcon(db.status)} {db.status}
                      </span>
                    </div>
                    <div className="db-info">
                      <div className="db-details">
                        <span><strong>Engine:</strong> {db.engine} {db.version}</span>
                        <span><strong>Size:</strong> {db.size}</span>
                        <span><strong>Nodes:</strong> {db.num_nodes}</span>
                        <span><strong>Region:</strong> {db.region}</span>
                      </div>
                      <div className="db-connection">
                        <strong>Connection:</strong>
                        <span className="connection-info">
                          {db.connection.host}:{db.connection.port}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'account' && (
          <div className="account-tab">
            <h3>Account Limits</h3>
            {data.account ? (
              <div className="account-limits">
                <div className="limit-item">
                  <span className="limit-label">Droplets:</span>
                  <span className="limit-value">{data.droplets?.length || 0} / {data.account?.droplet_limit || 0}</span>
                </div>
                <div className="limit-item">
                  <span className="limit-label">Load Balancers:</span>
                  <span className="limit-value">{data.loadBalancers?.length || 0} / {data.account?.load_balancer_limit || 0}</span>
                </div>
                <div className="limit-item">
                  <span className="limit-label">Databases:</span>
                  <span className="limit-value">{data.databases?.length || 0} / {data.account?.database_limit || 0}</span>
                </div>
                <div className="limit-item">
                  <span className="limit-label">Floating IPs:</span>
                  <span className="limit-value">0 / {data.account?.floating_ip_limit || 0}</span>
                </div>
                <div className="limit-item">
                  <span className="limit-label">Volumes:</span>
                  <span className="limit-value">0 / {data.account?.volume_limit || 0}</span>
                </div>
              </div>
            ) : (
              <p className="no-data">Account information not available</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DigitalOceanStatus;
