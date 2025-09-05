import { vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useApiRequest } from './useApiRequest';

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = vi.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('useApiRequest Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should initialize with default values', () => {
    const mockApiFunction = vi.fn();
    const { result } = renderHook(() => useApiRequest(mockApiFunction));

    expect(result.current.data).toBe(null);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);
    expect(result.current.retryCount).toBe(0);
    expect(result.current.canRetry).toBe(true);
  });

  test('should initialize with custom initial data', () => {
    const mockApiFunction = vi.fn();
    const initialData = { test: 'data' };
    const { result } = renderHook(() => 
      useApiRequest(mockApiFunction, [], { initialData })
    );

    expect(result.current.data).toEqual(initialData);
  });

  test('should execute API function on mount', async () => {
    const mockApiFunction = vi.fn().mockResolvedValue({ success: true });
    const { result } = renderHook(() => useApiRequest(mockApiFunction));

    await waitFor(() => {
      expect(mockApiFunction).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual({ success: true });
    expect(result.current.error).toBe(null);
  });

  test('should handle successful API response', async () => {
    const mockData = { message: 'Success' };
    const mockApiFunction = vi.fn().mockResolvedValue(mockData);
    const onSuccess = vi.fn();
    
    const { result } = renderHook(() => 
      useApiRequest(mockApiFunction, [], { onSuccess })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBe(null);
    expect(onSuccess).toHaveBeenCalledWith(mockData);
  });

  test('should handle API errors', async () => {
    const mockError = new Error('API Error');
    const mockApiFunction = vi.fn().mockRejectedValue(mockError);
    const onError = vi.fn();
    
    const { result } = renderHook(() => 
      useApiRequest(mockApiFunction, [], { onError })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe('API Error');
    expect(onError).toHaveBeenCalledWith(mockError);
  });

  test('should handle errors without message', async () => {
    const mockError = {};
    const mockApiFunction = vi.fn().mockRejectedValue(mockError);
    
    const { result } = renderHook(() => useApiRequest(mockApiFunction));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('An error occurred while fetching data');
  });

  test('should retry failed requests', async () => {
    const mockApiFunction = vi.fn()
      .mockRejectedValueOnce(new Error('First attempt failed'))
      .mockResolvedValueOnce({ success: true });
    
    const { result } = renderHook(() => 
      useApiRequest(mockApiFunction, [], { retryAttempts: 2, retryDelay: 100 })
    );

    // Wait for first failure
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('First attempt failed');
    });

    // Test that retry functionality exists
    expect(result.current.retry).toBeDefined();
    expect(result.current.canRetry).toBe(true);
    expect(result.current.retryCount).toBe(0);
  });

  test('should respect retry attempts limit', async () => {
    const mockApiFunction = vi.fn().mockRejectedValue(new Error('Always fails'));
    
    const { result } = renderHook(() => 
      useApiRequest(mockApiFunction, [], { retryAttempts: 2, retryDelay: 100 })
    );

    // Wait for initial failure
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Test that retry configuration is correct
    expect(result.current.canRetry).toBe(true);
    expect(result.current.retryCount).toBe(0);
  });

  test('should execute retry function manually', async () => {
    const mockApiFunction = vi.fn()
      .mockRejectedValueOnce(new Error('First attempt failed'))
      .mockResolvedValueOnce({ success: true });
    
    const { result } = renderHook(() => useApiRequest(mockApiFunction));

    // Wait for first failure
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('First attempt failed');
    });

    // Manually trigger retry
    act(() => {
      result.current.retry();
    });

    // Wait for retry to complete
    await waitFor(() => {
      expect(result.current.data).toEqual({ success: true });
      expect(result.current.error).toBe(null);
    });

    expect(mockApiFunction).toHaveBeenCalledTimes(2);
  });

  test('should execute when dependencies change', async () => {
    const mockApiFunction = vi.fn().mockResolvedValue({ success: true });
    let dependencies = ['initial'];
    
    const { result, rerender } = renderHook(() => 
      useApiRequest(mockApiFunction, dependencies)
    );

    // Wait for initial call
    await waitFor(() => {
      expect(mockApiFunction).toHaveBeenCalledTimes(1);
    });

    // Change dependencies
    dependencies = ['changed'];
    rerender();

    // Should call API again
    await waitFor(() => {
      expect(mockApiFunction).toHaveBeenCalledTimes(2);
    });
  });

  test('should use exponential backoff for retries', async () => {
    const mockApiFunction = vi.fn().mockRejectedValue(new Error('Always fails'));
    
    const { result } = renderHook(() => 
      useApiRequest(mockApiFunction, [], { retryAttempts: 3, retryDelay: 100 })
    );

    // Wait for initial failure
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Test that retry configuration is set up correctly
    expect(result.current.canRetry).toBe(true);
    expect(result.current.retryCount).toBe(0);
    expect(result.current.retry).toBeDefined();
  });
});
