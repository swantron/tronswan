# Logging System Guide

This document provides a comprehensive guide to the structured logging system implemented in the tronswan application.

## Overview

The application uses a custom structured logging system that replaces all `console` statements with a more robust, production-ready logging solution. The system provides:

- **Environment-based configuration** (development, production, test)
- **Structured context logging** with depth limiting
- **Performance measurement** capabilities
- **Error tracking** with stack traces
- **Production-ready** formatting

## Quick Start

```typescript
import { logger } from '../utils/logger';

// Basic logging
logger.debug('Debug message');
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message');

// With context
logger.info('User action', { userId: 123, action: 'login' });

// API errors
logger.apiError('UserService', 'getUser', error, { userId: 123 });

// Performance measurement
await logger.measureAsync('api-call', async () => {
  return await fetchUserData();
});
```

## Configuration

The logger automatically configures itself based on the `NODE_ENV` environment variable:

### Development (`NODE_ENV=development`)
- **Log Level**: DEBUG (shows all messages)
- **Console Logging**: Enabled
- **Stack Traces**: Enabled
- **Performance Logging**: Enabled
- **Context Depth**: 5 levels
- **Retention**: 7 days

### Production (`NODE_ENV=production`)
- **Log Level**: ERROR (only errors and warnings)
- **Console Logging**: Disabled
- **Stack Traces**: Disabled
- **Performance Logging**: Disabled
- **Context Depth**: 3 levels
- **Retention**: 30 days

### Test (`NODE_ENV=test`)
- **Log Level**: ERROR
- **Console Logging**: Disabled
- **Stack Traces**: Disabled
- **Performance Logging**: Disabled
- **Context Depth**: 2 levels
- **Retention**: 1 day

## API Reference

### Basic Logging Methods

#### `logger.debug(message: string, context?: LogContext)`
Logs debug information. Only shown in development.

```typescript
logger.debug('Processing user data', { userId: 123, step: 'validation' });
```

#### `logger.info(message: string, context?: LogContext)`
Logs informational messages.

```typescript
logger.info('User logged in successfully', { userId: 123, timestamp: Date.now() });
```

#### `logger.warn(message: string, context?: LogContext)`
Logs warning messages.

```typescript
logger.warn('API rate limit approaching', { current: 90, limit: 100 });
```

#### `logger.error(message: string, context?: LogContext)`
Logs error messages.

```typescript
logger.error('Database connection failed', { error: dbError, retryCount: 3 });
```

### Specialized Methods

#### `logger.apiError(service: string, operation: string, error: Error, additionalContext?: LogContext)`
Logs API errors with structured context.

```typescript
try {
  await fetchUserData();
} catch (error) {
  logger.apiError('UserService', 'fetchUserData', error, { userId: 123 });
}
```

#### `logger.configWarn(key: string, message: string, context?: LogContext)`
Logs configuration warnings.

```typescript
logger.configWarn('API_KEY', 'Missing required configuration', { 
  environment: 'production' 
});
```

### Performance Measurement

#### `logger.startTimer(label: string)`
Starts a performance timer.

```typescript
logger.startTimer('database-query');
```

#### `logger.endTimer(label: string, context?: LogContext)`
Ends a performance timer and logs the duration.

```typescript
logger.endTimer('database-query', { queryType: 'SELECT', recordCount: 100 });
```

#### `logger.measureAsync<T>(label: string, fn: () => Promise<T>, context?: LogContext): Promise<T>`
Measures the execution time of an async function.

```typescript
const result = await logger.measureAsync('api-call', async () => {
  return await fetch('/api/users');
}, { endpoint: '/api/users' });
```

#### `logger.measureSync<T>(label: string, fn: () => T, context?: LogContext): T`
Measures the execution time of a synchronous function.

```typescript
const result = logger.measureSync('data-processing', () => {
  return processUserData(rawData);
}, { recordCount: rawData.length });
```

## Context Types

The `LogContext` type supports various data types:

```typescript
type LogContext = 
  | Record<string, any>  // Objects
  | Error               // Error instances
  | string              // Strings
  | number              // Numbers
  | boolean             // Booleans
  | null                // Null
  | undefined;          // Undefined
```

### Context Examples

```typescript
// Object context
logger.info('User action', { userId: 123, action: 'login', timestamp: Date.now() });

// Error context
logger.error('Operation failed', new Error('Database connection timeout'));

// Primitive context
logger.debug('Processing step', 'validation');

// Mixed context
logger.warn('Rate limit warning', { 
  current: 90, 
  limit: 100, 
  resetTime: '2023-12-01T00:00:00Z' 
});
```

## Best Practices

### 1. Use Appropriate Log Levels

```typescript
// ✅ Good
logger.debug('Processing user input', { input: userInput });
logger.info('User authentication successful', { userId: user.id });
logger.warn('API rate limit approaching', { current: 90, limit: 100 });
logger.error('Database connection failed', { error: dbError });

// ❌ Avoid
logger.error('User clicked button'); // This is not an error
logger.debug('Critical system failure'); // This should be error level
```

### 2. Provide Meaningful Context

```typescript
// ✅ Good
logger.error('Failed to save user profile', {
  userId: user.id,
  error: error.message,
  retryCount: 3,
  timestamp: Date.now()
});

// ❌ Avoid
logger.error('Save failed', error);
```

### 3. Use Performance Measurement for Critical Operations

```typescript
// ✅ Good
const userData = await logger.measureAsync('fetch-user-data', async () => {
  return await userService.getUser(userId);
}, { userId });

// ❌ Avoid
const userData = await userService.getUser(userId);
logger.info('User data fetched', { userId }); // No timing information
```

### 4. Handle Errors Properly

```typescript
// ✅ Good
try {
  await riskyOperation();
} catch (error) {
  logger.apiError('RiskyService', 'riskyOperation', error, { 
    context: 'user-profile-update' 
  });
  throw error; // Re-throw if needed
}

// ❌ Avoid
try {
  await riskyOperation();
} catch (error) {
  logger.error('Something went wrong', error);
  // Error is swallowed
}
```

### 5. Use Structured Context for API Errors

```typescript
// ✅ Good
logger.apiError('PaymentService', 'processPayment', error, {
  userId: user.id,
  amount: payment.amount,
  currency: payment.currency,
  paymentMethod: payment.method
});

// ❌ Avoid
logger.error('Payment failed', error);
```

## Environment-Specific Behavior

### Development
- All log levels are shown
- Stack traces are included for errors
- Performance measurements are logged
- Console output is enabled
- Context depth is limited to 5 levels

### Production
- Only ERROR and WARN levels are shown
- Stack traces are disabled for performance
- Performance measurements are disabled
- Console output is disabled (logs go to production logging)
- Context depth is limited to 3 levels

### Test
- Only ERROR level is shown
- All logging features are disabled
- Console output is disabled
- Context depth is limited to 2 levels

## Migration from Console

### Before (Console)
```typescript
console.log('User logged in:', user);
console.error('API error:', error);
console.warn('Rate limit:', { current: 90, limit: 100 });
```

### After (Logger)
```typescript
logger.info('User logged in', { userId: user.id, email: user.email });
logger.apiError('AuthService', 'login', error, { userId: user.id });
logger.warn('Rate limit approaching', { current: 90, limit: 100 });
```

## Testing

The logger includes comprehensive test coverage. To run the logger tests:

```bash
yarn test src/utils/logger.test.ts
```

The tests cover:
- Basic logging functionality
- Context handling and formatting
- Performance measurement
- Environment-specific behavior
- Error handling
- Configuration options

## Future Enhancements

The logging system is designed to be extensible. Future enhancements could include:

1. **External Logging Services**: Integration with Sentry, DataDog, CloudWatch
2. **Log Aggregation**: Centralized log collection and analysis
3. **Real-time Monitoring**: Live log streaming and alerting
4. **Log Analytics**: Advanced querying and visualization
5. **Custom Formatters**: Pluggable log formatting systems

## Troubleshooting

### Common Issues

1. **Logs not appearing in production**: Check that `NODE_ENV` is set to `production`
2. **Performance logging not working**: Ensure `enablePerformanceLogging` is true in config
3. **Context depth issues**: Adjust `maxContextDepth` in configuration
4. **Stack traces missing**: Check that `enableStackTrace` is true in development

### Debug Configuration

To debug logging configuration:

```typescript
import { logger } from '../utils/logger';

// Log current configuration
logger.debug('Logger configuration', {
  level: logger.config.level,
  enableConsole: logger.config.enableConsole,
  enableProductionLogging: logger.config.enableProductionLogging
});
```

## Contributing

When adding new logging functionality:

1. Follow the existing patterns
2. Add appropriate tests
3. Update this documentation
4. Consider performance implications
5. Ensure environment-specific behavior is correct
