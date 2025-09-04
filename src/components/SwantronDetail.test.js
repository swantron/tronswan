import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SwantronDetail from './SwantronDetail';

// Mock the swantronService
jest.mock('../services/swantronService', () => ({
  swantronService: {
    getPostById: jest.fn()
  }
}));

// Mock the useDateFormatter hook
jest.mock('../hooks/useDateFormatter', () => ({
  useDateFormatter: () => jest.fn((date) => `Formatted: ${date}`)
}));

// Mock the SEO component
jest.mock('./SEO', () => {
  return function MockSEO({ title, description, keywords, url, image }) {
    return (
      <div data-testid="seo-component" data-title={title} data-description={description} data-keywords={keywords} data-url={url} data-image={image}>
        SEO Component
      </div>
    );
  };
});

// Mock the CSS import
jest.mock('../styles/SwantronDetail.css', () => ({}));

const { swantronService } = require('../services/swantronService');

// Wrapper component to provide router context
const renderWithRouter = (component, { route = '/swantron/1' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  
  return render(
    <BrowserRouter>
      <Routes>
        <Route path="/swantron/:id" element={component} />
      </Routes>
    </BrowserRouter>
  );
};

describe('SwantronDetail Component', () => {
  const mockPost = {
    id: 1,
    title: 'Test Post Title',
    excerpt: '<p>This is a test post excerpt with <strong>HTML</strong> content.</p>',
    content: '<h2>Post Content</h2><p>This is the main post content with <em>emphasis</em>.</p>',
    date: '2023-12-25T10:00:00Z',
    featuredImage: 'https://example.com/image.jpg',
    categories: [
      { id: 1, name: 'Technology' },
      { id: 2, name: 'Life' }
    ],
    tags: [
      { id: 1, name: 'Software' },
      { id: 2, name: 'Personal' }
    ],
    link: 'https://swantron.com/post/1'
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
    swantronService.getPostById.mockImplementation(() => new Promise(() => {}));
    
    renderWithRouter(<SwantronDetail />);
    
    expect(screen.getByTestId('swantron-detail-loading')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading post')).toBeInTheDocument();
  });

  test('renders post details when data is loaded successfully', async () => {
    swantronService.getPostById.mockResolvedValue(mockPost);
    
    renderWithRouter(<SwantronDetail />);
    
    await waitFor(() => {
      expect(screen.getByTestId('swantron-detail')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Test Post Title')).toBeInTheDocument();
    expect(screen.getByText('Formatted: 2023-12-25T10:00:00Z')).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('Life')).toBeInTheDocument();
    expect(screen.getByText('Post Content')).toBeInTheDocument();
    expect(screen.getByText(/This is the main post content with/)).toBeInTheDocument();
    expect(screen.getByText('#Software')).toBeInTheDocument();
    expect(screen.getByText('#Personal')).toBeInTheDocument();
  });

  test('renders SEO component with correct props', async () => {
    swantronService.getPostById.mockResolvedValue(mockPost);
    
    renderWithRouter(<SwantronDetail />);
    
    await waitFor(() => {
      expect(screen.getByTestId('seo-component')).toBeInTheDocument();
    });
    
    const seoComponent = screen.getByTestId('seo-component');
    expect(seoComponent).toHaveAttribute('data-title', 'Test Post Title - Swantron | Tron Swan');
    expect(seoComponent).toHaveAttribute('data-description', 'This is a test post excerpt with HTML content.');
    expect(seoComponent).toHaveAttribute('data-keywords', 'swantron, Joseph Swanson, Test Post Title, blog post');
    expect(seoComponent).toHaveAttribute('data-url', '/swantron/1');
    expect(seoComponent).toHaveAttribute('data-image', 'https://example.com/image.jpg');
  });

  test('renders post image when featuredImage is available', async () => {
    swantronService.getPostById.mockResolvedValue(mockPost);
    
    renderWithRouter(<SwantronDetail />);
    
    await waitFor(() => {
      expect(screen.getByTestId('swantron-detail')).toBeInTheDocument();
    });
    
    const image = screen.getByAltText('Test Post Title');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
    expect(image).toHaveAttribute('loading', 'lazy');
  });

  test('does not render image when featuredImage is not available', async () => {
    const postWithoutImage = { ...mockPost, featuredImage: null };
    swantronService.getPostById.mockResolvedValue(postWithoutImage);
    
    renderWithRouter(<SwantronDetail />);
    
    await waitFor(() => {
      expect(screen.getByTestId('swantron-detail')).toBeInTheDocument();
    });
    
    expect(screen.queryByAltText('Test Post Title')).not.toBeInTheDocument();
  });

  test('renders post without categories when none are available', async () => {
    const postWithoutCategories = { ...mockPost, categories: [] };
    swantronService.getPostById.mockResolvedValue(postWithoutCategories);
    
    renderWithRouter(<SwantronDetail />);
    
    await waitFor(() => {
      expect(screen.getByTestId('swantron-detail')).toBeInTheDocument();
    });
    
    expect(screen.queryByText('Technology')).not.toBeInTheDocument();
    expect(screen.queryByText('Life')).not.toBeInTheDocument();
  });

  test('renders post without tags when none are available', async () => {
    const postWithoutTags = { ...mockPost, tags: [] };
    swantronService.getPostById.mockResolvedValue(postWithoutTags);
    
    renderWithRouter(<SwantronDetail />);
    
    await waitFor(() => {
      expect(screen.getByTestId('swantron-detail')).toBeInTheDocument();
    });
    
    expect(screen.queryByText('#Software')).not.toBeInTheDocument();
    expect(screen.queryByText('#Personal')).not.toBeInTheDocument();
  });

  test('renders external link with correct attributes', async () => {
    swantronService.getPostById.mockResolvedValue(mockPost);
    
    renderWithRouter(<SwantronDetail />);
    
    await waitFor(() => {
      expect(screen.getByTestId('swantron-detail')).toBeInTheDocument();
    });
    
    const externalLink = screen.getByText('📖 Read original on swantron.com');
    expect(externalLink).toHaveAttribute('href', 'https://swantron.com/post/1');
    expect(externalLink).toHaveAttribute('target', '_blank');
    expect(externalLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(externalLink).toHaveClass('swantron-external-button');
  });

  test('renders error state when API call fails', async () => {
    swantronService.getPostById.mockRejectedValue(new Error('API Error'));
    
    renderWithRouter(<SwantronDetail />);
    
    await waitFor(() => {
      expect(screen.getByTestId('swantron-detail-error')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Failed to load post from swantron.com. Please try again later.')).toBeInTheDocument();
  });

  test('renders not found state when post is null', async () => {
    swantronService.getPostById.mockResolvedValue(null);
    
    renderWithRouter(<SwantronDetail />);
    
    await waitFor(() => {
      expect(screen.getByTestId('swantron-detail-not-found')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Post not found.')).toBeInTheDocument();
  });

  test('calls swantronService with correct ID from URL params', async () => {
    swantronService.getPostById.mockResolvedValue(mockPost);
    
    renderWithRouter(<SwantronDetail />, { route: '/swantron/123' });
    
    await waitFor(() => {
      expect(swantronService.getPostById).toHaveBeenCalledWith(123);
    });
  });

  test('handles HTML content in post body correctly', async () => {
    const postWithComplexHTML = {
      ...mockPost,
      content: '<h2>Complex Content</h2><ul><li>List item 1</li><li>List item 2</li></ul><blockquote>Quote here</blockquote>'
    };
    swantronService.getPostById.mockResolvedValue(postWithComplexHTML);
    
    renderWithRouter(<SwantronDetail />);
    
    await waitFor(() => {
      expect(screen.getByTestId('swantron-detail')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Complex Content')).toBeInTheDocument();
    expect(screen.getByText('List item 1')).toBeInTheDocument();
    expect(screen.getByText('List item 2')).toBeInTheDocument();
    expect(screen.getByText('Quote here')).toBeInTheDocument();
  });

  test('handles post with only required fields', async () => {
    const minimalPost = {
      id: 2,
      title: 'Minimal Post',
      excerpt: 'Minimal excerpt',
      content: 'Minimal content',
      date: '2023-12-26T10:00:00Z',
      featuredImage: null,
      categories: [],
      tags: [],
      link: 'https://swantron.com/post/2'
    };
    swantronService.getPostById.mockResolvedValue(minimalPost);
    
    renderWithRouter(<SwantronDetail />, { route: '/swantron/2' });
    
    await waitFor(() => {
      expect(screen.getByTestId('swantron-detail')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Minimal Post')).toBeInTheDocument();
    expect(screen.getByText('Minimal content')).toBeInTheDocument();
    expect(screen.getByText('Formatted: 2023-12-26T10:00:00Z')).toBeInTheDocument();
    expect(screen.queryByAltText('Minimal Post')).not.toBeInTheDocument();
  });

  test('logs error to console when API call fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const apiError = new Error('Network error');
    swantronService.getPostById.mockRejectedValue(apiError);
    
    renderWithRouter(<SwantronDetail />);
    
    await waitFor(() => {
      expect(screen.getByTestId('swantron-detail-error')).toBeInTheDocument();
    });
    
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching swantron post:', apiError);
    consoleErrorSpy.mockRestore();
  });

  test('handles post with very long title', async () => {
    const longTitle = 'A'.repeat(300);
    const postWithLongTitle = { ...mockPost, title: longTitle };
    swantronService.getPostById.mockResolvedValue(postWithLongTitle);
    
    renderWithRouter(<SwantronDetail />);
    
    await waitFor(() => {
      expect(screen.getByTestId('swantron-detail')).toBeInTheDocument();
    });
    
    expect(screen.getByText(longTitle)).toBeInTheDocument();
  });

  test('handles post with very long content', async () => {
    const longContent = '<p>' + 'B'.repeat(1000) + '</p>';
    const postWithLongContent = { ...mockPost, content: longContent };
    swantronService.getPostById.mockResolvedValue(postWithLongContent);
    
    renderWithRouter(<SwantronDetail />);
    
    await waitFor(() => {
      expect(screen.getByTestId('swantron-detail')).toBeInTheDocument();
    });
    
    expect(screen.getByText('B'.repeat(1000))).toBeInTheDocument();
  });

  test('handles post with special characters in title', async () => {
    const specialTitle = 'Post with special chars: & < > " \' é ñ 🚀';
    const postWithSpecialTitle = { ...mockPost, title: specialTitle };
    swantronService.getPostById.mockResolvedValue(postWithSpecialTitle);
    
    renderWithRouter(<SwantronDetail />);
    
    await waitFor(() => {
      expect(screen.getByTestId('swantron-detail')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Post with special chars: & < > " \' é ñ 🚀')).toBeInTheDocument();
  });

  test('handles post with special characters in content', async () => {
    const specialContent = '<p>Content with &amp; &lt; &gt; &quot; &#39; é ñ 🚀</p>';
    const postWithSpecialContent = { ...mockPost, content: specialContent };
    swantronService.getPostById.mockResolvedValue(postWithSpecialContent);
    
    renderWithRouter(<SwantronDetail />);
    
    await waitFor(() => {
      expect(screen.getByTestId('swantron-detail')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Content with & < > " \' é ñ 🚀')).toBeInTheDocument();
  });

  test('handles post with empty content', async () => {
    const postWithEmptyContent = { ...mockPost, content: '' };
    swantronService.getPostById.mockResolvedValue(postWithEmptyContent);
    
    renderWithRouter(<SwantronDetail />);
    
    await waitFor(() => {
      expect(screen.getByTestId('swantron-detail')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Test Post Title')).toBeInTheDocument();
  });

  test('handles post with null content', async () => {
    const postWithNullContent = { ...mockPost, content: null };
    swantronService.getPostById.mockResolvedValue(postWithNullContent);
    
    renderWithRouter(<SwantronDetail />);
    
    await waitFor(() => {
      expect(screen.getByTestId('swantron-detail')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Test Post Title')).toBeInTheDocument();
  });
});
