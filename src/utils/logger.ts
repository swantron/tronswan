import { LogLevel, LogEntry, LoggerConfig, LogContext } from '../types/logging';

class Logger {
  private config: LoggerConfig;
  private isDevelopment: boolean;

  constructor(config?: Partial<LoggerConfig>) {
    this.isDevelopment = process.env.NODE_ENV === 'development';

    this.config = {
      level: this.isDevelopment ? LogLevel.DEBUG : LogLevel.ERROR,
      enableConsole: true,
      enableProductionLogging: !this.isDevelopment,
      serviceName: 'tronswan',
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
      return {
        name: context.name,
        message: context.message,
        stack: context.stack,
      };
    }

    if (typeof context === 'object' && context !== null) {
      return context as Record<string, any>;
    }

    return { value: context };
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
    if (this.isDevelopment) return;

    // In a real implementation, this would send to:
    // - Sentry for errors
    // - Custom logging endpoint
    // - Log aggregation service
    console.error(`[PROD] ${entry.message}`, entry.context);
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
      error,
      ...(additionalContext && typeof additionalContext === 'object' ? additionalContext : {}),
    });
  }

  // Utility method for configuration warnings
  configWarn(key: string, message: string, context?: LogContext): void {
    this.warn(`Configuration warning for ${key}: ${message}`, {
      configKey: key,
      ...(context && typeof context === 'object' ? context : {}),
    });
  }
}

// Create and export a singleton instance
export const logger = new Logger();

// Export the class for testing
export { Logger };
