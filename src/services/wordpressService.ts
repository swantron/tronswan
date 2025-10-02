import { WordPressServiceResponse, Recipe, WordPressService } from '../types';
import { logger } from '../utils/logger';

// Updated API endpoint to use correct WordPress REST API format
const WORDPRESS_API_URL = 'https://chomptron.com/index.php?rest_route=/wp/v2';

// WordPress API response types
interface WordPressRecipe {
  id: number;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  date: string;
  _embedded?: {
    'wp:featuredmedia'?: Array<{ source_url: string }>;
    'wp:term'?: Array<
      Array<{ id: number; name: string; slug: string; link: string }>
    >;
  };
}

export const wordpressService: WordPressService = {
  async getRecipes(
    page: number = 1,
    perPage: number = 10
  ): Promise<WordPressServiceResponse> {
    try {
      const url = `${WORDPRESS_API_URL}/posts&_embed&page=${page}&per_page=${perPage}`;

      const response = await fetch(url);
      const recipes: WordPressRecipe[] = await response.json();
      const totalPages = response.headers.get('X-WP-TotalPages') || '1';

      return {
        recipes: recipes.map(
          (recipe: WordPressRecipe): Recipe => ({
            id: recipe.id,
            title: recipe.title.rendered,
            excerpt: recipe.excerpt.rendered,
            content: recipe.content.rendered,
            date: recipe.date,
            featuredImage:
              recipe._embedded?.['wp:featuredmedia']?.[0]?.source_url || null,
            categories: recipe._embedded?.['wp:term']?.[0] || [],
            tags: recipe._embedded?.['wp:term']?.[1] || [],
          })
        ),
        totalPages: parseInt(totalPages, 10),
      };
    } catch (error) {
      logger.apiError(
        'WordPress',
        'getRecipes',
        error instanceof Error ? error : new Error('Unknown error')
      );
      throw error;
    }
  },

  async getRecipeById(id: number): Promise<Recipe> {
    try {
      const response = await fetch(`${WORDPRESS_API_URL}/posts/${id}&_embed`);

      const recipe: WordPressRecipe = await response.json();

      return {
        id: recipe.id,
        title: recipe.title.rendered,
        excerpt: recipe.excerpt.rendered,
        content: recipe.content.rendered,
        date: recipe.date,
        featuredImage:
          recipe._embedded?.['wp:featuredmedia']?.[0]?.source_url || null,
        categories: recipe._embedded?.['wp:term']?.[0] || [],
        tags: recipe._embedded?.['wp:term']?.[1] || [],
      };
    } catch (error) {
      logger.apiError(
        'WordPress',
        'getRecipe',
        error instanceof Error ? error : new Error('Unknown error')
      );
      throw error;
    }
  },

  async searchRecipes(
    query: string,
    page: number = 1,
    perPage: number = 10
  ): Promise<WordPressServiceResponse> {
    try {
      const url = `${WORDPRESS_API_URL}/posts&search=${encodeURIComponent(query)}&_embed&page=${page}&per_page=${perPage}`;

      const response = await fetch(url);
      const recipes: WordPressRecipe[] = await response.json();
      const totalPages = response.headers.get('X-WP-TotalPages') || '1';

      return {
        recipes: recipes.map(
          (recipe: WordPressRecipe): Recipe => ({
            id: recipe.id,
            title: recipe.title.rendered,
            excerpt: recipe.excerpt.rendered,
            content: recipe.content.rendered,
            date: recipe.date,
            featuredImage:
              recipe._embedded?.['wp:featuredmedia']?.[0]?.source_url || null,
            categories: recipe._embedded?.['wp:term']?.[0] || [],
            tags: recipe._embedded?.['wp:term']?.[1] || [],
          })
        ),
        totalPages: parseInt(totalPages, 10),
      };
    } catch (error) {
      logger.apiError(
        'WordPress',
        'searchRecipes',
        error instanceof Error ? error : new Error('Unknown error')
      );
      throw error;
    }
  },
};
