import React from 'react';
import { useParams } from 'react-router-dom';

import SEO from '../ui/SEO';
import { logger } from '../../utils/logger';

const RecipeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  React.useEffect(() => {
    logger.info('RecipeDetail page loaded', {
      recipeId: id,
      timestamp: new Date().toISOString(),
    });
  }, [id]);

  return (
    <div className='recipe-page'>
      <SEO
        title={`Recipe ${id || ''} - Chomptron | Tron Swan`}
        description='AI-powered recipe app with Gemini. Explore recipes powered by Google Gemini AI.'
        keywords='chomptron, recipes, AI, Gemini, Google Cloud Platform, cooking'
        url={`/recipes/${id || ''}`}
      />

      <div className='recipe-detail-container' data-testid='recipe-detail'>
        <div className='recipe-detail-content'>
          <h1>Recipe {id}</h1>
          <p>
            Visit{' '}
            <a
              href={`https://chomptron.com/recipes/${id || ''}`}
              target='_blank'
              rel='noopener noreferrer'
              className='recipe-external-link'
            >
              chomptron.com
            </a>{' '}
            to view this recipe.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;
