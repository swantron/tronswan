import { SwantronServiceResponse, Post, SwantronService } from '../types';
import { logger } from '../utils/logger';

// Swantron WordPress API service
const SWANTRON_API_URL = 'https://swantron.com/wp-json/wp/v2';

// Helper function to extract first image from post content
const extractImageFromContent = (content: string): string | null => {
  const imgMatch = content.match(/<img[^>]+src="([^"]+)"/);
  return imgMatch ? imgMatch[1] : null;
};

// WordPress API response types
interface WordPressPost {
  id: number;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  date: string;
  link: string;
  _embedded?: {
    'wp:featuredmedia'?: Array<{ source_url: string }>;
    'wp:term'?: Array<
      Array<{ id: number; name: string; slug: string; link: string }>
    >;
  };
}

export const swantronService: SwantronService = {
  async getPosts(
    page: number = 1,
    perPage: number = 10
  ): Promise<SwantronServiceResponse> {
    try {
      const url = `${SWANTRON_API_URL}/posts?_embed&page=${page}&per_page=${perPage}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const posts: WordPressPost[] = await response.json();

      if (!Array.isArray(posts)) {
        logger.error('Invalid response format from swantron.com API', {
          expected: 'array',
          received: posts,
        });
        throw new Error('Invalid response format from swantron.com API');
      }

      const totalPages = response.headers.get('X-WP-TotalPages') || '1';

      return {
        posts: posts.map((post: WordPressPost): Post => {
          // Try to get featured image, fallback to content image
          let featuredImage: string | null =
            post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null;
          if (!featuredImage) {
            featuredImage = extractImageFromContent(post.content.rendered);
          }

          return {
            id: post.id,
            title: post.title.rendered,
            excerpt: post.excerpt.rendered,
            content: post.content.rendered,
            date: post.date,
            featuredImage,
            categories: post._embedded?.['wp:term']?.[0] || [],
            tags: post._embedded?.['wp:term']?.[1] || [],
            link: post.link,
          };
        }),
        totalPages: parseInt(totalPages, 10),
      };
    } catch (error) {
      logger.apiError(
        'Swantron',
        'getPosts',
        error instanceof Error ? error : new Error('Unknown error')
      );
      throw error;
    }
  },

  async getPostById(id: number): Promise<Post> {
    try {
      const response = await fetch(`${SWANTRON_API_URL}/posts/${id}?_embed`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const post: WordPressPost = await response.json();

      // Try to get featured image, fallback to content image
      let featuredImage: string | null =
        post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null;
      if (!featuredImage) {
        featuredImage = extractImageFromContent(post.content.rendered);
      }

      return {
        id: post.id,
        title: post.title.rendered,
        excerpt: post.excerpt.rendered,
        content: post.content.rendered,
        date: post.date,
        featuredImage,
        categories: post._embedded?.['wp:term']?.[0] || [],
        tags: post._embedded?.['wp:term']?.[1] || [],
        link: post.link,
      };
    } catch (error) {
      logger.apiError(
        'Swantron',
        'getPost',
        error instanceof Error ? error : new Error('Unknown error')
      );
      throw error;
    }
  },

  async searchPosts(
    query: string,
    page: number = 1,
    perPage: number = 10
  ): Promise<SwantronServiceResponse> {
    try {
      const url = `${SWANTRON_API_URL}/posts?search=${encodeURIComponent(query)}&_embed&page=${page}&per_page=${perPage}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const posts: WordPressPost[] = await response.json();

      if (!Array.isArray(posts)) {
        logger.error('Invalid response format from swantron.com API', {
          expected: 'array',
          received: posts,
        });
        throw new Error('Invalid response format from swantron.com API');
      }

      const totalPages = response.headers.get('X-WP-TotalPages') || '1';

      return {
        posts: posts.map((post: WordPressPost): Post => {
          // Try to get featured image, fallback to content image
          let featuredImage: string | null =
            post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null;
          if (!featuredImage) {
            featuredImage = extractImageFromContent(post.content.rendered);
          }

          return {
            id: post.id,
            title: post.title.rendered,
            excerpt: post.excerpt.rendered,
            content: post.content.rendered,
            date: post.date,
            featuredImage,
            categories: post._embedded?.['wp:term']?.[0] || [],
            tags: post._embedded?.['wp:term']?.[1] || [],
            link: post.link,
          };
        }),
        totalPages: parseInt(totalPages, 10),
      };
    } catch (error) {
      logger.apiError(
        'Swantron',
        'searchPosts',
        error instanceof Error ? error : new Error('Unknown error')
      );
      throw error;
    }
  },
};
