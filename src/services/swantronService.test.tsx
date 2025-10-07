import {
  vi,
  expect,
  describe,
  test,
  beforeAll,
  afterAll,
  beforeEach,
} from 'vitest';
import '@testing-library/jest-dom';

// Mock logger before importing the service
vi.mock('../utils/logger', () => ({
  logger: {
    apiError: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

import { logger } from '../utils/logger';

import { swantronService } from './swantronService';

// Mock fetch globally
global.fetch = vi.fn();

// Console mocking no longer needed since we use logger

describe('swantronService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment variable
    delete process.env.REACT_APP_SWANTRON_API_URL;
  });

  describe('getPosts', () => {
    const mockPostsResponse = [
      {
        id: 1,
        title: { rendered: 'Test Post 1' },
        excerpt: { rendered: 'Test excerpt 1' },
        content: { rendered: 'Test content 1' },
        date: '2023-12-25T10:00:00Z',
        _embedded: {
          'wp:featuredmedia': [
            { source_url: 'https://example.com/image1.jpg' },
          ],
          'wp:term': [
            [{ id: 1, name: 'Category 1' }],
            [{ id: 1, name: 'Tag 1' }],
          ],
        },
        link: 'https://swantron.com/post/1',
      },
      {
        id: 2,
        title: { rendered: 'Test Post 2' },
        excerpt: { rendered: 'Test excerpt 2' },
        content: { rendered: 'Test content 2' },
        date: '2023-12-26T10:00:00Z',
        _embedded: {
          'wp:featuredmedia': [],
          'wp:term': [[], []],
        },
        link: 'https://swantron.com/post/2',
      },
    ];

    test('should fetch posts successfully with default parameters', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockPostsResponse),
        headers: {
          get: vi.fn().mockReturnValue('5'),
        },
      };

      global.fetch.mockResolvedValue(mockResponse);

      const result = await swantronService.getPosts();

      expect(fetch).toHaveBeenCalledWith(
        'https://swantron.com/wp-json/wp/v2/posts?_embed&page=1&per_page=10'
      );
      expect(result.posts).toHaveLength(2);
      expect(result.totalPages).toBe(5);
      expect(result.posts[0]).toEqual({
        id: 1,
        title: 'Test Post 1',
        excerpt: 'Test excerpt 1',
        content: 'Test content 1',
        date: '2023-12-25T10:00:00Z',
        featuredImage: 'https://example.com/image1.jpg',
        categories: [{ id: 1, name: 'Category 1' }],
        tags: [{ id: 1, name: 'Tag 1' }],
        link: 'https://swantron.com/post/1',
      });
    });

    test('should fetch posts with custom page and perPage parameters', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockPostsResponse),
        headers: {
          get: vi.fn().mockReturnValue('3'),
        },
      };

      global.fetch.mockResolvedValue(mockResponse);

      const result = await swantronService.getPosts(2, 5);

      expect(fetch).toHaveBeenCalledWith(
        'https://swantron.com/wp-json/wp/v2/posts?_embed&page=2&per_page=5'
      );
      expect(result.totalPages).toBe(3);
    });

    test('should handle HTTP error responses', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
      };

      global.fetch.mockResolvedValue(mockResponse);

      await expect(swantronService.getPosts()).rejects.toThrow(
        'HTTP 404: Not Found'
      );
    });

    test('should handle invalid response format', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue('not-an-array'),
        headers: {
          get: vi.fn().mockReturnValue('1'),
        },
      };

      global.fetch.mockResolvedValue(mockResponse);

      await expect(swantronService.getPosts()).rejects.toThrow(
        'Invalid response format from swantron.com API'
      );
    });

    test('should handle missing total pages header', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockPostsResponse),
        headers: {
          get: vi.fn().mockReturnValue(null),
        },
      };

      global.fetch.mockResolvedValue(mockResponse);

      const result = await swantronService.getPosts();

      expect(result.totalPages).toBe(1);
    });

    test('should handle posts without embedded media or terms', async () => {
      const postsWithoutEmbedded = [
        {
          id: 3,
          title: { rendered: 'Post without embedded' },
          excerpt: { rendered: 'No embedded content' },
          content: { rendered: 'Content here' },
          date: '2023-12-27T10:00:00Z',
          _embedded: {},
          link: 'https://swantron.com/post/3',
        },
      ];

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(postsWithoutEmbedded),
        headers: {
          get: vi.fn().mockReturnValue('1'),
        },
      };

      global.fetch.mockResolvedValue(mockResponse);

      const result = await swantronService.getPosts();

      expect(result.posts[0].featuredImage).toBeNull();
      expect(result.posts[0].categories).toEqual([]);
      expect(result.posts[0].tags).toEqual([]);
    });

    test('should extract image from content when no featured image is set', async () => {
      const postsWithContentImage = [
        {
          id: 4,
          title: { rendered: 'Post with content image' },
          excerpt: { rendered: 'Has image in content' },
          content: {
            rendered:
              '<p>Some text here</p><img src="https://example.com/content-image.jpg" alt="Content image" /><p>More text</p>',
          },
          date: '2023-12-27T10:00:00Z',
          _embedded: {},
          link: 'https://swantron.com/post/4',
        },
      ];

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(postsWithContentImage),
        headers: {
          get: vi.fn().mockReturnValue('1'),
        },
      };

      global.fetch.mockResolvedValue(mockResponse);

      const result = await swantronService.getPosts();

      expect(result.posts[0].featuredImage).toBe(
        'https://example.com/content-image.jpg'
      );
      expect(result.posts[0].categories).toEqual([]);
      expect(result.posts[0].tags).toEqual([]);
    });

    test('should handle network errors', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));

      await expect(swantronService.getPosts()).rejects.toThrow('Network error');
    });
  });

  describe('getPostById', () => {
    const mockPostResponse = {
      id: 1,
      title: { rendered: 'Single Post' },
      excerpt: { rendered: 'Single excerpt' },
      content: { rendered: 'Single content' },
      date: '2023-12-25T10:00:00Z',
      _embedded: {
        'wp:featuredmedia': [{ source_url: 'https://example.com/image.jpg' }],
        'wp:term': [[{ id: 1, name: 'Category' }], [{ id: 1, name: 'Tag' }]],
      },
      link: 'https://swantron.com/post/1',
    };

    test('should fetch single post successfully', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockPostResponse),
      };

      global.fetch.mockResolvedValue(mockResponse);

      const result = await swantronService.getPostById(1);

      expect(fetch).toHaveBeenCalledWith(
        'https://swantron.com/wp-json/wp/v2/posts/1?_embed'
      );
      expect(result.id).toBe(1);
      expect(result.title).toBe('Single Post');
      expect(result.featuredImage).toBe('https://example.com/image.jpg');
    });

    test('should handle HTTP error responses for single post', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      };

      global.fetch.mockResolvedValue(mockResponse);

      await expect(swantronService.getPostById(1)).rejects.toThrow(
        'HTTP 500: Internal Server Error'
      );
    });

    test('should handle network errors for single post', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));

      await expect(swantronService.getPostById(1)).rejects.toThrow(
        'Network error'
      );
    });
  });

  describe('searchPosts', () => {
    const mockSearchResponse = [
      {
        id: 1,
        title: { rendered: 'Search Result' },
        excerpt: { rendered: 'Search excerpt' },
        content: { rendered: 'Search content' },
        date: '2023-12-25T10:00:00Z',
        _embedded: {
          'wp:featuredmedia': [
            { source_url: 'https://example.com/search-image.jpg' },
          ],
          'wp:term': [
            [{ id: 1, name: 'Search Category' }],
            [{ id: 1, name: 'Search Tag' }],
          ],
        },
        link: 'https://swantron.com/search-result',
      },
    ];

    test('should search posts successfully', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockSearchResponse),
        headers: {
          get: vi.fn().mockReturnValue('2'),
        },
      };

      global.fetch.mockResolvedValue(mockResponse);

      const result = await swantronService.searchPosts('test query');

      expect(fetch).toHaveBeenCalledWith(
        'https://swantron.com/wp-json/wp/v2/posts?search=test%20query&_embed&page=1&per_page=10'
      );
      expect(result.posts).toHaveLength(1);
      expect(result.posts[0].title).toBe('Search Result');
    });

    test('should search posts with custom parameters', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockSearchResponse),
        headers: {
          get: vi.fn().mockReturnValue('1'),
        },
      };

      global.fetch.mockResolvedValue(mockResponse);

      const result = await swantronService.searchPosts('query', 3, 20);

      expect(fetch).toHaveBeenCalledWith(
        'https://swantron.com/wp-json/wp/v2/posts?search=query&_embed&page=3&per_page=20'
      );
    });

    test('should handle special characters in search query', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue([]),
        headers: {
          get: vi.fn().mockReturnValue('1'),
        },
      };

      global.fetch.mockResolvedValue(mockResponse);

      await swantronService.searchPosts('test & query with special chars!');

      expect(fetch).toHaveBeenCalledWith(
        'https://swantron.com/wp-json/wp/v2/posts?search=test%20%26%20query%20with%20special%20chars!&_embed&page=1&per_page=10'
      );
    });

    test('should handle empty search results', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue([]),
        headers: {
          get: vi.fn().mockReturnValue('1'),
        },
      };

      global.fetch.mockResolvedValue(mockResponse);

      const result = await swantronService.searchPosts('nonexistent');

      expect(result.posts).toHaveLength(0);
      expect(result.totalPages).toBe(1);
    });

    test('should handle HTTP error responses for search', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      };

      global.fetch.mockResolvedValue(mockResponse);

      await expect(swantronService.searchPosts('query')).rejects.toThrow(
        'HTTP 400: Bad Request'
      );
    });

    test('should handle invalid response format for search', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue('not-an-array'),
        headers: {
          get: vi.fn().mockReturnValue('1'),
        },
      };

      global.fetch.mockResolvedValue(mockResponse);

      await expect(swantronService.searchPosts('query')).rejects.toThrow(
        'Invalid response format from swantron.com API'
      );
    });
  });
});
