import { useMemo } from 'react';

import { logger } from '../utils/logger';

interface DateFormatterOptions {
  year?: 'numeric' | '2-digit';
  month?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';
  day?: 'numeric' | '2-digit';
  hour?: 'numeric' | '2-digit';
  minute?: 'numeric' | '2-digit';
  second?: 'numeric' | '2-digit';
  timeZoneName?: 'short' | 'long';
}

type DateFormatter = (dateString: string) => string;

/**
 * Custom hook for formatting dates consistently across the application
 * @param locale - The locale to use for formatting (default: 'en-US')
 * @param options - Intl.DateTimeFormat options
 * @returns A memoized date formatting function
 */
export const useDateFormatter = (
  locale: string = 'en-US',
  options: DateFormatterOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
): DateFormatter => {
  const formatDate = useMemo(() => {
    return (dateString: string): string => {
      if (!dateString) return '';

      try {
        return new Date(dateString).toLocaleDateString(locale, options);
      } catch (error) {
        logger.error('Error formatting date', {
          error,
          dateString,
          locale,
          options,
        });
        return dateString;
      }
    };
  }, [locale, options]);

  return formatDate;
};
