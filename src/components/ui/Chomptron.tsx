import React, { useState } from 'react';

import { logger } from '../../utils/logger';

import SEO from './SEO';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import '../../styles/Chomptron.css';

const Chomptron: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<
    'unknown' | 'available' | 'quota-exceeded'
  >('unknown');
  const [retryAfter, setRetryAfter] = useState<number | null>(null);
  const [ingredients, setIngredients] = useState<string>('');

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleStorageChange = (e: any) => {
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

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (ingredients.trim()) {
      // Redirect to chomptron.com with ingredients as URL parameter
      const encodedIngredients = encodeURIComponent(ingredients.trim());
      window.open(
        `https://chomptron.com?ingredients=${encodedIngredients}`,
        '_blank'
      );
      logger.info('Quick recipe generator used', {
        ingredients: ingredients.trim(),
      });
    }
  };

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
        <Card className='chomptron-card'>
          <div className='chomptron-header'>
            <h1 className='page-title'>chomptron</h1>

            <p className='chomptron-description'>
              AI-powered recipe generator using Google Gemini. Enter ingredients
              and get instant recipes.
            </p>

            <form onSubmit={handleGenerate} className='chomptron-widget'>
              <div className='widget-input-group'>
                <input
                  type='text'
                  value={ingredients}
                  onChange={e => setIngredients(e.target.value)}
                  placeholder='e.g., chicken, tomatoes, garlic, pasta'
                  className='widget-input'
                  data-testid='ingredient-input'
                />
                <Button
                  type='submit'
                  className='widget-button'
                  disabled={!ingredients.trim()}
                  data-testid='generate-button'
                >
                  Generate Recipe ✨
                </Button>
              </div>
              <p className='widget-hint'>
                Opens chomptron.com with your ingredients pre-filled
              </p>
            </form>

            {apiStatus === 'quota-exceeded' && (
              <div
                className='chomptron-quota-warning'
                data-testid='quota-warning'
              >
                <p className='warning-title'>API Quota Exceeded</p>
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
              for the full experience with recipe history, favorites, and more.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Chomptron;
