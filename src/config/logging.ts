import { LogLevel, LoggerConfig } from '../types/logging';

export const getLoggingConfig = (): LoggerConfig => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isTest = process.env.NODE_ENV === 'test';

  if (isTest) {
    return testConfig;
  }

  if (isDevelopment) {
    return developmentConfig;
  }

  return productionConfig;
};

// Environment-specific configurations
export const developmentConfig: LoggerConfig = {
  level: LogLevel.DEBUG,
  enableConsole: true,
  enableProductionLogging: false,
  serviceName: 'tronswan-dev',
  maxContextDepth: 5,
  enableStackTrace: true,
  enablePerformanceLogging: true,
  logRetentionDays: 7,
};

export const productionConfig: LoggerConfig = {
  level: LogLevel.ERROR,
  enableConsole: false,
  enableProductionLogging: true,
  serviceName: 'tronswan-prod',
  maxContextDepth: 3,
  enableStackTrace: false,
  enablePerformanceLogging: false,
  logRetentionDays: 30,
};

export const testConfig: LoggerConfig = {
  level: LogLevel.ERROR,
  enableConsole: false,
  enableProductionLogging: false,
  serviceName: 'tronswan-test',
  maxContextDepth: 2,
  enableStackTrace: false,
  enablePerformanceLogging: false,
  logRetentionDays: 1,
};
