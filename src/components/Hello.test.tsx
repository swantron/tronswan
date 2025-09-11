import { vi, expect, describe, test } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Hello from './Hello';

// Mock the SEO component to prevent react-helmet-async errors
vi.mock('./SEO', () => ({
  default: function MockSEO() {
    return null;
  }
}));

describe('Hello Component', () => {
  test('renders page title', () => {
    render(<Hello />);
    expect(screen.getByTestId('hello-title')).toBeInTheDocument();
    expect(screen.getByTestId('hello-title')).toHaveTextContent('hello');
  });

  test('renders subtitle', () => {
    render(<Hello />);
    expect(screen.getByText('👋 connect with joseph swanson')).toBeInTheDocument();
  });

  test('renders description section', () => {
    render(<Hello />);
    expect(screen.getByText('Staff Software Engineer building full-stack solutions with a focus on DevX, CI/CD, AI, IaC, and React')).toBeInTheDocument();
    expect(screen.getByText('Based in Bozeman, Montana 🏔️')).toBeInTheDocument();
  });

  test('renders LinkedIn link', () => {
    render(<Hello />);
    const linkedinLink = screen.getByText('💼 LinkedIn Profile');
    expect(linkedinLink).toBeInTheDocument();
    expect(linkedinLink.closest('a')).toHaveAttribute('href', 'https://www.linkedin.com/in/joseph-swanson-11092758/');
    expect(linkedinLink.closest('a')).toHaveAttribute('target', '_blank');
    expect(linkedinLink.closest('a')).toHaveAttribute('rel', 'noopener noreferrer');
    expect(linkedinLink.closest('a')).toHaveAttribute('aria-label', 'Joseph Swanson\'s LinkedIn');
  });

  test('renders personal website link', () => {
    render(<Hello />);
    const personalLink = screen.getByText('🦢 swan tron dot com');
    expect(personalLink).toBeInTheDocument();
    expect(personalLink.closest('a')).toHaveAttribute('href', 'https://swantron.com');
    expect(personalLink.closest('a')).toHaveAttribute('target', '_blank');
    expect(personalLink.closest('a')).toHaveAttribute('rel', 'noopener noreferrer');
    expect(personalLink.closest('a')).toHaveAttribute('aria-label', 'Joseph\'s personal website');
  });

  test('renders recipe website link', () => {
    render(<Hello />);
    const recipeLink = screen.getByText('🍳 chomp tron dot com');
    expect(recipeLink).toBeInTheDocument();
    expect(recipeLink.closest('a')).toHaveAttribute('href', 'https://chomptron.com');
    expect(recipeLink.closest('a')).toHaveAttribute('target', '_blank');
    expect(recipeLink.closest('a')).toHaveAttribute('rel', 'noopener noreferrer');
    expect(recipeLink.closest('a')).toHaveAttribute('aria-label', 'Joseph\'s recipe website');
  });

  test('renders about this site section', () => {
    render(<Hello />);
    expect(screen.getByText('About This Site')).toBeInTheDocument();
  });

  test('renders building/deploying/learning text with correct class', () => {
    render(<Hello />);
    const buildingText = screen.getByText('building / deploying / learning');
    expect(buildingText).toBeInTheDocument();
    expect(buildingText).toHaveClass('building-learning-text');
  });

  test('all links have proper accessibility attributes', () => {
    render(<Hello />);
    
    const allLinks = screen.getAllByRole('link');
    expect(allLinks).toHaveLength(3);
    
    allLinks.forEach(link => {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      expect(link).toHaveAttribute('aria-label');
    });
  });

  test('links have correct CSS classes', () => {
    render(<Hello />);
    
    const linkedinLink = screen.getByText('💼 LinkedIn Profile').closest('a');
    const personalLink = screen.getByText('🦢 swan tron dot com').closest('a');
    const recipeLink = screen.getByText('🍳 chomp tron dot com').closest('a');
    
    expect(linkedinLink).toHaveClass('hello-link', 'linkedin');
    expect(personalLink).toHaveClass('hello-link', 'personal');
    expect(recipeLink).toHaveClass('hello-link', 'recipes');
  });

  test('component structure is correct', () => {
    render(<Hello />);
    
    // Check main container
    expect(document.querySelector('.hello-page')).toBeInTheDocument();
    
    // Check content wrapper
    expect(document.querySelector('.hello-content')).toBeInTheDocument();
    
    // Check description section
    expect(document.querySelector('.hello-description')).toBeInTheDocument();
    
    // Check links section
    expect(document.querySelector('.hello-links')).toBeInTheDocument();
    
    // Check info section
    expect(document.querySelector('.hello-info')).toBeInTheDocument();
  });

  test('emoji icons are present', () => {
    render(<Hello />);
    
    // Check for emojis in context
    expect(screen.getByText(/👋 connect with joseph swanson/)).toBeInTheDocument();
    expect(screen.getByText(/Based in Bozeman, Montana 🏔️/)).toBeInTheDocument();
    expect(screen.getByText(/💼 LinkedIn Profile/)).toBeInTheDocument();
    expect(screen.getByText(/🦢 swan tron dot com/)).toBeInTheDocument();
    expect(screen.getByText(/🍳 chomp tron dot com/)).toBeInTheDocument();
  });
}); 