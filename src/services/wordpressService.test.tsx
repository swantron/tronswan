import { vi, expect, describe, test, beforeAll, afterAll, beforeEach } from 'vitest';
import { wordpressService } from './wordpressService';

// Mock fetch globally
global.fetch = vi.fn();

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = vi.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('wordpressService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment variable
    delete process.env.REACT_APP_WORDPRESS_API_URL;
  });

  describe('getRecipes', () => {
    const mockRecipesResponse = [
      {
        id: 1,
        title: { rendered: 'Test Recipe 1' },
        excerpt: { rendered: 'Test recipe excerpt 1' },
        content: { rendered: 'Test recipe content 1' },
        date: '2023-12-25T10:00:00Z',
        _embedded: {
          'wp:featuredmedia': [{ source_url: 'https://example.com/recipe1.jpg' }],
          'wp:term': [
            [{ id: 1, name: 'Breakfast' }],
            [{ id: 1, name: 'Quick' }]
          ]
        }
      },
      {
        id: 2,
        title: { rendered: 'Test Recipe 2' },
        excerpt: { rendered: 'Test recipe excerpt 2' },
        content: { rendered: 'Test recipe content 2' },
        date: '2023-12-26T10:00:00Z',
        _embedded: {
          'wp:featuredmedia': [],
          'wp:term': [[], []]
        }
      }
    ];

    test('should fetch recipes successfully with default parameters', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockRecipesResponse),
        headers: {
          get: vi.fn().mockReturnValue('3')
        }
      };

      global.fetch.mockResolvedValue(mockResponse);

      const result = await wordpressService.getRecipes();

      expect(fetch).toHaveBeenCalledWith(
        'https://chomptron.com/index.php?rest_route=/wp/v2/posts&_embed&page=1&per_page=10'
      );
      expect(result.recipes).toHaveLength(2);
      expect(result.totalPages).toBe(3);
      expect(result.recipes[0]).toEqual({
        id: 1,
        title: 'Test Recipe 1',
        excerpt: 'Test recipe excerpt 1',
        content: 'Test recipe content 1',
        date: '2023-12-25T10:00:00Z',
        featuredImage: 'https://example.com/recipe1.jpg',
        categories: [{ id: 1, name: 'Breakfast' }],
        tags: [{ id: 1, name: 'Quick' }]
      });
    });

    test('should fetch recipes with custom page and perPage parameters', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockRecipesResponse),
        headers: {
          get: vi.fn().mockReturnValue('2')
        }
      };

      global.fetch.mockResolvedValue(mockResponse);

      const result = await wordpressService.getRecipes(2, 5);

      expect(fetch).toHaveBeenCalledWith(
        'https://chomptron.com/index.php?rest_route=/wp/v2/posts&_embed&page=2&per_page=5'
      );
      expect(result.totalPages).toBe(2);
    });



    test('should handle missing total pages header', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockRecipesResponse),
        headers: {
          get: vi.fn().mockReturnValue(null)
        }
      };

      global.fetch.mockResolvedValue(mockResponse);

      const result = await wordpressService.getRecipes();

      expect(result.totalPages).toBe(1);
    });

    test('should handle recipes without embedded media or terms', async () => {
      const recipesWithoutEmbedded = [
        {
          id: 3,
          title: { rendered: 'Recipe without embedded' },
          excerpt: { rendered: 'No embedded content' },
          content: { rendered: 'Content here' },
          date: '2023-12-27T10:00:00Z',
          _embedded: {}
        }
      ];

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(recipesWithoutEmbedded),
        headers: {
          get: vi.fn().mockReturnValue('1')
        }
      };

      global.fetch.mockResolvedValue(mockResponse);

      const result = await wordpressService.getRecipes();

      expect(result.recipes[0].featuredImage).toBeNull();
      expect(result.recipes[0].categories).toEqual([]);
      expect(result.recipes[0].tags).toEqual([]);
    });

    test('should handle network errors', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));

      await expect(wordpressService.getRecipes()).rejects.toThrow('Network error');
    });

    test('should handle empty recipes array', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue([]),
        headers: {
          get: vi.fn().mockReturnValue('1')
        }
      };

      global.fetch.mockResolvedValue(mockResponse);

      const result = await wordpressService.getRecipes();

      expect(result.recipes).toHaveLength(0);
      expect(result.totalPages).toBe(1);
    });
  });

  describe('getRecipeById', () => {
    const mockRecipeResponse = {
      id: 1,
      title: { rendered: 'Single Recipe' },
      excerpt: { rendered: 'Single recipe excerpt' },
      content: { rendered: 'Single recipe content' },
      date: '2023-12-25T10:00:00Z',
      _embedded: {
        'wp:featuredmedia': [{ source_url: 'https://example.com/recipe.jpg' }],
        'wp:term': [
          [{ id: 1, name: 'Dinner' }],
          [{ id: 1, name: 'Healthy' }]
        ]
      }
    };

    test('should fetch single recipe successfully', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockRecipeResponse)
      };

      global.fetch.mockResolvedValue(mockResponse);

      const result = await wordpressService.getRecipeById(1);

      expect(fetch).toHaveBeenCalledWith(
        'https://chomptron.com/index.php?rest_route=/wp/v2/posts/1&_embed'
      );
      expect(result.id).toBe(1);
      expect(result.title).toBe('Single Recipe');
      expect(result.featuredImage).toBe('https://example.com/recipe.jpg');
      expect(result.categories).toEqual([{ id: 1, name: 'Dinner' }]);
      expect(result.tags).toEqual([{ id: 1, name: 'Healthy' }]);
    });

    test('should handle recipe without embedded content', async () => {
      const recipeWithoutEmbedded = {
        id: 2,
        title: { rendered: 'Recipe without embedded' },
        excerpt: { rendered: 'No embedded content' },
        content: { rendered: 'Content here' },
        date: '2023-12-26T10:00:00Z',
        _embedded: {}
      };

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(recipeWithoutEmbedded)
      };

      global.fetch.mockResolvedValue(mockResponse);

      const result = await wordpressService.getRecipeById(2);

      expect(result.featuredImage).toBeNull();
      expect(result.categories).toEqual([]);
      expect(result.tags).toEqual([]);
    });

    test('should handle network errors for single recipe', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));

      await expect(wordpressService.getRecipeById(1)).rejects.toThrow('Network error');
    });

    test('should handle recipe with missing embedded terms', async () => {
      const recipeWithPartialEmbedded = {
        id: 3,
        title: { rendered: 'Partial embedded recipe' },
        excerpt: { rendered: 'Partial content' },
        content: { rendered: 'Content here' },
        date: '2023-12-27T10:00:00Z',
        _embedded: {
          'wp:featuredmedia': [{ source_url: 'https://example.com/partial.jpg' }]
          // Missing wp:term
        }
      };

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(recipeWithPartialEmbedded)
      };

      global.fetch.mockResolvedValue(mockResponse);

      const result = await wordpressService.getRecipeById(3);

      expect(result.featuredImage).toBe('https://example.com/partial.jpg');
      expect(result.categories).toEqual([]);
      expect(result.tags).toEqual([]);
    });
  });

  describe('searchRecipes', () => {
    const mockSearchResponse = [
      {
        id: 1,
        title: { rendered: 'Search Recipe Result' },
        excerpt: { rendered: 'Search recipe excerpt' },
        content: { rendered: 'Search recipe content' },
        date: '2023-12-25T10:00:00Z',
        _embedded: {
          'wp:featuredmedia': [{ source_url: 'https://example.com/search-recipe.jpg' }],
          'wp:term': [
            [{ id: 1, name: 'Search Category' }],
            [{ id: 1, name: 'Search Tag' }]
          ]
        }
      }
    ];

    test('should search recipes successfully', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockSearchResponse),
        headers: {
          get: vi.fn().mockReturnValue('2')
        }
      };

      global.fetch.mockResolvedValue(mockResponse);

      const result = await wordpressService.searchRecipes('test query');

      expect(fetch).toHaveBeenCalledWith(
        'https://chomptron.com/index.php?rest_route=/wp/v2/posts&search=test%20query&_embed&page=1&per_page=10'
      );
      expect(result.recipes).toHaveLength(1);
      expect(result.recipes[0].title).toBe('Search Recipe Result');
    });

    test('should search recipes with custom parameters', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockSearchResponse),
        headers: {
          get: vi.fn().mockReturnValue('1')
        }
      };

      global.fetch.mockResolvedValue(mockResponse);

      const result = await wordpressService.searchRecipes('query', 3, 20);

      expect(fetch).toHaveBeenCalledWith(
        'https://chomptron.com/index.php?rest_route=/wp/v2/posts&search=query&_embed&page=3&per_page=20'
      );
    });

    test('should handle special characters in search query', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue([]),
        headers: {
          get: vi.fn().mockReturnValue('1')
        }
      };

      global.fetch.mockResolvedValue(mockResponse);

      await wordpressService.searchRecipes('test & query with special chars!');

      expect(fetch).toHaveBeenCalledWith(
        'https://chomptron.com/index.php?rest_route=/wp/v2/posts&search=test%20%26%20query%20with%20special%20chars!&_embed&page=1&per_page=10'
      );
    });

    test('should handle empty search results', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue([]),
        headers: {
          get: vi.fn().mockReturnValue('1')
        }
      };

      global.fetch.mockResolvedValue(mockResponse);

      const result = await wordpressService.searchRecipes('nonexistent');

      expect(result.recipes).toHaveLength(0);
      expect(result.totalPages).toBe(1);
    });

    test('should handle search with empty query', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue([]),
        headers: {
          get: vi.fn().mockReturnValue('1')
        }
      };

      global.fetch.mockResolvedValue(mockResponse);

      const result = await wordpressService.searchRecipes('');

      expect(fetch).toHaveBeenCalledWith(
        'https://chomptron.com/index.php?rest_route=/wp/v2/posts&search=&_embed&page=1&per_page=10'
      );
      expect(result.recipes).toHaveLength(0);
    });

    test('should handle search with very long query', async () => {
      const longQuery = 'a'.repeat(1000);
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue([]),
        headers: {
          get: vi.fn().mockReturnValue('1')
        }
      };

      global.fetch.mockResolvedValue(mockResponse);

      await wordpressService.searchRecipes(longQuery);

      expect(fetch).toHaveBeenCalledWith(
        `https://chomptron.com/index.php?rest_route=/wp/v2/posts&search=${encodeURIComponent(longQuery)}&_embed&page=1&per_page=10`
      );
    });

    test('should handle network errors for search', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));

      await expect(wordpressService.searchRecipes('query')).rejects.toThrow('Network error');
    });

    test('should handle search with unicode characters', async () => {
      const unicodeQuery = 'café résumé naïve';
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue([]),
        headers: {
          get: vi.fn().mockReturnValue('1')
        }
      };

      global.fetch.mockResolvedValue(mockResponse);

      await wordpressService.searchRecipes(unicodeQuery);

      expect(fetch).toHaveBeenCalledWith(
        `https://chomptron.com/index.php?rest_route=/wp/v2/posts&search=${encodeURIComponent(unicodeQuery)}&_embed&page=1&per_page=10`
      );
    });
  });
});
