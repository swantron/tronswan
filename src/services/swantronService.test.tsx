import {
  vi,
  expect,
  describe,
  test,
  beforeEach,
  afterEach,
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

// Mock runtimeConfig before importing the service
vi.mock('../utils/runtimeConfig', () => ({
  runtimeConfig: {
    getWithDefault: vi.fn((key: string, defaultValue: string) => {
      if (key === 'VITE_SWANTRON_API_URL') {
        return process.env.VITE_SWANTRON_API_URL || defaultValue;
      }
      return defaultValue;
    }),
    isInitialized: vi.fn(() => true),
  },
}));

import { logger } from '../utils/logger';

// Import service after mocks are set up
let swantronService: typeof import('./swantronService').swantronService;

// Mock fetch globally
global.fetch = vi.fn();

describe('swantronService', () => {
  beforeEach(async () => {
    // Reset modules to clear module-level cache
    vi.resetModules();
    vi.clearAllMocks();
    // Reset environment variable
    delete process.env.VITE_SWANTRON_API_URL;
    // Use fake timers to control cache expiration
    vi.useFakeTimers({ now: 0 });
    // Re-import service after resetting modules
    const serviceModule = await import('./swantronService');
    swantronService = serviceModule.swantronService;
  });

  afterEach(() => {
    vi.useRealTimers();
    // Clear fetch mocks
    vi.clearAllMocks();
  });

  describe('getPosts', () => {
    const mockAllPosts: Array<{
      id: number;
      slug: string;
      title: string;
      excerpt: string;
      content: string;
      date: string;
      permalink: string;
      link: string;
      featuredImage: string | null;
      categories: Array<{ id: number; name: string; slug: string; link: string }>;
      tags: Array<{ id: number; name: string; slug: string; link: string }>;
    }> = [
      {
        id: 2,
        slug: 'test-post-2',
        title: 'Test Post 2',
        excerpt: 'Test excerpt 2',
        content: 'Test content 2',
        date: '2023-12-26T10:00:00Z',
        permalink: '/index.php/2023/12/26/test-post-2/',
        link: '/index.php/2023/12/26/test-post-2/',
        featuredImage: 'https://example.com/image2.jpg',
        categories: [{ id: 1, name: 'Category 2', slug: 'category-2', link: '/categories/category-2/' }],
        tags: [{ id: 1, name: 'Tag 2', slug: 'tag-2', link: '/tags/tag-2/' }],
      },
      {
        id: 1,
        slug: 'test-post-1',
        title: 'Test Post 1',
        excerpt: 'Test excerpt 1',
        content: 'Test content 1',
        date: '2023-12-25T10:00:00Z',
        permalink: '/index.php/2023/12/25/test-post-1/',
        link: '/index.php/2023/12/25/test-post-1/',
        featuredImage: 'https://example.com/image1.jpg',
        categories: [{ id: 1, name: 'Category 1', slug: 'category-1', link: '/categories/category-1/' }],
        tags: [{ id: 1, name: 'Tag 1', slug: 'tag-1', link: '/tags/tag-1/' }],
      },
      {
        id: 3,
        slug: 'test-post-3',
        title: 'Test Post 3',
        excerpt: 'Test excerpt 3',
        content: 'Test content 3',
        date: '2023-12-24T10:00:00Z',
        permalink: '/index.php/2023/12/24/test-post-3/',
        link: '/index.php/2023/12/24/test-post-3/',
        featuredImage: null,
        categories: [],
        tags: [],
      },
    ];

    const mockHugoResponse = {
      posts: mockAllPosts,
      total: 3,
    };

    test('should fetch posts successfully with default parameters', async () => {
      
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockHugoResponse),
      };

      global.fetch.mockResolvedValue(mockResponse);

      const result = await swantronService.getPosts();

      expect(fetch).toHaveBeenCalledWith(
        'https://swantron.github.io/swantron/api/posts/index.json'
      );
      expect(result.posts).toHaveLength(3); // We only have 3 posts total
      expect(result.totalPages).toBe(1); // Math.ceil(3 / 10) = 1
      // Posts should be sorted by date (newest first)
      expect(result.posts[0].id).toBe(2); // Newest
      expect(result.posts[1].id).toBe(1);
      expect(result.posts[2].id).toBe(3); // Oldest
      expect(result.posts[0]).toEqual({
        id: 2,
        title: 'Test Post 2',
        excerpt: 'Test excerpt 2',
        content: 'Test content 2',
        date: '2023-12-26T10:00:00Z',
        featuredImage: 'https://example.com/image2.jpg',
        categories: [{ id: 1, name: 'Category 2', slug: 'category-2', link: '/categories/category-2/' }],
        tags: [{ id: 1, name: 'Tag 2', slug: 'tag-2', link: '/tags/tag-2/' }],
        link: '/index.php/2023/12/26/test-post-2/',
      });
    });

    test('should fetch posts with custom page and perPage parameters', async () => {
      
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockHugoResponse),
      };

      global.fetch.mockResolvedValue(mockResponse);

      const result = await swantronService.getPosts(1, 2);

      expect(fetch).toHaveBeenCalledWith(
        'https://swantron.github.io/swantron/api/posts/index.json'
      );
      expect(result.posts).toHaveLength(2); // perPage = 2
      expect(result.totalPages).toBe(2); // Math.ceil(3 / 2) = 2
      expect(result.posts[0].id).toBe(2); // First page, newest first
      expect(result.posts[1].id).toBe(1);
    });

    test('should handle pagination correctly', async () => {
      
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockHugoResponse),
      };

      global.fetch.mockResolvedValue(mockResponse);

      // Page 2 with perPage 2
      const result = await swantronService.getPosts(2, 2);

      expect(result.posts).toHaveLength(1); // Only 1 post on page 2
      expect(result.totalPages).toBe(2);
      expect(result.posts[0].id).toBe(3); // Oldest post
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
        json: vi.fn().mockResolvedValue({ posts: 'not-an-array' }),
      };

      global.fetch.mockResolvedValue(mockResponse);

      await expect(swantronService.getPosts()).rejects.toThrow(
        'Invalid response format from Hugo API'
      );
    });

    test('should handle posts without featured image', async () => {
      
      const postsWithoutImage = {
        posts: [
          {
            id: 4,
            slug: 'post-without-image',
            title: 'Post without image',
            excerpt: 'No image',
            content: '<p>Content here</p>',
            date: '2023-12-27T10:00:00Z',
            permalink: '/index.php/2023/12/27/post-without-image/',
            link: '/index.php/2023/12/27/post-without-image/',
            featuredImage: null,
            categories: [],
            tags: [],
          },
        ],
        total: 1,
      };

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(postsWithoutImage),
      };

      global.fetch.mockResolvedValue(mockResponse);

      const result = await swantronService.getPosts();

      expect(result.posts[0].featuredImage).toBeNull();
      expect(result.posts[0].categories).toEqual([]);
      expect(result.posts[0].tags).toEqual([]);
    });

    test('should extract image from content when no featured image is set', async () => {
      
      const postsWithContentImage = {
        posts: [
          {
            id: 5,
            slug: 'post-with-content-image',
            title: 'Post with content image',
            excerpt: 'Has image in content',
            content: '<p>Some text here</p><img src="https://example.com/content-image.jpg" alt="Content image" /><p>More text</p>',
            date: '2023-12-27T10:00:00Z',
            permalink: '/index.php/2023/12/27/post-with-content-image/',
            link: '/index.php/2023/12/27/post-with-content-image/',
            featuredImage: null,
            categories: [],
            tags: [],
          },
        ],
        total: 1,
      };

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(postsWithContentImage),
      };

      global.fetch.mockResolvedValue(mockResponse);

      const result = await swantronService.getPosts();

      expect(result.posts[0].featuredImage).toBe(
        'https://example.com/content-image.jpg'
      );
    });

    test('should handle relative featured image URLs', async () => {
      
      const postsWithRelativeImage = {
        posts: [
          {
            id: 6,
            slug: 'post-with-relative-image',
            title: 'Post with relative image',
            excerpt: 'Relative image',
            content: '<p>Content</p>',
            date: '2023-12-27T10:00:00Z',
            permalink: '/index.php/2023/12/27/post-with-relative-image/',
            link: '/index.php/2023/12/27/post-with-relative-image/',
            featuredImage: '/uploads/2023/image.jpg',
            categories: [],
            tags: [],
          },
        ],
        total: 1,
      };

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(postsWithRelativeImage),
      };

      global.fetch.mockResolvedValue(mockResponse);

      const result = await swantronService.getPosts();

      expect(result.posts[0].featuredImage).toBe(
        'https://swantron.github.io/swantron/uploads/2023/image.jpg'
      );
    });

    test('should cache posts for subsequent requests', async () => {
      
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockHugoResponse),
      };

      global.fetch.mockResolvedValue(mockResponse);

      // First call
      const result1 = await swantronService.getPosts();
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(result1.posts).toHaveLength(3);

      // Second call should use cache (within 5 minute window)
      const result2 = await swantronService.getPosts();
      expect(fetch).toHaveBeenCalledTimes(1); // Still only 1 call due to cache
      expect(result2.posts).toHaveLength(3);
      expect(result2.posts[0].id).toBe(result1.posts[0].id);
    });

    test('should handle network errors', async () => {
      
      global.fetch.mockRejectedValue(new Error('Network error'));

      await expect(swantronService.getPosts()).rejects.toThrow('Network error');
    });

    test('should use custom API URL from environment variable', async () => {
      
      process.env.VITE_SWANTRON_API_URL = 'https://custom-api.example.com';

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockHugoResponse),
      };

      global.fetch.mockResolvedValue(mockResponse);

      await swantronService.getPosts();

      expect(fetch).toHaveBeenCalledWith(
        'https://custom-api.example.com/api/posts/index.json'
      );
    });
  });

  describe('getPostById', () => {
    const mockAllPostsForById = {
      posts: [
        {
          id: 1,
          slug: 'single-post',
          title: 'Single Post',
          excerpt: 'Single excerpt',
          content: 'Single content',
          date: '2023-12-25T10:00:00Z',
          permalink: '/index.php/2023/12/25/single-post/',
          link: '/index.php/2023/12/25/single-post/',
          featuredImage: 'https://example.com/image.jpg',
          categories: [{ id: 1, name: 'Category', slug: 'category', link: '/categories/category/' }],
          tags: [{ id: 1, name: 'Tag', slug: 'tag', link: '/tags/tag/' }],
        },
        {
          id: 2,
          slug: 'another-post',
          title: 'Another Post',
          excerpt: 'Another excerpt',
          content: 'Another content',
          date: '2023-12-24T10:00:00Z',
          permalink: '/index.php/2023/12/24/another-post/',
          link: '/index.php/2023/12/24/another-post/',
          featuredImage: null,
          categories: [],
          tags: [],
        },
      ],
      total: 2,
    };

    test('should fetch single post successfully', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockAllPostsForById),
      };

      global.fetch.mockResolvedValue(mockResponse);

      const result = await swantronService.getPostById(1);

      expect(fetch).toHaveBeenCalledWith(
        'https://swantron.github.io/swantron/api/posts/index.json'
      );
      expect(result.id).toBe(1);
      expect(result.title).toBe('Single Post');
      expect(result.featuredImage).toBe('https://example.com/image.jpg');
      expect(result.categories).toEqual([{ id: 1, name: 'Category', slug: 'category', link: '/categories/category/' }]);
      expect(result.tags).toEqual([{ id: 1, name: 'Tag', slug: 'tag', link: '/tags/tag/' }]);
    });

    test('should handle post not found', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockAllPostsForById),
      };

      global.fetch.mockResolvedValue(mockResponse);

      await expect(swantronService.getPostById(999)).rejects.toThrow(
        'Post with id 999 not found'
      );
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
    const mockAllPosts = {
      posts: [
        {
          id: 1,
          slug: 'search-result',
          title: 'Search Result',
          excerpt: 'Search excerpt',
          content: 'Search content with test query',
          date: '2023-12-25T10:00:00Z',
          permalink: '/index.php/2023/12/25/search-result/',
          link: '/index.php/2023/12/25/search-result/',
          featuredImage: 'https://example.com/search-image.jpg',
          categories: [{ id: 1, name: 'Search Category', slug: 'search-category', link: '/categories/search-category/' }],
          tags: [{ id: 1, name: 'Search Tag', slug: 'search-tag', link: '/tags/search-tag/' }],
        },
        {
          id: 2,
          slug: 'another-post',
          title: 'Another Post',
          excerpt: 'Different content',
          content: 'This post does not match',
          date: '2023-12-24T10:00:00Z',
          permalink: '/index.php/2023/12/24/another-post/',
          link: '/index.php/2023/12/24/another-post/',
          featuredImage: null,
          categories: [],
          tags: [],
        },
        {
          id: 3,
          slug: 'test-title',
          title: 'Test Title',
          excerpt: 'Test excerpt',
          content: 'Some content',
          date: '2023-12-23T10:00:00Z',
          permalink: '/index.php/2023/12/23/test-title/',
          link: '/index.php/2023/12/23/test-title/',
          featuredImage: null,
          categories: [],
          tags: [],
        },
      ],
      total: 3,
    };

    test('should search posts successfully', async () => {
      
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockAllPosts),
      };

      global.fetch.mockResolvedValue(mockResponse);

      const result = await swantronService.searchPosts('search');

      expect(fetch).toHaveBeenCalledWith(
        'https://swantron.github.io/swantron/api/posts/index.json'
      );
      expect(result.posts).toHaveLength(1); // Only "Search Result" matches "search"
      expect(result.posts[0].title).toBe('Search Result');
    });

    test('should search posts with custom parameters', async () => {
      
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockAllPosts),
      };

      global.fetch.mockResolvedValue(mockResponse);

      const result = await swantronService.searchPosts('test', 1, 1);

      expect(fetch).toHaveBeenCalledWith(
        'https://swantron.github.io/swantron/api/posts/index.json'
      );
      expect(result.posts).toHaveLength(1); // perPage = 1
      expect(result.totalPages).toBe(2); // Math.ceil(2 matching posts / 1 perPage) = 2
    });

    test('should handle pagination for search results', async () => {
      
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockAllPosts),
      };

      global.fetch.mockResolvedValue(mockResponse);

      // Page 2 with perPage 1
      const result = await swantronService.searchPosts('test', 2, 1);

      expect(result.posts).toHaveLength(1);
      expect(result.totalPages).toBe(2);
      expect(result.posts[0].title).toBe('Test Title'); // Second matching post
    });

    test('should search in title, excerpt, and content', async () => {
      
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockAllPosts),
      };

      global.fetch.mockResolvedValue(mockResponse);

      // Search for "query" which appears in content of first post
      const result = await swantronService.searchPosts('query');

      expect(result.posts).toHaveLength(1);
      expect(result.posts[0].title).toBe('Search Result');
    });

    test('should handle case-insensitive search', async () => {
      
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockAllPosts),
      };

      global.fetch.mockResolvedValue(mockResponse);

      const result = await swantronService.searchPosts('SEARCH');

      expect(result.posts).toHaveLength(1);
      expect(result.posts[0].title).toBe('Search Result');
    });

    test('should handle empty search results', async () => {
      
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockAllPosts),
      };

      global.fetch.mockResolvedValue(mockResponse);

      const result = await swantronService.searchPosts('nonexistent');

      expect(result.posts).toHaveLength(0);
      expect(result.totalPages).toBe(0);
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
      expect(fetch).toHaveBeenCalled();
    });

    test('should handle network errors for search', async () => {
      
      global.fetch.mockRejectedValue(new Error('Network error'));

      await expect(swantronService.searchPosts('query')).rejects.toThrow(
        'Network error'
      );
      expect(fetch).toHaveBeenCalled();
    });
  });
});
