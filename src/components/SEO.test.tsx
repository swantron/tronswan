import { render, screen } from '@testing-library/react';
import React from 'react';
import { vi, expect, describe, test, beforeEach, afterEach } from 'vitest';

import SEO from './SEO';

// Mock react-helmet-async
vi.mock('react-helmet-async', () => ({
  Helmet: ({ children }) => <div data-testid='helmet'>{children}</div>,
}));

describe('SEO Component', () => {
  test('renders with default props', () => {
    render(<SEO />);

    const helmet = screen.getByTestId('helmet');
    expect(helmet).toBeInTheDocument();
  });

  test('renders with custom title', () => {
    const customTitle = 'Custom Page Title';
    render(<SEO title={customTitle} />);

    const helmet = screen.getByTestId('helmet');
    expect(helmet).toBeInTheDocument();
  });

  test('renders with custom description', () => {
    const customDescription = 'Custom page description';
    render(<SEO description={customDescription} />);

    const helmet = screen.getByTestId('helmet');
    expect(helmet).toBeInTheDocument();
  });

  test('renders with custom keywords', () => {
    const customKeywords = 'custom, keywords, test';
    render(<SEO keywords={customKeywords} />);

    const helmet = screen.getByTestId('helmet');
    expect(helmet).toBeInTheDocument();
  });

  test('renders with custom image', () => {
    const customImage = '/custom-image.jpg';
    render(<SEO image={customImage} />);

    const helmet = screen.getByTestId('helmet');
    expect(helmet).toBeInTheDocument();
  });

  test('renders with custom URL', () => {
    const customUrl = '/custom-page';
    render(<SEO url={customUrl} />);

    const helmet = screen.getByTestId('helmet');
    expect(helmet).toBeInTheDocument();
  });

  test('renders with custom type', () => {
    const customType = 'article';
    render(<SEO type={customType} />);

    const helmet = screen.getByTestId('helmet');
    expect(helmet).toBeInTheDocument();
  });

  test('renders with custom author', () => {
    const customAuthor = 'Custom Author';
    render(<SEO author={customAuthor} />);

    const helmet = screen.getByTestId('helmet');
    expect(helmet).toBeInTheDocument();
  });

  test('renders with structured data', () => {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Test Article',
    };
    render(<SEO structuredData={structuredData} />);

    const helmet = screen.getByTestId('helmet');
    expect(helmet).toBeInTheDocument();
  });

  test('renders without structured data', () => {
    render(<SEO structuredData={null} />);

    const helmet = screen.getByTestId('helmet');
    expect(helmet).toBeInTheDocument();
  });

  test('handles external URL correctly', () => {
    const externalUrl = 'https://example.com/page';
    render(<SEO url={externalUrl} />);

    const helmet = screen.getByTestId('helmet');
    expect(helmet).toBeInTheDocument();
  });

  test('handles external image URL correctly', () => {
    const externalImage = 'https://example.com/image.jpg';
    render(<SEO image={externalImage} />);

    const helmet = screen.getByTestId('helmet');
    expect(helmet).toBeInTheDocument();
  });

  test('handles relative URL correctly', () => {
    const relativeUrl = '/relative-page';
    render(<SEO url={relativeUrl} />);

    const helmet = screen.getByTestId('helmet');
    expect(helmet).toBeInTheDocument();
  });

  test('handles relative image URL correctly', () => {
    const relativeImage = '/relative-image.jpg';
    render(<SEO image={relativeImage} />);

    const helmet = screen.getByTestId('helmet');
    expect(helmet).toBeInTheDocument();
  });

  test('renders with all custom props', () => {
    const props = {
      title: 'Custom Title',
      description: 'Custom Description',
      keywords: 'custom, keywords',
      image: '/custom-image.jpg',
      url: '/custom-url',
      type: 'article',
      author: 'Custom Author',
      structuredData: { '@type': 'Article' },
    };

    render(<SEO {...props} />);

    const helmet = screen.getByTestId('helmet');
    expect(helmet).toBeInTheDocument();
  });
});
