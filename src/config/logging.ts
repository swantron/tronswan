import { LogLevel, LoggerConfig } from '../types/logging';

export const getLoggingConfig = (): LoggerConfig => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return {
    level: isDevelopment ? LogLevel.DEBUG : LogLevel.ERROR,
    enableConsole: true,
    enableProductionLogging: !isDevelopment,
    serviceName: 'tronswan',
  };
};

// Environment-specific configurations
export const developmentConfig: LoggerConfig = {
  level: LogLevel.DEBUG,
  enableConsole: true,
  enableProductionLogging: false,
  serviceName: 'tronswan-dev',
};

export const productionConfig: LoggerConfig = {
  level: LogLevel.ERROR,
  enableConsole: false,
  enableProductionLogging: true,
  serviceName: 'tronswan-prod',
};

export const testConfig: LoggerConfig = {
  level: LogLevel.ERROR,
  enableConsole: false,
  enableProductionLogging: false,
  serviceName: 'tronswan-test',
};
