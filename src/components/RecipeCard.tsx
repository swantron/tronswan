import React from 'react';
import { Link } from 'react-router-dom';
import { useDateFormatter } from '../hooks/useDateFormatter';
import { RecipeCardProps } from '../types';
import '../styles/RecipeCard.css';

const RecipeCard: React.FC<RecipeCardProps> = React.memo(({ recipe }) => {
  const formatDate = useDateFormatter();

  return (
    <div className="recipe-card" data-testid="recipe-card">
      <Link to={`/recipes/${recipe.id}`} className="recipe-card-link">
        {recipe.featuredImage && (
          <div className="recipe-card-image">
            <img 
              src={recipe.featuredImage} 
              alt={recipe.title}
              loading="lazy"
            />
          </div>
        )}
        <div className="recipe-card-content">
          <h3 className="recipe-card-title">{recipe.title}</h3>
          <div 
            className="recipe-card-excerpt" 
            dangerouslySetInnerHTML={{ __html: recipe.excerpt }}
          />
          <div className="recipe-card-meta">
            <span className="recipe-card-date">{formatDate(recipe.date)}</span>
            {recipe.categories.length > 0 && (
              <div className="recipe-card-categories">
                {recipe.categories.map(category => (
                  <span key={category.id} className="recipe-card-category">
                    {category.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
});

RecipeCard.displayName = 'RecipeCard';

export default RecipeCard;
