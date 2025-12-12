import React from 'react';

import { logger } from '../../utils/logger';
import SEO from '../ui/SEO';
import '../../styles/Recipe.css';

const RecipeList: React.FC = () => {
  React.useEffect(() => {
    logger.info('RecipeList page loaded', {
      timestamp: new Date().toISOString(),
    });
  }, []);

  return (
    <div className='recipe-page'>
      <SEO
        title='Chomptron - AI Recipe App | Tron Swan'
        description='AI-powered recipe app with Gemini. Explore recipes powered by Google Gemini AI.'
        keywords='chomptron, recipes, AI, Gemini, Google Cloud Platform, cooking'
        url='/recipes'
      />

      <div className='recipe-list-container' data-testid='recipe-list'>
        <div className='recipe-list-header'>
          <h1>chomptron</h1>
          <p>
            Visit{' '}
            <a
              href='https://chomptron.com'
              target='_blank'
              rel='noopener noreferrer'
              className='recipe-external-link'
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

export default RecipeList;
