import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { LogLevel } from '../types/logging';

import { Logger, logger } from './logger';

// Performance API types for TypeScript
declare global {
  interface Performance {
    now(): number;
  }
}

// Mock console methods
const mockConsole = {
  log: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
};

// Mock performance API
const mockPerformance = {
  now: vi.fn(() => Date.now()),
};

describe('Logger', () => {
  let testLogger: Logger;
  let originalConsole: typeof console;
  let originalPerformance: typeof globalThis.performance;

  beforeEach(() => {
    // Store original implementations
    originalConsole = { ...console };
    originalPerformance = globalThis.performance;

    // Mock console
    Object.assign(console, mockConsole);
    Object.defineProperty(global, 'performance', {
      value: mockPerformance,
      writable: true,
    });

    // Clear all mocks
    vi.clearAllMocks();

    // Create test logger with debug level
    testLogger = new Logger({
      level: LogLevel.DEBUG,
      enableConsole: true,
      enableProductionLogging: false,
      serviceName: 'test-logger',
      maxContextDepth: 3,
      enableStackTrace: true,
      enablePerformanceLogging: true,
    });
  });

  afterEach(() => {
    // Restore original implementations
    Object.assign(console, originalConsole);
    Object.defineProperty(global, 'performance', {
      value: originalPerformance,
      writable: true,
    });
  });

  describe('Basic logging', () => {
    it('should log debug messages', () => {
      testLogger.debug('Test debug message');
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG]'),
        'Test debug message',
        ''
      );
    });

    it('should log info messages', () => {
      testLogger.info('Test info message');
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('[INFO]'),
        'Test info message',
        ''
      );
    });

    it('should log warn messages', () => {
      testLogger.warn('Test warn message');
      expect(mockConsole.warn).toHaveBeenCalledWith(
        expect.stringContaining('[WARN]'),
        'Test warn message',
        ''
      );
    });

    it('should log error messages', () => {
      testLogger.error('Test error message');
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR]'),
        'Test error message',
        ''
      );
    });

    it('should not log messages below configured level', () => {
      const errorOnlyLogger = new Logger({
        level: LogLevel.ERROR,
        enableConsole: true,
        enableProductionLogging: false,
      });

      errorOnlyLogger.debug('Debug message');
      errorOnlyLogger.info('Info message');
      errorOnlyLogger.warn('Warn message');

      expect(mockConsole.log).not.toHaveBeenCalled();
      expect(mockConsole.info).not.toHaveBeenCalled();
      expect(mockConsole.warn).not.toHaveBeenCalled();
    });
  });

  describe('Context handling', () => {
    it('should handle object context', () => {
      const context = { userId: 123, action: 'login' };
      testLogger.info('User action', context);

      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('[INFO]'),
        'User action',
        context
      );
    });

    it('should handle Error context', () => {
      const error = new Error('Test error');
      testLogger.error('Error occurred', error);

      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR]'),
        'Error occurred',
        {
          name: 'Error',
          message: 'Test error',
          stack: expect.any(String),
        }
      );
    });

    it('should handle primitive context', () => {
      testLogger.info('Simple message', 'simple context');
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('[INFO]'),
        'Simple message',
        { value: 'simple context' }
      );
    });

    it('should limit context depth', () => {
      const deepContext = {
        level1: {
          level2: {
            level3: {
              level4: {
                level5: 'deep value',
              },
            },
          },
        },
      };

      testLogger.info('Deep context test', deepContext);

      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('[INFO]'),
        'Deep context test',
        expect.objectContaining({
          level1: expect.objectContaining({
            level2: expect.objectContaining({
              level3: expect.objectContaining({
                '[truncated]': 'Maximum context depth reached',
              }),
            }),
          }),
        })
      );
    });
  });

  describe('API error logging', () => {
    it('should log API errors with structured context', () => {
      const error = new Error('API request failed');
      testLogger.apiError('UserService', 'getUser', error, { userId: 123 });

      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR]'),
        'API error in UserService during getUser',
        expect.objectContaining({
          service: 'UserService',
          operation: 'getUser',
          error: expect.objectContaining({
            name: 'Error',
            message: 'API request failed',
            stack: expect.any(String),
          }),
          userId: 123,
        })
      );
    });
  });

  describe('Configuration warnings', () => {
    it('should log configuration warnings', () => {
      testLogger.configWarn('API_KEY', 'Missing required configuration');

      expect(mockConsole.warn).toHaveBeenCalledWith(
        expect.stringContaining('[WARN]'),
        'Configuration warning for API_KEY: Missing required configuration',
        expect.objectContaining({
          configKey: 'API_KEY',
        })
      );
    });
  });

  describe('Performance logging', () => {
    beforeEach(() => {
      mockPerformance.now
        .mockReturnValueOnce(1000) // startTimer
        .mockReturnValueOnce(1500); // endTimer
    });

    it('should start and end timers', () => {
      testLogger.startTimer('test-operation');
      testLogger.endTimer('test-operation');

      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG]'),
        'Timer started: test-operation',
        { timerLabel: 'test-operation' }
      );

      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('[INFO]'),
        'Timer completed: test-operation',
        expect.objectContaining({
          timerLabel: 'test-operation',
          duration: '500.00ms',
        })
      );
    });

    it('should measure async functions', async () => {
      const asyncFn = vi.fn().mockResolvedValue('result');

      const result = await testLogger.measureAsync('async-test', asyncFn);

      expect(result).toBe('result');
      expect(asyncFn).toHaveBeenCalled();
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('[INFO]'),
        'Timer completed: async-test',
        expect.objectContaining({
          success: true,
        })
      );
    });

    it('should measure sync functions', () => {
      const syncFn = vi.fn().mockReturnValue('result');

      const result = testLogger.measureSync('sync-test', syncFn);

      expect(result).toBe('result');
      expect(syncFn).toHaveBeenCalled();
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('[INFO]'),
        'Timer completed: sync-test',
        expect.objectContaining({
          success: true,
        })
      );
    });

    it('should handle errors in measured functions', async () => {
      const errorFn = vi.fn().mockRejectedValue(new Error('Test error'));

      await expect(
        testLogger.measureAsync('error-test', errorFn)
      ).rejects.toThrow('Test error');

      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('[INFO]'),
        'Timer completed: error-test',
        expect.objectContaining({
          success: false,
          error: 'Test error',
        })
      );
    });
  });

  describe('Production logging', () => {
    it('should use production format when enabled', () => {
      // Mock NODE_ENV to be production
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const prodLogger = new Logger({
        level: LogLevel.ERROR,
        enableConsole: false,
        enableProductionLogging: true,
        serviceName: 'prod-test',
      });

      prodLogger.error('Production error', { userId: 123 });

      expect(mockConsole.error).toHaveBeenCalledWith(
        '[PROD] Production error',
        expect.objectContaining({
          timestamp: expect.any(String),
          level: 'ERROR',
          message: 'Production error',
          source: 'prod-test',
          context: { userId: 123 },
        })
      );

      // Restore original NODE_ENV
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Singleton logger', () => {
    it('should export a singleton instance', () => {
      expect(logger).toBeInstanceOf(Logger);
    });

    it('should be the same instance across imports', async () => {
      // Import the logger again to test singleton behavior
      const { logger: logger2 } = await import('./logger');
      expect(logger).toBe(logger2);
    });
  });

  describe('Environment detection', () => {
    it('should detect development environment', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const devLogger = new Logger();
      devLogger.debug('Test message');

      expect(mockConsole.log).toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });

    it('should detect test environment', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'test';

      const testLogger = new Logger();
      testLogger.debug('Test message');

      // In test environment, console logging should be disabled by default
      expect(mockConsole.log).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });
  });
});
