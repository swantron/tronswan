import { LogLevel, LogEntry, LoggerConfig, LogContext } from '../types/logging';
import { getLoggingConfig } from '../config/logging';

class Logger {
  private config: LoggerConfig;
  private isDevelopment: boolean;
  private isTest: boolean;
  private performanceStartTimes: Map<string, number> = new Map();

  constructor(config?: Partial<LoggerConfig>) {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isTest = process.env.NODE_ENV === 'test';

    this.config = {
      ...getLoggingConfig(),
      ...config,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.level;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: LogContext
  ): LogEntry {
    return {
      level,
      message,
      context: this.formatContext(context),
      timestamp: new Date().toISOString(),
      source: this.config.serviceName,
    };
  }

  private formatContext(context?: LogContext): Record<string, any> | undefined {
    if (!context) return undefined;

    if (context instanceof Error) {
      const errorContext: Record<string, any> = {
        name: context.name,
        message: context.message,
      };

      if (this.config.enableStackTrace && context.stack) {
        errorContext.stack = context.stack;
      }

      return errorContext;
    }

    if (typeof context === 'object' && context !== null) {
      return this.limitContextDepth(context as Record<string, any>);
    }

    return { value: context };
  }

  private limitContextDepth(obj: Record<string, any>, depth = 0): Record<string, any> {
    if (depth >= (this.config.maxContextDepth || 5)) {
      return { '[truncated]': 'Maximum context depth reached' };
    }

    const result: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        result[key] = this.limitContextDepth(value, depth + 1);
      } else {
        result[key] = value;
      }
    }

    return result;
  }

  private log(level: LogLevel, message: string, context?: LogContext): void {
    if (!this.shouldLog(level)) return;

    const logEntry = this.createLogEntry(level, message, context);

    // Console logging (development and debugging)
    if (this.config.enableConsole) {
      this.logToConsole(logEntry);
    }

    // Production logging (future enhancement)
    if (this.config.enableProductionLogging) {
      this.logToProduction(logEntry);
    }
  }

  private logToConsole(entry: LogEntry): void {
    const { level, message, context, timestamp } = entry;
    const prefix = `[${timestamp}] [${LogLevel[level]}]`;

    switch (level) {
      case LogLevel.DEBUG:
        console.log(prefix, message, context || '');
        break;
      case LogLevel.INFO:
        console.info(prefix, message, context || '');
        break;
      case LogLevel.WARN:
        console.warn(prefix, message, context || '');
        break;
      case LogLevel.ERROR:
        console.error(prefix, message, context || '');
        break;
    }
  }

  private logToProduction(entry: LogEntry): void {
    // Future enhancement: Send to logging service
    // For now, we'll just use console in production
    if (this.isDevelopment || this.isTest) return;

    // In a real implementation, this would send to:
    // - Sentry for errors
    // - Custom logging endpoint
    // - Log aggregation service
    // - CloudWatch, DataDog, etc.
    
    // For now, use structured console logging in production
    const productionLog = {
      timestamp: entry.timestamp,
      level: LogLevel[entry.level],
      message: entry.message,
      source: entry.source,
      context: entry.context,
    };

    if (entry.level === LogLevel.ERROR) {
      console.error(`[PROD] ${entry.message}`, productionLog);
    } else {
      console.log(`[PROD] ${entry.message}`, productionLog);
    }
  }

  // Public API methods
  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, context?: LogContext): void {
    this.log(LogLevel.ERROR, message, context);
  }

  // Utility method for API errors
  apiError(
    service: string,
    operation: string,
    error: Error,
    additionalContext?: LogContext
  ): void {
    this.error(`API error in ${service} during ${operation}`, {
      service,
      operation,
      error: this.formatContext(error),
      ...(additionalContext && typeof additionalContext === 'object'
        ? additionalContext
        : {}),
    });
  }

  // Utility method for configuration warnings
  configWarn(key: string, message: string, context?: LogContext): void {
    this.warn(`Configuration warning for ${key}: ${message}`, {
      configKey: key,
      ...(context && typeof context === 'object' ? context : {}),
    });
  }

  // Performance logging methods
  startTimer(label: string): void {
    if (!this.config.enablePerformanceLogging) return;
    
    this.performanceStartTimes.set(label, performance.now());
    this.debug(`Timer started: ${label}`, { timerLabel: label });
  }

  endTimer(label: string, context?: LogContext): void {
    if (!this.config.enablePerformanceLogging) return;

    const startTime = this.performanceStartTimes.get(label);
    if (startTime === undefined) {
      this.warn(`Timer not found: ${label}`, { timerLabel: label });
      return;
    }

    const duration = performance.now() - startTime;
    this.performanceStartTimes.delete(label);

    this.info(`Timer completed: ${label}`, {
      timerLabel: label,
      duration: `${duration.toFixed(2)}ms`,
      ...(context && typeof context === 'object' ? context : {}),
    });
  }

  // Method to measure function execution time
  async measureAsync<T>(
    label: string,
    fn: () => Promise<T>,
    context?: LogContext
  ): Promise<T> {
    this.startTimer(label);
    try {
      const result = await fn();
      this.endTimer(label, { ...context, success: true });
      return result;
    } catch (error) {
      this.endTimer(label, { 
        ...context, 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }

  // Method to measure synchronous function execution time
  measureSync<T>(
    label: string,
    fn: () => T,
    context?: LogContext
  ): T {
    this.startTimer(label);
    try {
      const result = fn();
      this.endTimer(label, { ...context, success: true });
      return result;
    } catch (error) {
      this.endTimer(label, { 
        ...context, 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }
}

// Create and export a singleton instance
export const logger = new Logger();

// Export the class for testing
export { Logger };
