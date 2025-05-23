import React, { useState, useEffect } from 'react';
import RecipeCard from './RecipeCard';
import { wordpressService } from '../services/wordpressService';
import '../styles/RecipeList.css';

const RecipeList = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        const data = searchQuery
          ? await wordpressService.searchRecipes(searchQuery, page)
          : await wordpressService.getRecipes(page);
        
        setRecipes(data.recipes);
        setTotalPages(data.totalPages);
        setError(null);
      } catch (err) {
        setError('Failed to load recipes. Please try again later.');
        console.error('Error fetching recipes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [page, searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page when searching
  };

  return (
    <div className="recipe-list-container" data-testid="recipe-list">
      <div className="recipe-list-header">
        <h2>Recipes</h2>
        <form onSubmit={handleSearch} className="recipe-search-form">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search recipes..."
            className="recipe-search-input"
          />
          <button type="submit" className="recipe-search-button">
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <div className="loading-spinner" aria-label="Loading recipes" />
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : recipes.length === 0 ? (
        <div className="no-recipes-message">
          No recipes found. Try a different search term.
        </div>
      ) : (
        <>
          <div className="recipe-grid">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="pagination-button"
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className="pagination-button"
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