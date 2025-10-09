import React, { useState, useEffect } from 'react';

import { wordpressService } from '../../services/wordpressService';
import { Recipe } from '../../types';
import { logger } from '../../utils/logger';

import RecipeCard from './RecipeCard';
import '../../styles/RecipeList.css';

const RecipeList: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const fetchRecipes = async (): Promise<void> => {
      try {
        setLoading(true);

        logger.info('RecipeList fetching data', {
          page,
          searchQuery,
          isSearch: !!searchQuery,
          timestamp: new Date().toISOString(),
        });

        const data = searchQuery
          ? await wordpressService.searchRecipes(searchQuery, page)
          : await wordpressService.getRecipes(page);

        setRecipes(data.recipes);
        setTotalPages(data.totalPages);
        setError(null);

        logger.info('RecipeList data loaded successfully', {
          recipeCount: data.recipes.length,
          totalPages: data.totalPages,
          page,
          searchQuery,
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        setError('Failed to load recipes. Please try again later.');
        logger.error('Error fetching recipes', { error: err });
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [page, searchQuery]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    logger.info('Recipe search submitted', {
      searchQuery,
      currentPage: page,
      timestamp: new Date().toISOString(),
    });

    setPage(1); // Reset to first page when searching
  };

  return (
    <div className='recipe-list-container' data-testid='recipe-list'>
      <div className='recipe-list-header'>
        <h1>chomptron</h1>
        <form onSubmit={handleSearch} className='recipe-search-form'>
          <input
            type='text'
            value={searchQuery}
            onChange={e => {
              const value = e.target.value;
              logger.debug('Recipe search input changed', {
                searchQuery: value,
                queryLength: value.length,
                timestamp: new Date().toISOString(),
              });
              setSearchQuery(value);
            }}
            placeholder='Search recipes...'
            className='recipe-search-input'
          />
          <button type='submit' className='recipe-search-button'>
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <div className='loading-spinner' aria-label='Loading recipes' />
      ) : error ? (
        <div className='error-message'>{error}</div>
      ) : recipes.length === 0 ? (
        <div className='no-recipes-message'>
          No recipes found. Try a different search term.
        </div>
      ) : (
        <>
          <div className='recipe-grid'>
            {recipes.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className='pagination'>
              <button
                onClick={() => {
                  const newPage = Math.max(page - 1, 1);
                  logger.info('Recipe pagination - Previous clicked', {
                    fromPage: page,
                    toPage: newPage,
                    searchQuery,
                    timestamp: new Date().toISOString(),
                  });
                  setPage(newPage);
                }}
                disabled={page === 1}
                className='pagination-button'
              >
                Previous
              </button>
              <span className='pagination-info'>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => {
                  const newPage = Math.min(page + 1, totalPages);
                  logger.info('Recipe pagination - Next clicked', {
                    fromPage: page,
                    toPage: newPage,
                    searchQuery,
                    timestamp: new Date().toISOString(),
                  });
                  setPage(newPage);
                }}
                disabled={page === totalPages}
                className='pagination-button'
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RecipeList;
