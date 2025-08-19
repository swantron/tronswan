import { useMemo } from 'react';

/**
 * Custom hook for formatting dates consistently across the application
 * @param {string} locale - The locale to use for formatting (default: 'en-US')
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {function} A memoized date formatting function
 */
export const useDateFormatter = (locale = 'en-US', options = {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
}) => {
  const formatDate = useMemo(() => {
    return (dateString) => {
      if (!dateString) return '';
      
      try {
        return new Date(dateString).toLocaleDateString(locale, options);
      } catch (error) {
        console.error('Error formatting date:', error);
        return dateString;
      }
    };
  }, [locale, options]);

  return formatDate;
};
