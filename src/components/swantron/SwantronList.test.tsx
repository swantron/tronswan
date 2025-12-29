import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { vi, expect, describe, test, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';

// Mock logger before importing the component
vi.mock('../../utils/logger', () => ({
  logger: {
    apiError: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

import { swantronService } from '../../services/swantronService';
import { logger } from '../../utils/logger';

import SwantronList from './SwantronList';

// Mock the swantronService
vi.mock('../../services/swantronService', () => ({
  swantronService: {
    getPosts: vi.fn(),
    searchPosts: vi.fn(),
  },
}));

// Mock the SEO component
vi.mock('../ui/SEO', () => ({
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

// Mock the SwantronCard component
vi.mock('./SwantronCard', () => ({
  default: function MockSwantronCard({ post }) {
    return (
      <div data-testid={`swantron-card-${post.id}`} data-post-id={post.id}>
        <h3>{post.title}</h3>
        <p>{post.excerpt}</p>
      </div>
    );
  },
}));

// Mock the CSS import
vi.mock('../styles/SwantronList.css', () => ({}));

const renderWithRouter = component => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('SwantronList Component', () => {
  const mockPosts = [
    {
      id: 1,
      title: 'First Post',
      excerpt: 'First post excerpt',
      date: '2023-12-25T10:00:00Z',
      featuredImage: 'https://example.com/image1.jpg',
      categories: [{ id: 1, name: 'Technology' }],
      link: 'https://swantron.com/post/1',
    },
    {
      id: 2,
      title: 'Second Post',
      excerpt: 'Second post excerpt',
      date: '2023-12-26T10:00:00Z',
      featuredImage: 'https://example.com/image2.jpg',
      categories: [{ id: 2, name: 'Life' }],
      link: 'https://swantron.com/post/2',
    },
  ];

  const mockPostsResponse = {
    posts: mockPosts,
    totalPages: 3,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Console mocking no longer needed since we use logger
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('renders loading state initially', () => {
    (swantronService.getPosts as any).mockImplementation(
      () => new Promise(() => {})
    );

    renderWithRouter(<SwantronList />);

    expect(screen.getByLabelText('Loading posts')).toBeInTheDocument();
  });

  test('renders SEO component with correct props', async () => {
    (swantronService.getPosts as any).mockResolvedValue(mockPostsResponse);

    renderWithRouter(<SwantronList />);

    await waitFor(() => {
      expect(screen.getByTestId('seo-component')).toBeInTheDocument();
    });

    const seoComponent = screen.getByTestId('seo-component');
    expect(seoComponent).toHaveAttribute(
      'data-title',
      'Swantron Posts - Personal Blog | Tron Swan'
    );
    expect(seoComponent).toHaveAttribute(
      'data-description',
      "Explore personal posts and thoughts from Joseph Swanson's blog at swantron.com. Tech insights, life updates, and random musings from a software engineer."
    );
    expect(seoComponent).toHaveAttribute(
      'data-keywords',
      'swantron, Joseph Swanson, blog posts, software engineering, personal blog, tech insights'
    );
    expect(seoComponent).toHaveAttribute('data-url', '/swantron');
  });

  test('renders search form', async () => {
    (swantronService.getPosts as any).mockResolvedValue(mockPostsResponse);

    renderWithRouter(<SwantronList />);

    await waitFor(() => {
      expect(screen.getByTestId('swantron-list')).toBeInTheDocument();
    });

    expect(screen.getByPlaceholderText('Search posts...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
  });

  test('handles search functionality', async () => {
    (swantronService.getPosts as any).mockResolvedValue(mockPostsResponse);
    (swantronService.searchPosts as any).mockResolvedValue({
      posts: [mockPosts[0]],
      totalPages: 1,
    });

    renderWithRouter(<SwantronList />);

    await waitFor(() => {
      expect(screen.getByTestId('swantron-list')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search posts...');
    const searchButton = screen.getByRole('button', { name: 'Search' });

    fireEvent.change(searchInput, { target: { value: 'test query' } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(swantronService.searchPosts as any).toHaveBeenCalledWith(
        'test query',
        1
      );
    });
  });

  test('renders error state when API call fails', async () => {
    (swantronService.getPosts as any).mockRejectedValue(new Error('API Error'));

    renderWithRouter(<SwantronList />);

    await waitFor(() => {
      expect(
        screen.getByText(
          'Failed to load posts from swantron.com. Please try again later.'
        )
      ).toBeInTheDocument();
    });
  });

  test('calls getPosts on initial load', async () => {
    (swantronService.getPosts as any).mockResolvedValue(mockPostsResponse);

    renderWithRouter(<SwantronList />);

    await waitFor(() => {
      expect(swantronService.getPosts as any).toHaveBeenCalledWith(1);
    });
  });

  test('calls searchPosts when search query is provided', async () => {
    (swantronService.getPosts as any).mockResolvedValue(mockPostsResponse);
    (swantronService.searchPosts as any).mockResolvedValue({
      posts: [mockPosts[0]],
      totalPages: 1,
    });

    renderWithRouter(<SwantronList />);

    await waitFor(() => {
      expect(screen.getByTestId('swantron-list')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search posts...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    await waitFor(() => {
      expect(swantronService.searchPosts as any).toHaveBeenCalledWith(
        'test',
        1
      );
    });
  });

  test('handles search with empty query', async () => {
    (swantronService.getPosts as any).mockResolvedValue(mockPostsResponse);

    renderWithRouter(<SwantronList />);

    await waitFor(() => {
      expect(screen.getByTestId('swantron-list')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search posts...');
    fireEvent.change(searchInput, { target: { value: '' } });

    await waitFor(() => {
      expect(swantronService.getPosts as any).toHaveBeenCalledWith(1);
    });
  });

  test('handles search with special characters', async () => {
    (swantronService.getPosts as any).mockResolvedValue(mockPostsResponse);
    (swantronService.searchPosts as any).mockResolvedValue({
      posts: [mockPosts[0]],
      totalPages: 1,
    });

    renderWithRouter(<SwantronList />);

    await waitFor(() => {
      expect(screen.getByTestId('swantron-list')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search posts...');
    fireEvent.change(searchInput, {
      target: { value: 'test & query with special chars!' },
    });

    await waitFor(() => {
      expect(swantronService.searchPosts as any).toHaveBeenCalledWith(
        'test & query with special chars!',
        1
      );
    });
  });

  test('handles search with very long query', async () => {
    (swantronService.getPosts as any).mockResolvedValue(mockPostsResponse);
    (swantronService.searchPosts as any).mockResolvedValue({
      posts: [mockPosts[0]],
      totalPages: 1,
    });

    renderWithRouter(<SwantronList />);

    await waitFor(() => {
      expect(screen.getByTestId('swantron-list')).toBeInTheDocument();
    });

    const longQuery = 'a'.repeat(1000);
    const searchInput = screen.getByPlaceholderText('Search posts...');
    fireEvent.change(searchInput, { target: { value: longQuery } });

    await waitFor(() => {
      expect(swantronService.searchPosts as any).toHaveBeenCalledWith(
        longQuery,
        1
      );
    });
  });

  test('logs error to console when API call fails', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const apiError = new Error('Network error');
    (swantronService.getPosts as any).mockRejectedValue(apiError);

    renderWithRouter(<SwantronList />);

    await waitFor(() => {
      expect(
        screen.getByText(
          'Failed to load posts from swantron.com. Please try again later.'
        )
      ).toBeInTheDocument();
    });

    expect(logger.error).toHaveBeenCalledWith('Error fetching swantron posts', {
      error: apiError,
    });
  });

  test('renders pagination when totalPages > 1', async () => {
    (swantronService.getPosts as any).mockResolvedValue({
      posts: mockPosts,
      totalPages: 3,
    });

    renderWithRouter(<SwantronList />);

    await waitFor(() => {
      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    });

    expect(
      screen.getByRole('button', { name: 'Previous' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
  });

  test('does not render pagination when totalPages === 1', async () => {
    (swantronService.getPosts as any).mockResolvedValue({
      posts: mockPosts,
      totalPages: 1,
    });

    renderWithRouter(<SwantronList />);

    await waitFor(() => {
      expect(screen.getByTestId('swantron-list')).toBeInTheDocument();
    });

    expect(screen.queryByText(/Page \d+ of \d+/)).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Previous' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Next' })
    ).not.toBeInTheDocument();
  });

  test('Previous button is disabled on first page', async () => {
    (swantronService.getPosts as any).mockResolvedValue({
      posts: mockPosts,
      totalPages: 3,
    });

    renderWithRouter(<SwantronList />);

    await waitFor(() => {
      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    });

    const prevButton = screen.getByRole('button', { name: 'Previous' });
    expect(prevButton).toBeDisabled();
  });

  test('Next button is disabled on last page', async () => {
    (swantronService.getPosts as any).mockResolvedValue({
      posts: mockPosts,
      totalPages: 2,
    });

    renderWithRouter(<SwantronList />);

    await waitFor(() => {
      expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
    });

    const nextButton = screen.getByRole('button', { name: 'Next' });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
    });

    const nextButtonAfterClick = screen.getByRole('button', { name: 'Next' });
    expect(nextButtonAfterClick).toBeDisabled();
  });

  test('clicking Previous button decreases page and logs', async () => {
    (swantronService.getPosts as any).mockResolvedValue({
      posts: mockPosts,
      totalPages: 3,
    });

    renderWithRouter(<SwantronList />);

    await waitFor(() => {
      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    });

    // Navigate to page 2 first
    const nextButton = screen.getByRole('button', { name: 'Next' });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
    });

    // Now click Previous
    const prevButton = screen.getByRole('button', { name: 'Previous' });
    fireEvent.click(prevButton);

    await waitFor(() => {
      expect(logger.info).toHaveBeenCalledWith(
        'Swantron pagination - Previous clicked',
        {
          fromPage: 2,
          toPage: 1,
          searchQuery: '',
          timestamp: expect.any(String),
        }
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    });
  });

  test('clicking Next button increases page and logs', async () => {
    (swantronService.getPosts as any).mockResolvedValue({
      posts: mockPosts,
      totalPages: 3,
    });

    renderWithRouter(<SwantronList />);

    await waitFor(() => {
      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    });

    const nextButton = screen.getByRole('button', { name: 'Next' });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(logger.info).toHaveBeenCalledWith(
        'Swantron pagination - Next clicked',
        {
          fromPage: 1,
          toPage: 2,
          searchQuery: '',
          timestamp: expect.any(String),
        }
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
    });
  });

  test('Previous button does not go below page 1', async () => {
    (swantronService.getPosts as any).mockResolvedValue({
      posts: mockPosts,
      totalPages: 3,
    });

    renderWithRouter(<SwantronList />);

    await waitFor(() => {
      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    });

    const prevButton = screen.getByRole('button', { name: 'Previous' });
    expect(prevButton).toBeDisabled();

    // Even if we try to click (shouldn't happen when disabled, but test the logic)
    fireEvent.click(prevButton);

    // Should still be on page 1
    await waitFor(() => {
      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    });
  });

  test('Next button does not go above totalPages', async () => {
    (swantronService.getPosts as any).mockResolvedValue({
      posts: mockPosts,
      totalPages: 2,
    });

    renderWithRouter(<SwantronList />);

    await waitFor(() => {
      expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
    });

    // Navigate to last page
    const nextButton = screen.getByRole('button', { name: 'Next' });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
    });

    const nextButtonOnLastPage = screen.getByRole('button', { name: 'Next' });
    expect(nextButtonOnLastPage).toBeDisabled();
  });

  test('pagination logs include search query when searching', async () => {
    (swantronService.getPosts as any).mockResolvedValue(mockPostsResponse);
    (swantronService.searchPosts as any).mockResolvedValue({
      posts: mockPosts,
      totalPages: 2,
    });

    renderWithRouter(<SwantronList />);

    await waitFor(() => {
      expect(screen.getByTestId('swantron-list')).toBeInTheDocument();
    });

    // Perform a search
    const searchInput = screen.getByPlaceholderText('Search posts...');
    fireEvent.change(searchInput, { target: { value: 'test query' } });

    await waitFor(() => {
      expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
    });

    // Click Next
    const nextButton = screen.getByRole('button', { name: 'Next' });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(logger.info).toHaveBeenCalledWith(
        'Swantron pagination - Next clicked',
        {
          fromPage: 1,
          toPage: 2,
          searchQuery: 'test query',
          timestamp: expect.any(String),
        }
      );
    });
  });
});
