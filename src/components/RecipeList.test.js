import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RecipeList from './RecipeList';

// Mock the wordpressService
jest.mock('../services/wordpressService', () => ({
  wordpressService: {
    getRecipes: jest.fn(),
    searchRecipes: jest.fn()
  }
}));

// Mock the RecipeCard component
jest.mock('./RecipeCard', () => {
  return function MockRecipeCard({ recipe }) {
    return (
      <div data-testid={`recipe-card-${recipe.id}`} className="recipe-card">
        <h3>{recipe.title}</h3>
        <p>{recipe.excerpt}</p>
      </div>
    );
  };
});

import { wordpressService } from '../services/wordpressService';

describe('RecipeList Component', () => {
  const mockRecipes = [
    {
      id: 1,
      title: 'Test Recipe 1',
      excerpt: 'This is a test recipe excerpt 1'
    },
    {
      id: 2,
      title: 'Test Recipe 2',
      excerpt: 'This is a test recipe excerpt 2'
    }
  ];

  const mockApiResponse = {
    recipes: mockRecipes,
    totalPages: 2
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders recipe list container', () => {
    render(<RecipeList />);
    expect(screen.getByTestId('recipe-list')).toBeInTheDocument();
  });

  test('renders recipe list header', () => {
    render(<RecipeList />);
    expect(screen.getByText('Recipes')).toBeInTheDocument();
  });

  test('renders search form', () => {
    render(<RecipeList />);
    expect(screen.getByPlaceholderText('Search recipes...')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  test('renders loading state initially', () => {
    render(<RecipeList />);
    expect(screen.getByLabelText('Loading recipes')).toBeInTheDocument();
  });

  test('renders recipes when API call succeeds', async () => {
    wordpressService.getRecipes.mockResolvedValue(mockApiResponse);

    render(<RecipeList />);

    await waitFor(() => {
      expect(screen.getByTestId('recipe-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('recipe-card-2')).toBeInTheDocument();
    });

    expect(screen.getByText('Test Recipe 1')).toBeInTheDocument();
    expect(screen.getByText('Test Recipe 2')).toBeInTheDocument();
  });

  test('renders error message when API call fails', async () => {
    wordpressService.getRecipes.mockRejectedValue(new Error('API Error'));

    render(<RecipeList />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load recipes. Please try again later.')).toBeInTheDocument();
    });
  });

  test('renders no recipes message when no recipes found', async () => {
    wordpressService.getRecipes.mockResolvedValue({
      recipes: [],
      totalPages: 1
    });

    render(<RecipeList />);

    await waitFor(() => {
      expect(screen.getByText('No recipes found. Try a different search term.')).toBeInTheDocument();
    });
  });

  test('handles search input change', () => {
    render(<RecipeList />);
    const searchInput = screen.getByPlaceholderText('Search recipes...');
    
    fireEvent.change(searchInput, { target: { value: 'pasta' } });
    expect(searchInput.value).toBe('pasta');
  });

  test('handles search form submission', async () => {
    wordpressService.searchRecipes.mockResolvedValue(mockApiResponse);

    render(<RecipeList />);
    const searchInput = screen.getByPlaceholderText('Search recipes...');
    const searchButton = screen.getByText('Search');
    
    fireEvent.change(searchInput, { target: { value: 'pasta' } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(wordpressService.searchRecipes).toHaveBeenCalledWith('pasta', 1);
    });
  });

  test('resets to page 1 when searching', async () => {
    // Set up the mock to return recipes initially
    wordpressService.getRecipes.mockResolvedValue(mockApiResponse);
    
    render(<RecipeList />);
    
    // Wait for recipes to load
    await waitFor(() => {
      expect(screen.getByTestId('recipe-card-1')).toBeInTheDocument();
    });

    // Now set up the mock for search
    wordpressService.searchRecipes.mockResolvedValue(mockApiResponse);
    
    const searchInput = screen.getByPlaceholderText('Search recipes...');
    const searchButton = screen.getByText('Search');
    
    // Perform search
    fireEvent.change(searchInput, { target: { value: 'pasta' } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(wordpressService.searchRecipes).toHaveBeenCalledWith('pasta', 1);
    });
  });

  test('renders pagination when multiple pages exist', async () => {
    wordpressService.getRecipes.mockResolvedValue({
      recipes: mockRecipes,
      totalPages: 3
    });

    render(<RecipeList />);

    await waitFor(() => {
      expect(screen.getByText('Previous')).toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();
      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    });
  });

  test('does not render pagination when only one page', async () => {
    wordpressService.getRecipes.mockResolvedValue({
      recipes: mockRecipes,
      totalPages: 1
    });

    render(<RecipeList />);

    await waitFor(() => {
      expect(screen.queryByText('Previous')).not.toBeInTheDocument();
      expect(screen.queryByText('Next')).not.toBeInTheDocument();
    });
  });

  test('pagination buttons work correctly', async () => {
    wordpressService.getRecipes.mockResolvedValue({
      recipes: mockRecipes,
      totalPages: 3
    });

    render(<RecipeList />);

    await waitFor(() => {
      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    });

    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(wordpressService.getRecipes).toHaveBeenCalledWith(2);
    });
  });

  test('previous button is disabled on first page', async () => {
    wordpressService.getRecipes.mockResolvedValue({
      recipes: mockRecipes,
      totalPages: 3
    });

    render(<RecipeList />);

    await waitFor(() => {
      const prevButton = screen.getByText('Previous');
      expect(prevButton).toBeDisabled();
    });
  });

  test('next button is disabled on last page', async () => {
    wordpressService.getRecipes.mockResolvedValue({
      recipes: mockRecipes,
      totalPages: 1
    });

    render(<RecipeList />);

    await waitFor(() => {
      expect(screen.queryByText('Next')).not.toBeInTheDocument();
    });
  });

  test('calls correct service method based on search query', async () => {
    wordpressService.getRecipes.mockResolvedValue(mockApiResponse);
    wordpressService.searchRecipes.mockResolvedValue(mockApiResponse);

    render(<RecipeList />);

    // Initially calls getRecipes
    await waitFor(() => {
      expect(wordpressService.getRecipes).toHaveBeenCalledWith(1);
    });

    // Search calls searchRecipes
    const searchInput = screen.getByPlaceholderText('Search recipes...');
    const searchButton = screen.getByText('Search');
    
    fireEvent.change(searchInput, { target: { value: 'pasta' } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(wordpressService.searchRecipes).toHaveBeenCalledWith('pasta', 1);
    });
  });

  test('handles empty search query correctly', async () => {
    wordpressService.getRecipes.mockResolvedValue(mockApiResponse);

    render(<RecipeList />);
    const searchInput = screen.getByPlaceholderText('Search recipes...');
    const searchButton = screen.getByText('Search');
    
    fireEvent.change(searchInput, { target: { value: '' } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(wordpressService.getRecipes).toHaveBeenCalledWith(1);
    });
  });
}); 