import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RecipeCard from './RecipeCard';

// Mock the useDateFormatter hook
jest.mock('../hooks/useDateFormatter', () => ({
  useDateFormatter: () => jest.fn((date) => `Formatted: ${date}`)
}));

// Wrapper component to provide router context
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('RecipeCard Component', () => {
  const mockRecipe = {
    id: 1,
    title: 'Test Recipe',
    excerpt: '<p>This is a test recipe excerpt</p>',
    date: '2023-12-25',
    featuredImage: 'https://example.com/image.jpg',
    categories: [
      { id: 1, name: 'Breakfast' },
      { id: 2, name: 'Quick' }
    ]
  };

  const mockRecipeWithoutImage = {
    id: 2,
    title: 'Recipe Without Image',
    excerpt: '<p>No image recipe</p>',
    date: '2023-12-26',
    featuredImage: null,
    categories: []
  };

  test('renders recipe card with all elements', () => {
    renderWithRouter(<RecipeCard recipe={mockRecipe} />);
    
    expect(screen.getByTestId('recipe-card')).toBeInTheDocument();
    expect(screen.getByText('Test Recipe')).toBeInTheDocument();
    expect(screen.getByText('This is a test recipe excerpt')).toBeInTheDocument();
    expect(screen.getByText('Formatted: 2023-12-25')).toBeInTheDocument();
  });

  test('renders recipe image when featuredImage exists', () => {
    renderWithRouter(<RecipeCard recipe={mockRecipe} />);
    
    const image = screen.getByAltText('Test Recipe');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
    expect(image).toHaveAttribute('loading', 'lazy');
  });

  test('does not render image when featuredImage is null', () => {
    renderWithRouter(<RecipeCard recipe={mockRecipeWithoutImage} />);
    
    expect(screen.queryByAltText('Recipe Without Image')).not.toBeInTheDocument();
  });

  test('renders recipe categories when they exist', () => {
    renderWithRouter(<RecipeCard recipe={mockRecipe} />);
    
    expect(screen.getByText('Breakfast')).toBeInTheDocument();
    expect(screen.getByText('Quick')).toBeInTheDocument();
  });

  test('does not render categories section when categories array is empty', () => {
    renderWithRouter(<RecipeCard recipe={mockRecipeWithoutImage} />);
    
    expect(screen.queryByText('Breakfast')).not.toBeInTheDocument();
    expect(screen.queryByText('Quick')).not.toBeInTheDocument();
  });

  test('renders recipe excerpt with HTML content', () => {
    renderWithRouter(<RecipeCard recipe={mockRecipe} />);
    
    const excerptElement = screen.getByText('This is a test recipe excerpt');
    expect(excerptElement).toBeInTheDocument();
    expect(excerptElement.tagName).toBe('P');
  });

  test('renders link with correct route', () => {
    renderWithRouter(<RecipeCard recipe={mockRecipe} />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/recipes/1');
  });

  test('renders recipe card with correct CSS classes', () => {
    renderWithRouter(<RecipeCard recipe={mockRecipe} />);
    
    const card = screen.getByTestId('recipe-card');
    expect(card).toHaveClass('recipe-card');
    
    const link = screen.getByRole('link');
    expect(link).toHaveClass('recipe-card-link');
    
    const title = screen.getByText('Test Recipe');
    expect(title).toHaveClass('recipe-card-title');
    
    const excerpt = screen.getByText('This is a test recipe excerpt');
    expect(excerpt.parentElement).toHaveClass('recipe-card-excerpt');
  });

  test('renders recipe meta information correctly', () => {
    renderWithRouter(<RecipeCard recipe={mockRecipe} />);
    
    const metaElement = screen.getByText('Formatted: 2023-12-25');
    expect(metaElement).toBeInTheDocument();
    expect(metaElement.parentElement).toHaveClass('recipe-card-meta');
  });

  test('renders category elements with correct structure', () => {
    renderWithRouter(<RecipeCard recipe={mockRecipe} />);
    
    const breakfastCategory = screen.getByText('Breakfast');
    const quickCategory = screen.getByText('Quick');
    
    expect(breakfastCategory).toHaveClass('recipe-card-category');
    expect(quickCategory).toHaveClass('recipe-card-category');
    
    expect(breakfastCategory.parentElement).toHaveClass('recipe-card-categories');
  });

  test('handles recipe with minimal data', () => {
    const minimalRecipe = {
      id: 3,
      title: 'Minimal Recipe',
      excerpt: '',
      date: '2023-12-27',
      featuredImage: null,
      categories: []
    };
    
    renderWithRouter(<RecipeCard recipe={minimalRecipe} />);
    
    expect(screen.getByText('Minimal Recipe')).toBeInTheDocument();
    expect(screen.getByText('Formatted: 2023-12-27')).toBeInTheDocument();
    expect(screen.queryByAltText('Minimal Recipe')).not.toBeInTheDocument();
  });

  test('handles recipe with empty excerpt', () => {
    const emptyExcerptRecipe = {
      ...mockRecipe,
      excerpt: ''
    };
    
    renderWithRouter(<RecipeCard recipe={emptyExcerptRecipe} />);
    
    expect(screen.getByTestId('recipe-card')).toBeInTheDocument();
    expect(screen.getByText('Test Recipe')).toBeInTheDocument();
    expect(screen.getByText('Formatted: 2023-12-25')).toBeInTheDocument();
  });

  test('handles recipe with single category', () => {
    const singleCategoryRecipe = {
      ...mockRecipe,
      categories: [{ id: 1, name: 'Dinner' }]
    };
    
    renderWithRouter(<RecipeCard recipe={singleCategoryRecipe} />);
    
    expect(screen.getByText('Dinner')).toBeInTheDocument();
    expect(screen.queryByText('Breakfast')).not.toBeInTheDocument();
    expect(screen.queryByText('Quick')).not.toBeInTheDocument();
  });

  test('renders multiple categories in correct order', () => {
    renderWithRouter(<RecipeCard recipe={mockRecipe} />);
    
    const categories = screen.getAllByText(/Breakfast|Quick/);
    expect(categories).toHaveLength(2);
    expect(categories[0]).toHaveTextContent('Breakfast');
    expect(categories[1]).toHaveTextContent('Quick');
  });

  test('handles recipe with very long title', () => {
    const longTitleRecipe = {
      ...mockRecipe,
      title: 'This is a very long recipe title that might exceed normal display limits and should be handled gracefully by the component'
    };
    
    renderWithRouter(<RecipeCard recipe={longTitleRecipe} />);
    
    expect(screen.getByText(longTitleRecipe.title)).toBeInTheDocument();
  });

  test('handles recipe with HTML in excerpt', () => {
    const htmlExcerptRecipe = {
      ...mockRecipe,
      excerpt: '<h2>HTML Title</h2><p>Paragraph with <strong>bold</strong> text</p>'
    };
    
    renderWithRouter(<RecipeCard recipe={htmlExcerptRecipe} />);
    
    expect(screen.getByText('HTML Title')).toBeInTheDocument();
    expect(screen.getByText('bold')).toBeInTheDocument();
    // Check that the paragraph content is rendered (text might be split across elements)
    expect(screen.getByText(/Paragraph with/)).toBeInTheDocument();
  });
});
