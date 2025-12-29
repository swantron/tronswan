import React, { useState, useEffect } from 'react';

import { logger } from '../../utils/logger';

import SEO from './SEO';
import '../../styles/Chomptron.css';

const Chomptron: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<
    'unknown' | 'available' | 'quota-exceeded'
  >('unknown');
  const [retryAfter, setRetryAfter] = useState<number | null>(null);

  React.useEffect(() => {
    logger.info('Chomptron page loaded', {
      timestamp: new Date().toISOString(),
    });

    // Check for API quota errors in localStorage (set by chomptron.com if embedded)
    const checkApiStatus = () => {
      try {
        const quotaError = localStorage.getItem('chomptron_quota_error');
        const retryAfterStr = localStorage.getItem('chomptron_retry_after');

        if (quotaError === 'true') {
          setApiStatus('quota-exceeded');
          if (retryAfterStr) {
            const retrySeconds = parseInt(retryAfterStr, 10);
            setRetryAfter(retrySeconds);

            // Update retry countdown
            const interval = setInterval(() => {
              setRetryAfter(prev => {
                if (prev === null || prev <= 1) {
                  clearInterval(interval);
                  return null;
                }
                return prev - 1;
              });
            }, 1000);

            return () => clearInterval(interval);
          }
        } else {
          setApiStatus('available');
        }
      } catch (err) {
        logger.warn('Error checking chomptron API status', { error: err });
      }
    };

    checkApiStatus();

    // Listen for storage events from chomptron.com iframe
    const handleStorageChange = (e: StorageEvent) => {
      if (
        e.key === 'chomptron_quota_error' ||
        e.key === 'chomptron_retry_after'
      ) {
        checkApiStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const formatRetryTime = (seconds: number | null): string => {
    if (seconds === null) return '';
    if (seconds < 60) return `${seconds} second${seconds !== 1 ? 's' : ''}`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (remainingSeconds === 0) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`;
  };

  return (
    <div className='chomptron-page'>
      <SEO
        title='Chomptron - AI Recipe App | Tron Swan'
        description='AI-powered recipe app with Gemini. Explore recipes powered by Google Gemini AI.'
        keywords='chomptron, recipes, AI, Gemini, Google Cloud Platform, cooking'
        url='/chomptron'
      />

      <div className='chomptron-container' data-testid='chomptron-container'>
        <div className='chomptron-header'>
          <h1>chomptron</h1>

          {apiStatus === 'quota-exceeded' && (
            <div
              className='chomptron-quota-warning'
              data-testid='quota-warning'
            >
              <p className='warning-title'>⚠️ API Quota Exceeded</p>
              <p className='warning-message'>
                The Gemini API free tier quota has been exceeded.
                {retryAfter !== null && retryAfter > 0 && (
                  <span> Please retry in {formatRetryTime(retryAfter)}.</span>
                )}
              </p>
              <p className='warning-info'>
                For more information, visit{' '}
                <a
                  href='https://ai.google.dev/gemini-api/docs/rate-limits'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='chomptron-external-link'
                >
                  Gemini API rate limits
                </a>{' '}
                or{' '}
                <a
                  href='https://ai.dev/usage?tab=rate-limit'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='chomptron-external-link'
                >
                  check your usage
                </a>
                .
              </p>
            </div>
          )}

          <p>
            Visit{' '}
            <a
              href='https://chomptron.com'
              target='_blank'
              rel='noopener noreferrer'
              className='chomptron-external-link'
            >
              chomptron.com
            </a>{' '}
            for the full AI-powered recipe experience.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chomptron;
