import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useCallback,
  useRef,
} from 'react';

import { logger } from '../../utils/logger';
import { runtimeConfig } from '../../utils/runtimeConfig';
import '../../styles/ServiceHealth.css';

interface ServiceHealthProps {
  services: {
    tronswan: 'healthy' | 'degraded' | 'down';
    chompton: 'healthy' | 'degraded' | 'down';
    swantron: 'healthy' | 'degraded' | 'down';
    jswan: 'healthy' | 'degraded' | 'down';
    mlbApi: 'healthy' | 'degraded' | 'down';
    spotifyApi: 'healthy' | 'degraded' | 'down';
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
        description: 'this site',
        status: services.tronswan,
        lastChecked: new Date(),
      },
      {
        name: 'AI Recipe App',
        url: 'https://chompton.com',
        description: 'AI-powered recipes with Gemini on GCP',
        status: services.chompton,
        lastChecked: new Date(),
      },
      {
        name: 'The OG blog',
        url: 'https://swantron.com',
        description: 'wp blog on Siteground',
        status: services.swantron,
        lastChecked: new Date(),
      },
      {
        name: 'Personal development site',
        url: 'https://jswan.dev',
        description: 'py placeholder on GAE',
        status: services.jswan,
        lastChecked: new Date(),
      },
      {
        name: 'MLB Stats API',
        url: 'https://statsapi.mlb.com/api/v1/standings?leagueId=103,104',
        description: 'baseball data',
        status: services.mlbApi,
        lastChecked: new Date(),
      },
      {
        name: 'Spotify API',
        url: 'https://api.spotify.com/v1/search?q=test&type=track&limit=1',
        description: 'spotify integration',
        status: services.spotifyApi,
        lastChecked: new Date(),
      },
    ]);

    const serviceDataRef = useRef(serviceData);
    serviceDataRef.current = serviceData;

    const checkServiceHealth = async (service: ServiceInfo) => {
      logger.debug('Starting health check for service', {
        serviceName: service.name,
        url: service.url,
        timestamp: new Date().toISOString(),
      });

      try {
        const startTime = Date.now();

        // Special handling for Spotify API - get access token first
        if (service.name === 'Spotify API') {
          try {
            // Get access token using client credentials flow
            const clientId = runtimeConfig.get('VITE_SPOTIFY_CLIENT_ID');
            const clientSecret = runtimeConfig.get(
              'VITE_SPOTIFY_CLIENT_SECRET'
            );

            const tokenResponse = await fetch(
              'https://accounts.spotify.com/api/token',
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                  Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
                },
                body: 'grant_type=client_credentials',
              }
            );

            if (!tokenResponse.ok) {
              throw new Error(`Token request failed: ${tokenResponse.status}`);
            }

            const tokenData = await tokenResponse.json();
            const accessToken = tokenData.access_token;

            // Now test the actual API endpoint with the token
            const apiResponse = await fetch(service.url, {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
              cache: 'no-cache',
            });

            const responseTime = Date.now() - startTime;

            if (apiResponse.ok) {
              logger.info('Spotify API health check successful', {
                serviceName: service.name,
                url: service.url,
                responseTime: `${responseTime}ms`,
                status: 'healthy',
                httpStatus: apiResponse.status,
                timestamp: new Date().toISOString(),
              });

              return {
                ...service,
                status: 'healthy' as const,
                responseTime,
                lastChecked: new Date(),
              };
            } else {
              throw new Error(`API request failed: ${apiResponse.status}`);
            }
          } catch (error) {
            logger.warn('Spotify API health check failed', {
              serviceName: service.name,
              url: service.url,
              error: error instanceof Error ? error.message : 'Unknown error',
              status: 'down',
              timestamp: new Date().toISOString(),
            });

            return {
              ...service,
              status: 'down' as const,
              lastChecked: new Date(),
            };
          }
        }
        // For other API endpoints, use GET to actually check the API response
        else if (service.name.includes('API')) {
          const response = await fetch(service.url, {
            method: 'GET',
            cache: 'no-cache',
          });

          const responseTime = Date.now() - startTime;

          // For other APIs, check if response is OK (200-299)
          if (response.ok) {
            logger.info('Service health check successful', {
              serviceName: service.name,
              url: service.url,
              responseTime: `${responseTime}ms`,
              status: 'healthy',
              httpStatus: response.status,
              timestamp: new Date().toISOString(),
            });

            return {
              ...service,
              status: 'healthy' as const,
              responseTime,
              lastChecked: new Date(),
            };
          } else {
            logger.warn('Service health check failed - bad response', {
              serviceName: service.name,
              url: service.url,
              httpStatus: response.status,
              status: 'down',
              timestamp: new Date().toISOString(),
            });

            return {
              ...service,
              status: 'down' as const,
              lastChecked: new Date(),
            };
          }
        } else {
          // For regular websites, use HEAD request
          await fetch(service.url, {
            method: 'HEAD',
            mode: 'no-cors',
            cache: 'no-cache',
          });
          const responseTime = Date.now() - startTime;

          logger.info('Service health check successful', {
            serviceName: service.name,
            url: service.url,
            responseTime: `${responseTime}ms`,
            status: 'healthy',
            timestamp: new Date().toISOString(),
          });

          return {
            ...service,
            status: 'healthy' as const,
            responseTime,
            lastChecked: new Date(),
          };
        }
      } catch (error) {
        logger.warn('Service health check failed', {
          serviceName: service.name,
          url: service.url,
          error: error instanceof Error ? error.message : 'Unknown error',
          status: 'down',
          timestamp: new Date().toISOString(),
        });

        return {
          ...service,
          status: 'down' as const,
          lastChecked: new Date(),
        };
      }
    };

    const checkAllServices = useCallback(async () => {
      logger.info('Starting health check for all services', {
        serviceCount: serviceDataRef.current.length,
        services: serviceDataRef.current.map(s => s.name),
        timestamp: new Date().toISOString(),
      });

      const updatedServices = await Promise.all(
        serviceDataRef.current.map(service => checkServiceHealth(service))
      );

      // Log summary of health check results
      const healthyCount = updatedServices.filter(
        s => s.status === 'healthy'
      ).length;
      const downCount = updatedServices.filter(s => s.status === 'down').length;

      logger.info('Health check completed for all services', {
        totalServices: updatedServices.length,
        healthyServices: healthyCount,
        downServices: downCount,
        services: updatedServices.map(s => ({
          name: s.name,
          status: s.status,
          responseTime: s.responseTime,
        })),
        timestamp: new Date().toISOString(),
      });

      setServiceData(updatedServices);
    }, []);

    // Expose checkAllServices to parent component
    useImperativeHandle(ref, () => ({
      checkAllServices,
    }));

    useEffect(() => {
      logger.info('ServiceHealth component initialized', {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      });

      checkAllServices();
      const interval = setInterval(() => {
        logger.debug('Periodic health check triggered', {
          timestamp: new Date().toISOString(),
        });
        checkAllServices();
      }, 60000); // Check every minute

      return () => {
        logger.debug('ServiceHealth component cleanup - clearing interval', {
          timestamp: new Date().toISOString(),
        });
        clearInterval(interval);
      };
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
