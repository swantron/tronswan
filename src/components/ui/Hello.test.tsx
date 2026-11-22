import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { vi, expect, describe, test } from 'vitest';

import '@testing-library/jest-dom';
import Hello from './Hello';

function renderHello() {
  return render(
    <MemoryRouter>
      <Hello />
    </MemoryRouter>
  );
}

// Mock the SEO component to prevent react-helmet-async errors
vi.mock('./SEO', () => ({
  default: function MockSEO() {
    return null;
  },
}));

describe('Hello Component', () => {
  test('renders page title', () => {
    renderHello();
    expect(screen.getByTestId('hello-title')).toBeInTheDocument();
    expect(screen.getByTestId('hello-title')).toHaveTextContent('hello');
  });

  test('renders subtitle', () => {
    renderHello();
    expect(screen.getByText('joseph swanson')).toBeInTheDocument();
  });

  test('renders description section', () => {
    renderHello();
    expect(
      screen.getByText('staff software engineer @ demandbase')
    ).toBeInTheDocument();
    expect(
      screen.getByText('devx · ci/cd · ai · iac · react')
    ).toBeInTheDocument();
    expect(screen.getByText('bozeman, montana')).toBeInTheDocument();
  });

  test('renders LinkedIn link', () => {
    renderHello();
    const linkedinLink = screen.getByText(/^linkedin/);
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

  test('renders resume link', () => {
    renderHello();
    const resumeLink = screen.getByText('resume');
    expect(resumeLink).toBeInTheDocument();
    expect(resumeLink.closest('a')).toHaveAttribute('href', '/resume');
    expect(resumeLink.closest('a')).toHaveAttribute('aria-label', 'Resume');
  });

  test('renders building/deploying/learning text with correct class', () => {
    renderHello();
    const buildingText = screen.getByText('building / deploying / learning');
    expect(buildingText).toBeInTheDocument();
    expect(buildingText).toHaveClass('building-learning-text');
  });

  test('all links have proper accessibility attributes', () => {
    renderHello();

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
    renderHello();

    const linkedinLink = screen.getByText(/^linkedin/).closest('a');
    const githubLink = screen.getByText(/^github/).closest('a');
    const resumeLink = screen.getByText('resume').closest('a');

    expect(linkedinLink).toHaveClass('hello-link');
    expect(githubLink).toHaveClass('hello-link');
    expect(resumeLink).toHaveClass('hello-link');
  });

  test('component structure is correct', () => {
    renderHello();

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

  test('link text is present', () => {
    renderHello();

    // Check for text
    expect(screen.getByText(/bozeman, montana/)).toBeInTheDocument();
    expect(screen.getByText(/linkedin/)).toBeInTheDocument();
    expect(screen.getByText(/github/)).toBeInTheDocument();
    expect(screen.getByText(/resume/)).toBeInTheDocument();
  });
});
