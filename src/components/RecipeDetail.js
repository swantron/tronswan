import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { wordpressService } from '../services/wordpressService';
import '../styles/RecipeDetail.css';

const RecipeDetail = () => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        const data = await wordpressService.getRecipeById(id);
        setRecipe(data);
        setError(null);
      } catch (err) {
        setError('Failed to load recipe. Please try again later.');
        console.error('Error fetching recipe:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="recipe-detail-loading" data-testid="recipe-detail-loading">
        <div className="loading-spinner" aria-label="Loading recipe" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="recipe-detail-error" data-testid="recipe-detail-error">
        {error}
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="recipe-detail-not-found" data-testid="recipe-detail-not-found">
        Recipe not found.
      </div>
    );
  }

  return (
    <article className="recipe-detail" data-testid="recipe-detail">
      {recipe.featuredImage && (
        <div className="recipe-detail-image">
          <img 
            src={recipe.featuredImage} 
            alt={recipe.title}
            loading="lazy"
          />
        </div>
      )}
      
      <div className="recipe-detail-content">
        <header className="recipe-detail-header">
          <h1 className="recipe-detail-title">{recipe.title}</h1>
          <div className="recipe-detail-meta">
            <time className="recipe-detail-date">{formatDate(recipe.date)}</time>
            {recipe.categories.length > 0 && (
              <div className="recipe-detail-categories">
                {recipe.categories.map(category => (
                  <span key={category.id} className="recipe-detail-category">
                    {category.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </header>

        <div 
          className="recipe-detail-body"
          dangerouslySetInnerHTML={{ __html: recipe.content }}
        />

        {recipe.tags.length > 0 && (
          <footer className="recipe-detail-footer">
            <div className="recipe-detail-tags">
              {recipe.tags.map(tag => (
                <span key={tag.id} className="recipe-detail-tag">
                  #{tag.name}
                </span>
              ))}
            </div>
          </footer>
        )}
      </div>
    </article>
  );
};

export default RecipeDetail; 