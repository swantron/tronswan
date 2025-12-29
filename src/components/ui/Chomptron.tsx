import React from 'react';

import { logger } from '../../utils/logger';

import SEO from './SEO';
import '../../styles/Chomptron.css';

const Chomptron: React.FC = () => {
  React.useEffect(() => {
    logger.info('Chomptron page loaded', {
      timestamp: new Date().toISOString(),
    });
  }, []);

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
