import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for handling API requests with retry logic and loading states
 * @param {function} apiFunction - The API function to call
 * @param {array} dependencies - Dependencies array for useEffect
 * @param {object} options - Configuration options
 * @returns {object} State object with data, loading, error, and retry function
 */
export const useApiRequest = (apiFunction, dependencies = [], options = {}) => {
  const {
    retryAttempts = 3,
    retryDelay = 1000,
    initialData = null,
    onSuccess = null,
    onError = null
  } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

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
      setError(err.message || 'An error occurred while fetching data');
      
      if (onError) {
        onError(err);
      }

      // Retry logic
      if (retryCount < retryAttempts) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, retryDelay * Math.pow(2, retryCount)); // Exponential backoff
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
    canRetry: retryCount < retryAttempts
  };
};
