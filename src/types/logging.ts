export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  timestamp: string;
  source?: string;
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableProductionLogging: boolean;
  serviceName?: string;
  maxContextDepth?: number;
  enableStackTrace?: boolean;
  enablePerformanceLogging?: boolean;
  logRetentionDays?: number;
}

export type LogContext =
  | Record<string, any>
  | Error
  | string
  | number
  | boolean
  | null
  | undefined;
