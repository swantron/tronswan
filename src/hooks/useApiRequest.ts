import { useState, useEffect, useCallback } from 'react';

interface UseApiRequestOptions<T> {
  retryAttempts?: number;
  retryDelay?: number;
  initialData?: T | null;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface UseApiRequestReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
  retryCount: number;
  canRetry: boolean;
}

/**
 * Custom hook for handling API requests with retry logic and loading states
 * @param apiFunction - The API function to call
 * @param dependencies - Dependencies array for useEffect
 * @param options - Configuration options
 * @returns State object with data, loading, error, and retry function
 */
export const useApiRequest = <T>(
  apiFunction: () => Promise<T>,
  dependencies: any[] = [],
  options: UseApiRequestOptions<T> = {}
): UseApiRequestReturn<T> => {
  const {
    retryAttempts = 3,
    retryDelay = 1000,
    initialData = null,
    onSuccess = null,
    onError = null,
  } = options;

  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);

  const executeRequest = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await apiFunction();
      setData(result);
      setRetryCount(0);

      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      console.error('API request failed:', err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'An error occurred while fetching data';
      setError(errorMessage);

      if (onError) {
        onError(err instanceof Error ? err : new Error(errorMessage));
      }

      // Retry logic
      if (retryCount < retryAttempts) {
        setTimeout(
          () => {
            setRetryCount(prev => prev + 1);
          },
          retryDelay * Math.pow(2, retryCount)
        ); // Exponential backoff
      }
    } finally {
      setLoading(false);
    }
  }, [apiFunction, retryCount, retryAttempts, retryDelay, onSuccess, onError]);

  // Execute request when dependencies change
  useEffect(() => {
    executeRequest();
  }, [...dependencies, executeRequest]);

  // Retry when retryCount changes (but not on initial load)
  useEffect(() => {
    if (retryCount > 0) {
      executeRequest();
    }
  }, [retryCount, executeRequest]);

  const retry = useCallback(() => {
    setRetryCount(0);
    executeRequest();
  }, [executeRequest]);

  return {
    data,
    loading,
    error,
    retry,
    retryCount,
    canRetry: retryCount < retryAttempts,
  };
};
