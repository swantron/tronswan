import { render, screen } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { vi, expect, describe, test } from 'vitest';
import '@testing-library/jest-dom';

// Mock logger before importing
vi.mock('../../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

// Mock SEO component
vi.mock('./SEO', () => ({
  default: function MockSEO({ title, description, keywords, url }) {
    return (
      <div
        data-testid='seo-component'
        data-title={title}
        data-description={description}
        data-keywords={keywords}
        data-url={url}
      >
        SEO Component
      </div>
    );
  },
}));

// Mock CSS
vi.mock('../../styles/Chomptron.css', () => ({}));

import { logger } from '../../utils/logger';

import Chomptron from './Chomptron';

const renderWithRouter = component => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Chomptron Component', () => {
  test('renders chomptron page', () => {
    renderWithRouter(<Chomptron />);
    expect(screen.getByTestId('chomptron-container')).toBeInTheDocument();
    expect(screen.getByText('chomptron')).toBeInTheDocument();
  });

  test('renders SEO component with correct props', () => {
    renderWithRouter(<Chomptron />);
    const seoComponent = screen.getByTestId('seo-component');
    expect(seoComponent).toHaveAttribute(
      'data-title',
      'Chomptron - AI Recipe App | Tron Swan'
    );
    expect(seoComponent).toHaveAttribute(
      'data-description',
      'AI-powered recipe app with Gemini. Explore recipes powered by Google Gemini AI.'
    );
    expect(seoComponent).toHaveAttribute('data-url', '/chomptron');
  });

  test('renders external link to chomptron.com', () => {
    renderWithRouter(<Chomptron />);
    const externalLink = screen.getByText('chomptron.com');
    expect(externalLink).toBeInTheDocument();
    expect(externalLink.closest('a')).toHaveAttribute(
      'href',
      'https://chomptron.com'
    );
    expect(externalLink.closest('a')).toHaveAttribute('target', '_blank');
    expect(externalLink.closest('a')).toHaveAttribute(
      'rel',
      'noopener noreferrer'
    );
  });

  test('logs page load on mount', () => {
    renderWithRouter(<Chomptron />);
    expect(logger.info).toHaveBeenCalledWith('Chomptron page loaded', {
      timestamp: expect.any(String),
    });
  });

  test('renders descriptive text about chomptron', () => {
    renderWithRouter(<Chomptron />);
    expect(screen.getByText(/Visit/)).toBeInTheDocument();
    expect(
      screen.getByText(/for the full AI-powered recipe experience/)
    ).toBeInTheDocument();
  });
});
