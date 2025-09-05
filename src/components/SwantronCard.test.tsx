import { vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SwantronCard from './SwantronCard';

// Mock the useDateFormatter hook
vi.mock('../hooks/useDateFormatter', () => ({
  useDateFormatter: () => vi.fn((date) => `Formatted: ${date}`)
}));

// Mock the CSS import
vi.mock('../styles/SwantronCard.css', () => ({}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('SwantronCard Component', () => {
  const mockPost = {
    id: 1,
    title: 'Test Post Title',
    excerpt: '<p>This is a test post excerpt with <strong>HTML</strong> content.</p>',
    date: '2023-12-25T10:00:00Z',
    featuredImage: 'https://example.com/image.jpg',
    categories: [
      { id: 1, name: 'Technology' },
      { id: 2, name: 'Life' }
    ],
    link: 'https://swantron.com/post/1'
  };

  test('renders swantron card with all elements', () => {
    renderWithRouter(<SwantronCard post={mockPost} />);
    
    expect(screen.getByTestId('swantron-card')).toBeInTheDocument();
    expect(screen.getByText('Test Post Title')).toBeInTheDocument();
    expect(screen.getByText(/This is a test post excerpt with/)).toBeInTheDocument();
    expect(screen.getByText('Formatted: 2023-12-25T10:00:00Z')).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('Life')).toBeInTheDocument();
    expect(screen.getByText('📖 Read on swantron.com')).toBeInTheDocument();
  });

  test('renders featured image when available', () => {
    renderWithRouter(<SwantronCard post={mockPost} />);
    
    const image = screen.getByAltText('Test Post Title');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
    expect(image).toHaveAttribute('loading', 'lazy');
  });

  test('does not render image when featuredImage is not available', () => {
    const postWithoutImage = { ...mockPost, featuredImage: null };
    renderWithRouter(<SwantronCard post={postWithoutImage} />);
    
    expect(screen.queryByAltText('Test Post Title')).not.toBeInTheDocument();
  });

  test('renders post without categories when none are available', () => {
    const postWithoutCategories = { ...mockPost, categories: [] };
    renderWithRouter(<SwantronCard post={postWithoutCategories} />);
    
    expect(screen.queryByText('Technology')).not.toBeInTheDocument();
    expect(screen.queryByText('Life')).not.toBeInTheDocument();
  });

  test('renders post with single category', () => {
    const postWithSingleCategory = { ...mockPost, categories: [{ id: 1, name: 'Single Category' }] };
    renderWithRouter(<SwantronCard post={postWithSingleCategory} />);
    
    expect(screen.getByText('Single Category')).toBeInTheDocument();
    expect(screen.queryByText('Technology')).not.toBeInTheDocument();
  });

  test('renders HTML content in excerpt correctly', () => {
    const postWithComplexHTML = {
      ...mockPost,
      excerpt: '<h3>Complex HTML</h3><p>Paragraph with <em>emphasis</em> and <code>code</code>.</p>'
    };
    renderWithRouter(<SwantronCard post={postWithComplexHTML} />);
    
    expect(screen.getByText('Complex HTML')).toBeInTheDocument();
    expect(screen.getByText(/Paragraph with/)).toBeInTheDocument();
  });

  test('renders external link with correct attributes', () => {
    renderWithRouter(<SwantronCard post={mockPost} />);
    
    const externalLink = screen.getByText('📖 Read on swantron.com').closest('a');
    expect(externalLink).toHaveAttribute('href', 'https://swantron.com/post/1');
    expect(externalLink).toHaveAttribute('target', '_blank');
    expect(externalLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(externalLink).toHaveClass('swantron-external-link');
  });

  test('renders card link with correct route', () => {
    renderWithRouter(<SwantronCard post={mockPost} />);
    
    const cardLink = screen.getByText('Test Post Title').closest('a');
    expect(cardLink).toHaveAttribute('href', '/swantron/1');
    expect(cardLink).toHaveClass('swantron-card-link');
  });

  test('handles post with minimal data', () => {
    const minimalPost = {
      id: 2,
      title: 'Minimal Post',
      excerpt: 'Minimal excerpt',
      date: '2023-12-26T10:00:00Z',
      featuredImage: null,
      categories: [],
      link: 'https://swantron.com/post/2'
    };
    renderWithRouter(<SwantronCard post={minimalPost} />);
    
    expect(screen.getByText('Minimal Post')).toBeInTheDocument();
    expect(screen.getByText('Minimal excerpt')).toBeInTheDocument();
    expect(screen.getByText('Formatted: 2023-12-26T10:00:00Z')).toBeInTheDocument();
    expect(screen.queryByAltText('Minimal Post')).not.toBeInTheDocument();
    expect(screen.queryByText('Technology')).not.toBeInTheDocument();
  });

  test('handles post with very long title', () => {
    const longTitle = 'A'.repeat(200);
    const postWithLongTitle = { ...mockPost, title: longTitle };
    renderWithRouter(<SwantronCard post={postWithLongTitle} />);
    
    expect(screen.getByText(longTitle)).toBeInTheDocument();
  });

  test('handles post with very long excerpt', () => {
    const longExcerpt = '<p>' + 'B'.repeat(500) + '</p>';
    const postWithLongExcerpt = { ...mockPost, excerpt: longExcerpt };
    renderWithRouter(<SwantronCard post={postWithLongExcerpt} />);
    
    expect(screen.getByText('B'.repeat(500))).toBeInTheDocument();
  });

  test('handles post with special characters in title', () => {
    const specialTitle = 'Post with special chars: & < > " \' é ñ';
    const postWithSpecialTitle = { ...mockPost, title: specialTitle };
    renderWithRouter(<SwantronCard post={postWithSpecialTitle} />);
    
    expect(screen.getByText('Post with special chars: & < > " \' é ñ')).toBeInTheDocument();
  });

  test('handles post with special characters in excerpt', () => {
    const specialExcerpt = '<p>Excerpt with &amp; &lt; &gt; &quot; &#39; é ñ</p>';
    const postWithSpecialExcerpt = { ...mockPost, excerpt: specialExcerpt };
    renderWithRouter(<SwantronCard post={postWithSpecialExcerpt} />);
    
    expect(screen.getByText('Excerpt with & < > " \' é ñ')).toBeInTheDocument();
  });

  test('handles post with empty excerpt', () => {
    const postWithEmptyExcerpt = { ...mockPost, excerpt: '' };
    renderWithRouter(<SwantronCard post={postWithEmptyExcerpt} />);
    
    expect(screen.getByTestId('swantron-card')).toBeInTheDocument();
    expect(screen.getByText('Test Post Title')).toBeInTheDocument();
  });

  test('handles post with null excerpt', () => {
    const postWithNullExcerpt = { ...mockPost, excerpt: null };
    renderWithRouter(<SwantronCard post={postWithNullExcerpt} />);
    
    expect(screen.getByTestId('swantron-card')).toBeInTheDocument();
    expect(screen.getByText('Test Post Title')).toBeInTheDocument();
  });

  test('handles post with undefined excerpt', () => {
    const postWithUndefinedExcerpt = { ...mockPost, excerpt: undefined };
    renderWithRouter(<SwantronCard post={postWithUndefinedExcerpt} />);
    
    expect(screen.getByTestId('swantron-card')).toBeInTheDocument();
    expect(screen.getByText('Test Post Title')).toBeInTheDocument();
  });

  test('handles post with very long category names', () => {
    const longCategoryName = 'A'.repeat(100);
    const postWithLongCategory = {
      ...mockPost,
      categories: [{ id: 1, name: longCategoryName }]
    };
    renderWithRouter(<SwantronCard post={postWithLongCategory} />);
    
    expect(screen.getByText(longCategoryName)).toBeInTheDocument();
  });

  test('handles post with numeric category names', () => {
    const postWithNumericCategory = {
      ...mockPost,
      categories: [{ id: 1, name: '123' }]
    };
    renderWithRouter(<SwantronCard post={postWithNumericCategory} />);
    
    expect(screen.getByText('123')).toBeInTheDocument();
  });

  test('handles post with emoji in title', () => {
    const emojiTitle = '🚀 Emoji Post Title 🎉';
    const postWithEmojiTitle = { ...mockPost, title: emojiTitle };
    renderWithRouter(<SwantronCard post={postWithEmojiTitle} />);
    
    expect(screen.getByText('🚀 Emoji Post Title 🎉')).toBeInTheDocument();
  });

  test('handles post with emoji in excerpt', () => {
    const emojiExcerpt = '<p>Excerpt with 🚀 emojis 🎉 and <strong>HTML</strong>!</p>';
    const postWithEmojiExcerpt = { ...mockPost, excerpt: emojiExcerpt };
    renderWithRouter(<SwantronCard post={postWithEmojiExcerpt} />);
    
    expect(screen.getByText(/Excerpt with 🚀 emojis/)).toBeInTheDocument();
  });
});
