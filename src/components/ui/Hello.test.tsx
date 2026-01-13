import { render, screen } from '@testing-library/react';
import React from 'react';
import { vi, expect, describe, test } from 'vitest';

import '@testing-library/jest-dom';
import Hello from './Hello';

// Mock the SEO component to prevent react-helmet-async errors
vi.mock('./SEO', () => ({
  default: function MockSEO() {
    return null;
  },
}));

describe('Hello Component', () => {
  test('renders page title', () => {
    render(<Hello />);
    expect(screen.getByTestId('hello-title')).toBeInTheDocument();
    expect(screen.getByTestId('hello-title')).toHaveTextContent('hello');
  });

  test('renders subtitle', () => {
    render(<Hello />);
    expect(screen.getByText('joseph swanson')).toBeInTheDocument();
  });

  test('renders description section', () => {
    render(<Hello />);
    expect(screen.getByText('Staff Software Engineer @ Esri')).toBeInTheDocument();
    expect(screen.getByText('DevX · CI/CD · AI · IaC · React')).toBeInTheDocument();
    expect(screen.getByText('Bozeman, Montana 🏔️')).toBeInTheDocument();
  });

  test('renders LinkedIn link', () => {
    render(<Hello />);
    const linkedinLink = screen.getByText('💼 linkedin');
    expect(linkedinLink).toBeInTheDocument();
    expect(linkedinLink.closest('a')).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/joseph-swanson-11092758/'
    );
    expect(linkedinLink.closest('a')).toHaveAttribute('target', '_blank');
    expect(linkedinLink.closest('a')).toHaveAttribute(
      'rel',
      'noopener noreferrer'
    );
    expect(linkedinLink.closest('a')).toHaveAttribute(
      'aria-label',
      "Joseph Swanson's LinkedIn"
    );
  });

  test('renders personal website link', () => {
    render(<Hello />);
    const personalLink = screen.getByText('🦢 blog');
    expect(personalLink).toBeInTheDocument();
    expect(personalLink.closest('a')).toHaveAttribute(
      'href',
      'https://swantron.com'
    );
    expect(personalLink.closest('a')).toHaveAttribute('target', '_blank');
    expect(personalLink.closest('a')).toHaveAttribute(
      'rel',
      'noopener noreferrer'
    );
    expect(personalLink.closest('a')).toHaveAttribute(
      'aria-label',
      "Joseph's blog"
    );
  });

  test('renders recipe website link', () => {
    render(<Hello />);
    const recipeLink = screen.getByText('🍳 chomptron.com');
    expect(recipeLink).toBeInTheDocument();
    expect(recipeLink.closest('a')).toHaveAttribute(
      'href',
      'https://chomptron.com'
    );
    expect(recipeLink.closest('a')).toHaveAttribute('target', '_blank');
    expect(recipeLink.closest('a')).toHaveAttribute(
      'rel',
      'noopener noreferrer'
    );
    expect(recipeLink.closest('a')).toHaveAttribute(
      'aria-label',
      'AI-powered recipe app'
    );
  });

  test('renders resume link', () => {
    render(<Hello />);
    const resumeLink = screen.getByText('📄 resume');
    expect(resumeLink).toBeInTheDocument();
    expect(resumeLink.closest('a')).toHaveAttribute('href', '/resume');
    expect(resumeLink.closest('a')).toHaveAttribute('aria-label', 'Resume');
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
    expect(allLinks).toHaveLength(4);

    // Check external links have proper attributes
    const externalLinks = allLinks.filter(
      link => link.getAttribute('target') === '_blank'
    );
    externalLinks.forEach(link => {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      expect(link).toHaveAttribute('aria-label');
    });

    // Check internal link has aria-label
    const internalLink = allLinks.find(
      link => link.getAttribute('href') === '/resume'
    );
    expect(internalLink).toHaveAttribute('aria-label');
  });

  test('links have correct CSS classes', () => {
    render(<Hello />);

    const linkedinLink = screen.getByText('💼 linkedin').closest('a');
    const personalLink = screen.getByText('🦢 blog').closest('a');
    const recipeLink = screen.getByText('🍳 chomptron.com').closest('a');
    const resumeLink = screen.getByText('📄 resume').closest('a');

    expect(linkedinLink).toHaveClass('hello-link', 'primary');
    expect(personalLink).toHaveClass('hello-link', 'primary');
    expect(recipeLink).toHaveClass('hello-link', 'secondary');
    expect(resumeLink).toHaveClass('hello-link', 'secondary');
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
    expect(screen.getByText(/Bozeman, Montana 🏔️/)).toBeInTheDocument();
    expect(screen.getByText(/💼 linkedin/)).toBeInTheDocument();
    expect(screen.getByText(/🦢 blog/)).toBeInTheDocument();
    expect(screen.getByText(/🍳 chomptron.com/)).toBeInTheDocument();
    expect(screen.getByText(/📄 resume/)).toBeInTheDocument();
  });
});
