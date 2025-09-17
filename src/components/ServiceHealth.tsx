import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from 'react';
import '../styles/ServiceHealth.css';

interface ServiceHealthProps {
  services: {
    tronswan: 'healthy' | 'degraded' | 'down';
    chomptron: 'healthy' | 'degraded' | 'down';
    swantron: 'healthy' | 'degraded' | 'down';
  };
}

export interface ServiceHealthRef {
  checkAllServices: () => Promise<void>;
}

interface ServiceInfo {
  name: string;
  url: string;
  description: string;
  status: 'healthy' | 'degraded' | 'down';
  lastChecked: Date;
  responseTime?: number;
  uptime?: number;
}

const ServiceHealth = forwardRef<ServiceHealthRef, ServiceHealthProps>(
  ({ services }, ref) => {
    const [serviceData, setServiceData] = useState<ServiceInfo[]>([
      {
        name: 'React portfolio site',
        url: 'https://tronswan.com',
        description: '',
        status: services.tronswan,
        lastChecked: new Date(),
      },
      {
        name: 'Recipe sharing platform',
        url: 'https://chomptron.com',
        description: '',
        status: services.chomptron,
        lastChecked: new Date(),
      },
      {
        name: 'The OG blog',
        url: 'https://swantron.com',
        description: '',
        status: services.swantron,
        lastChecked: new Date(),
      },
    ]);

    const checkServiceHealth = async (service: ServiceInfo) => {
      try {
        const startTime = Date.now();
        await fetch(service.url, {
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-cache',
        });
        const responseTime = Date.now() - startTime;

        return {
          ...service,
          status: 'healthy' as const,
          responseTime,
          lastChecked: new Date(),
        };
      } catch {
        return {
          ...service,
          status: 'down' as const,
          lastChecked: new Date(),
        };
      }
    };

    const checkAllServices = useCallback(async () => {
      const updatedServices = await Promise.all(
        serviceData.map(service => checkServiceHealth(service))
      );

      setServiceData(updatedServices);
    }, [serviceData]);

    // Expose checkAllServices to parent component
    useImperativeHandle(ref, () => ({
      checkAllServices,
    }));

    useEffect(() => {
      checkAllServices();
      const interval = setInterval(checkAllServices, 60000); // Check every minute
      return () => clearInterval(interval);
    }, [checkAllServices]);

    const getStatusIcon = (status: 'healthy' | 'degraded' | 'down') => {
      switch (status) {
        case 'healthy':
          return '✅';
        case 'degraded':
          return '⚠️';
        case 'down':
          return '❌';
        default:
          return '❓';
      }
    };

    const getStatusClass = (status: 'healthy' | 'degraded' | 'down') => {
      switch (status) {
        case 'healthy':
          return 'status-healthy';
        case 'degraded':
          return 'status-degraded';
        case 'down':
          return 'status-down';
        default:
          return 'status-unknown';
      }
    };

    const getStatusText = (status: 'healthy' | 'degraded' | 'down') => {
      switch (status) {
        case 'healthy':
          return 'Operational';
        case 'degraded':
          return 'Degraded Performance';
        case 'down':
          return 'Service Unavailable';
        default:
          return 'Unknown';
      }
    };

    return (
      <div className='service-health'>
        <div className='service-layout'>
          <div className='service-summary'>
            <h3>Service Summary</h3>
            <div className='summary-stats'>
              <div className='stat'>
                <span className='stat-number'>
                  {serviceData.filter(s => s.status === 'healthy').length}
                </span>
                <span className='stat-label'>Healthy</span>
              </div>
              <div className='stat'>
                <span className='stat-number'>
                  {serviceData.filter(s => s.status === 'degraded').length}
                </span>
                <span className='stat-label'>Degraded</span>
              </div>
              <div className='stat'>
                <span className='stat-number'>
                  {serviceData.filter(s => s.status === 'down').length}
                </span>
                <span className='stat-label'>Down</span>
              </div>
            </div>
          </div>

          <div className='services-list'>
            {serviceData.map((service, index) => (
              <div
                key={index}
                className={`service-item ${getStatusClass(service.status)}`}
              >
                <div className='service-header'>
                  <h4 className='service-name'>{service.name}</h4>
                  <div className='service-status'>
                    <span
                      className={`status-indicator ${getStatusClass(service.status)}`}
                    >
                      {getStatusIcon(service.status)}{' '}
                      {getStatusText(service.status)}
                    </span>
                  </div>
                </div>

                <div className='service-info'>
                  {service.description && (
                    <p className='service-description'>{service.description}</p>
                  )}
                  <div className='service-url'>
                    <a
                      href={service.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='service-link'
                    >
                      {service.url}
                    </a>
                  </div>

                  <div className='service-metrics'>
                    <div className='metric'>
                      <span className='metric-label'>Last Checked:</span>
                      <span className='metric-value'>
                        {service.lastChecked.toLocaleTimeString()}
                      </span>
                    </div>

                    {service.responseTime && (
                      <div className='metric'>
                        <span className='metric-label'>Response Time:</span>
                        <span className='metric-value'>
                          {service.responseTime}ms
                        </span>
                      </div>
                    )}

                    {service.uptime && (
                      <div className='metric'>
                        <span className='metric-label'>Uptime:</span>
                        <span className='metric-value'>{service.uptime}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
);

ServiceHealth.displayName = 'ServiceHealth';

export default ServiceHealth;
