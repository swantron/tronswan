import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RecipeDetail from './RecipeDetail';

// Mock the wordpressService
jest.mock('../services/wordpressService', () => ({
  wordpressService: {
    getRecipeById: jest.fn()
  }
}));

// Mock the CSS import
jest.mock('../styles/RecipeDetail.css', () => ({}));

const { wordpressService } = require('../services/wordpressService');

// Wrapper component to provide router context
const renderWithRouter = (component, { route = '/recipe/1' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  
  return render(
    <BrowserRouter>
      <Routes>
        <Route path="/recipe/:id" element={component} />
      </Routes>
    </BrowserRouter>
  );
};

describe('RecipeDetail Component', () => {
  const mockRecipe = {
    id: 1,
    title: 'Test Recipe',
    excerpt: 'Test recipe excerpt',
    content: '<p>This is the recipe content with <strong>HTML</strong>.</p>',
    date: '2023-12-25T10:00:00Z',
    featuredImage: 'https://example.com/recipe.jpg',
    categories: [
      { id: 1, name: 'Breakfast' },
      { id: 2, name: 'Quick' }
    ],
    tags: [
      { id: 1, name: 'Healthy' },
      { id: 2, name: 'Easy' }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console.error to avoid noise in tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    if (console.error.mockRestore) {
      console.error.mockRestore();
    }
  });

  test('renders loading state initially', () => {
    wordpressService.getRecipeById.mockImplementation(() => new Promise(() => {}));
    
    renderWithRouter(<RecipeDetail />);
    
    expect(screen.getByTestId('recipe-detail-loading')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading recipe')).toBeInTheDocument();
  });

  test('renders recipe details when data is loaded successfully', async () => {
    wordpressService.getRecipeById.mockResolvedValue(mockRecipe);
    
    renderWithRouter(<RecipeDetail />);
    
    await waitFor(() => {
      expect(screen.getByTestId('recipe-detail')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Test Recipe')).toBeInTheDocument();
    expect(screen.getByText('December 25, 2023')).toBeInTheDocument();
    expect(screen.getByText('Breakfast')).toBeInTheDocument();
    expect(screen.getByText('Quick')).toBeInTheDocument();
    expect(screen.getByText(/This is the recipe content with/)).toBeInTheDocument();
    expect(screen.getByText('#Healthy')).toBeInTheDocument();
    expect(screen.getByText('#Easy')).toBeInTheDocument();
  });

  test('renders recipe image when featuredImage is available', async () => {
    wordpressService.getRecipeById.mockResolvedValue(mockRecipe);
    
    renderWithRouter(<RecipeDetail />);
    
    await waitFor(() => {
      expect(screen.getByTestId('recipe-detail')).toBeInTheDocument();
    });
    
    const image = screen.getByAltText('Test Recipe');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/recipe.jpg');
    expect(image).toHaveAttribute('loading', 'lazy');
  });

  test('does not render image when featuredImage is not available', async () => {
    const recipeWithoutImage = { ...mockRecipe, featuredImage: null };
    wordpressService.getRecipeById.mockResolvedValue(recipeWithoutImage);
    
    renderWithRouter(<RecipeDetail />);
    
    await waitFor(() => {
      expect(screen.getByTestId('recipe-detail')).toBeInTheDocument();
    });
    
    expect(screen.queryByAltText('Test Recipe')).not.toBeInTheDocument();
  });

  test('renders recipe without categories when none are available', async () => {
    const recipeWithoutCategories = { ...mockRecipe, categories: [] };
    wordpressService.getRecipeById.mockResolvedValue(recipeWithoutCategories);
    
    renderWithRouter(<RecipeDetail />);
    
    await waitFor(() => {
      expect(screen.getByTestId('recipe-detail')).toBeInTheDocument();
    });
    
    expect(screen.queryByText('Breakfast')).not.toBeInTheDocument();
    expect(screen.queryByText('Quick')).not.toBeInTheDocument();
  });

  test('renders recipe without tags when none are available', async () => {
    const recipeWithoutTags = { ...mockRecipe, tags: [] };
    wordpressService.getRecipeById.mockResolvedValue(recipeWithoutTags);
    
    renderWithRouter(<RecipeDetail />);
    
    await waitFor(() => {
      expect(screen.getByTestId('recipe-detail')).toBeInTheDocument();
    });
    
    expect(screen.queryByText('#Healthy')).not.toBeInTheDocument();
    expect(screen.queryByText('#Easy')).not.toBeInTheDocument();
  });

  test('renders error state when API call fails', async () => {
    wordpressService.getRecipeById.mockRejectedValue(new Error('API Error'));
    
    renderWithRouter(<RecipeDetail />);
    
    await waitFor(() => {
      expect(screen.getByTestId('recipe-detail-error')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Failed to load recipe. Please try again later.')).toBeInTheDocument();
  });

  test('renders not found state when recipe is null', async () => {
    wordpressService.getRecipeById.mockResolvedValue(null);
    
    renderWithRouter(<RecipeDetail />);
    
    await waitFor(() => {
      expect(screen.getByTestId('recipe-detail-not-found')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Recipe not found.')).toBeInTheDocument();
  });

  test('calls wordpressService with correct ID from URL params', async () => {
    wordpressService.getRecipeById.mockResolvedValue(mockRecipe);
    
    renderWithRouter(<RecipeDetail />, { route: '/recipe/123' });
    
    await waitFor(() => {
      expect(wordpressService.getRecipeById).toHaveBeenCalledWith(123);
    });
  });

  test('formats date correctly', async () => {
    const recipeWithDifferentDate = { ...mockRecipe, date: '2023-06-15T14:30:00Z' };
    wordpressService.getRecipeById.mockResolvedValue(recipeWithDifferentDate);
    
    renderWithRouter(<RecipeDetail />);
    
    await waitFor(() => {
      expect(screen.getByTestId('recipe-detail')).toBeInTheDocument();
    });
    
    expect(screen.getByText('June 15, 2023')).toBeInTheDocument();
  });

  test('handles HTML content in recipe body correctly', async () => {
    const recipeWithComplexHTML = {
      ...mockRecipe,
      content: '<h2>Ingredients</h2><ul><li>Item 1</li><li>Item 2</li></ul>'
    };
    wordpressService.getRecipeById.mockResolvedValue(recipeWithComplexHTML);
    
    renderWithRouter(<RecipeDetail />);
    
    await waitFor(() => {
      expect(screen.getByTestId('recipe-detail')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Ingredients')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  test('handles recipe with only required fields', async () => {
    const minimalRecipe = {
      id: 2,
      title: 'Minimal Recipe',
      excerpt: 'Minimal excerpt',
      content: 'Minimal content',
      date: '2023-12-26T10:00:00Z',
      featuredImage: null,
      categories: [],
      tags: []
    };
    wordpressService.getRecipeById.mockResolvedValue(minimalRecipe);
    
    renderWithRouter(<RecipeDetail />, { route: '/recipe/2' });
    
    await waitFor(() => {
      expect(screen.getByTestId('recipe-detail')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Minimal Recipe')).toBeInTheDocument();
    expect(screen.getByText('Minimal content')).toBeInTheDocument();
    expect(screen.getByText('December 26, 2023')).toBeInTheDocument();
    expect(screen.queryByAltText('Minimal Recipe')).not.toBeInTheDocument();
  });

  test('logs error to console when API call fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const apiError = new Error('Network error');
    wordpressService.getRecipeById.mockRejectedValue(apiError);
    
    renderWithRouter(<RecipeDetail />);
    
    await waitFor(() => {
      expect(screen.getByTestId('recipe-detail-error')).toBeInTheDocument();
    });
    
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching recipe:', apiError);
    consoleErrorSpy.mockRestore();
  });
});
