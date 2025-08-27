import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SwantronList from './SwantronList';

// Mock the swantronService
jest.mock('../services/swantronService', () => ({
  swantronService: {
    getPosts: jest.fn(),
    searchPosts: jest.fn()
  }
}));

// Mock the SEO component
jest.mock('./SEO', () => {
  return function MockSEO({ title, description, keywords, url }) {
    return (
      <div data-testid="seo-component" data-title={title} data-description={description} data-keywords={keywords} data-url={url}>
        SEO Component
      </div>
    );
  };
});

// Mock the SwantronCard component
jest.mock('./SwantronCard', () => {
  return function MockSwantronCard({ post }) {
    return (
      <div data-testid={`swantron-card-${post.id}`} data-post-id={post.id}>
        <h3>{post.title}</h3>
        <p>{post.excerpt}</p>
      </div>
    );
  };
});

// Mock the CSS import
jest.mock('../styles/SwantronList.css', () => ({}));

const { swantronService } = require('../services/swantronService');

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
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
      link: 'https://swantron.com/post/1'
    },
    {
      id: 2,
      title: 'Second Post',
      excerpt: 'Second post excerpt',
      date: '2023-12-26T10:00:00Z',
      featuredImage: 'https://example.com/image2.jpg',
      categories: [{ id: 2, name: 'Life' }],
      link: 'https://swantron.com/post/2'
    }
  ];

  const mockPostsResponse = {
    posts: mockPosts,
    totalPages: 3
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
    swantronService.getPosts.mockImplementation(() => new Promise(() => {}));
    
    renderWithRouter(<SwantronList />);
    
    expect(screen.getByLabelText('Loading posts')).toBeInTheDocument();
  });



  test('renders SEO component with correct props', async () => {
    swantronService.getPosts.mockResolvedValue(mockPostsResponse);
    
    renderWithRouter(<SwantronList />);
    
    await waitFor(() => {
      expect(screen.getByTestId('seo-component')).toBeInTheDocument();
    });
    
    const seoComponent = screen.getByTestId('seo-component');
    expect(seoComponent).toHaveAttribute('data-title', 'Swantron Posts - Personal Blog | Tron Swan');
    expect(seoComponent).toHaveAttribute('data-description', 'Explore personal posts and thoughts from Joseph Swanson\'s blog at swantron.com. Tech insights, life updates, and random musings from a software engineer.');
    expect(seoComponent).toHaveAttribute('data-keywords', 'swantron, Joseph Swanson, blog posts, software engineering, personal blog, tech insights');
    expect(seoComponent).toHaveAttribute('data-url', '/swantron');
  });

  test('renders search form', async () => {
    swantronService.getPosts.mockResolvedValue(mockPostsResponse);
    
    renderWithRouter(<SwantronList />);
    
    await waitFor(() => {
      expect(screen.getByTestId('swantron-list')).toBeInTheDocument();
    });
    
    expect(screen.getByPlaceholderText('Search posts...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
  });

  test('handles search functionality', async () => {
    swantronService.getPosts.mockResolvedValue(mockPostsResponse);
    swantronService.searchPosts.mockResolvedValue({
      posts: [mockPosts[0]],
      totalPages: 1
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
      expect(swantronService.searchPosts).toHaveBeenCalledWith('test query', 1);
    });
  });













  test('renders error state when API call fails', async () => {
    swantronService.getPosts.mockRejectedValue(new Error('API Error'));
    
    renderWithRouter(<SwantronList />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load posts from swantron.com. Please try again later.')).toBeInTheDocument();
    });
  });





  test('calls getPosts on initial load', async () => {
    swantronService.getPosts.mockResolvedValue(mockPostsResponse);
    
    renderWithRouter(<SwantronList />);
    
    await waitFor(() => {
      expect(swantronService.getPosts).toHaveBeenCalledWith(1);
    });
  });

  test('calls searchPosts when search query is provided', async () => {
    swantronService.getPosts.mockResolvedValue(mockPostsResponse);
    swantronService.searchPosts.mockResolvedValue({
      posts: [mockPosts[0]],
      totalPages: 1
    });
    
    renderWithRouter(<SwantronList />);
    
    await waitFor(() => {
      expect(screen.getByTestId('swantron-list')).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText('Search posts...');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    await waitFor(() => {
      expect(swantronService.searchPosts).toHaveBeenCalledWith('test', 1);
    });
  });

  test('handles search with empty query', async () => {
    swantronService.getPosts.mockResolvedValue(mockPostsResponse);
    
    renderWithRouter(<SwantronList />);
    
    await waitFor(() => {
      expect(screen.getByTestId('swantron-list')).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText('Search posts...');
    fireEvent.change(searchInput, { target: { value: '' } });
    
    await waitFor(() => {
      expect(swantronService.getPosts).toHaveBeenCalledWith(1);
    });
  });

  test('handles search with special characters', async () => {
    swantronService.getPosts.mockResolvedValue(mockPostsResponse);
    swantronService.searchPosts.mockResolvedValue({
      posts: [mockPosts[0]],
      totalPages: 1
    });
    
    renderWithRouter(<SwantronList />);
    
    await waitFor(() => {
      expect(screen.getByTestId('swantron-list')).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText('Search posts...');
    fireEvent.change(searchInput, { target: { value: 'test & query with special chars!' } });
    
    await waitFor(() => {
      expect(swantronService.searchPosts).toHaveBeenCalledWith('test & query with special chars!', 1);
    });
  });

  test('handles search with very long query', async () => {
    swantronService.getPosts.mockResolvedValue(mockPostsResponse);
    swantronService.searchPosts.mockResolvedValue({
      posts: [mockPosts[0]],
      totalPages: 1
    });
    
    renderWithRouter(<SwantronList />);
    
    await waitFor(() => {
      expect(screen.getByTestId('swantron-list')).toBeInTheDocument();
    });
    
    const longQuery = 'a'.repeat(1000);
    const searchInput = screen.getByPlaceholderText('Search posts...');
    fireEvent.change(searchInput, { target: { value: longQuery } });
    
    await waitFor(() => {
      expect(swantronService.searchPosts).toHaveBeenCalledWith(longQuery, 1);
    });
  });

  test('logs error to console when API call fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const apiError = new Error('Network error');
    swantronService.getPosts.mockRejectedValue(apiError);
    
    renderWithRouter(<SwantronList />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load posts from swantron.com. Please try again later.')).toBeInTheDocument();
    });
    
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching swantron posts:', apiError);
    consoleErrorSpy.mockRestore();
  });






});
