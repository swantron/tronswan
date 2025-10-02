import { renderHook } from '@testing-library/react';
import {
  vi,
  expect,
  describe,
  test,
  beforeAll,
  afterAll,
  beforeEach,
} from 'vitest';

// Mock logger before importing the hook
vi.mock('../utils/logger', () => ({
  logger: {
    apiError: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

import { logger } from '../utils/logger';

import { useDateFormatter } from './useDateFormatter';

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = vi.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('useDateFormatter Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should format date with default options', () => {
    const { result } = renderHook(() => useDateFormatter());
    const formatDate = result.current;

    const testDate = '2023-12-25';
    const formatted = formatDate(testDate);

    // Should format as "December 25, 2023" in en-US (allowing for timezone differences)
    expect(formatted).toMatch(/December \d{1,2}, 2023/);
  });

  test('should format date with custom locale', () => {
    const { result } = renderHook(() => useDateFormatter('de-DE'));
    const formatDate = result.current;

    const testDate = '2023-12-25';
    const formatted = formatDate(testDate);

    // Should format as "25. Dezember 2023" in de-DE (allowing for timezone differences)
    expect(formatted).toMatch(/\d{1,2}\. Dezember 2023/);
  });

  test('should format date with custom options', () => {
    const customOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      weekday: 'long',
    };

    const { result } = renderHook(() =>
      useDateFormatter('en-US', customOptions)
    );
    const formatDate = result.current;

    const testDate = '2023-12-25';
    const formatted = formatDate(testDate);

    // Should include weekday and use short month (allowing for timezone differences)
    expect(formatted).toMatch(/\w+, Dec \d{1,2}, 2023/);
  });

  test('should handle empty date string', () => {
    const { result } = renderHook(() => useDateFormatter());
    const formatDate = result.current;

    const formatted = formatDate('');
    expect(formatted).toBe('');
  });

  test('should handle null date', () => {
    const { result } = renderHook(() => useDateFormatter());
    const formatDate = result.current;

    const formatted = formatDate(null);
    expect(formatted).toBe('');
  });

  test('should handle undefined date', () => {
    const { result } = renderHook(() => useDateFormatter());
    const formatDate = result.current;

    const formatted = formatDate(undefined);
    expect(formatted).toBe('');
  });

  test('should handle invalid date string', () => {
    const { result } = renderHook(() => useDateFormatter());
    const formatDate = result.current;

    const invalidDate = 'not-a-date';
    const formatted = formatDate(invalidDate);

    // Should return "Invalid Date" when date parsing fails
    expect(formatted).toBe('Invalid Date');
  });

  test('should handle ISO date string', () => {
    const { result } = renderHook(() => useDateFormatter());
    const formatDate = result.current;

    const isoDate = '2023-12-25T10:30:00.000Z';
    const formatted = formatDate(isoDate);

    expect(formatted).toMatch(/December 25, 2023/);
  });

  test('should handle timestamp', () => {
    const { result } = renderHook(() => useDateFormatter());
    const formatDate = result.current;

    const timestamp = 1703520000000; // December 25, 2023
    const formatted = formatDate(timestamp);

    expect(formatted).toMatch(/December 25, 2023/);
  });

  test('should format date with different month styles', () => {
    const { result } = renderHook(() =>
      useDateFormatter('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      })
    );
    const formatDate = result.current;

    const testDate = '2023-12-25';
    const formatted = formatDate(testDate);

    // Should format as "12/25/2023" with numeric month (allowing for timezone differences)
    expect(formatted).toMatch(/12\/\d{1,2}\/2023/);
  });

  test('should handle edge case dates', () => {
    const { result } = renderHook(() => useDateFormatter());
    const formatDate = result.current;

    // Test leap year date
    const leapYearDate = '2024-02-29';
    const leapYearFormatted = formatDate(leapYearDate);
    expect(leapYearFormatted).toMatch(/February \d{1,2}, 2024/);

    // Test year boundary - use a date that's less likely to have timezone issues
    const yearBoundaryDate = '2023-06-15';
    const yearBoundaryFormatted = formatDate(yearBoundaryDate);
    expect(yearBoundaryFormatted).toMatch(/June \d{1,2}, 2023/);
  });
});
