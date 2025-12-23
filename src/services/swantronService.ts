import { SwantronServiceResponse, Post, SwantronService } from '../types';
import { logger } from '../utils/logger';
import { runtimeConfig } from '../utils/runtimeConfig';

// Get Hugo API base URL from config, fallback to GitHub Pages URL
// Note: runtimeConfig.getWithDefault works even if not initialized (uses fallback)
const getSwantronApiUrl = (): string => {
  const apiUrl = runtimeConfig.getWithDefault(
    'VITE_SWANTRON_API_URL',
    'https://swantron.github.io/swantron'
  );
  return apiUrl;
};

// Helper function to extract first image from post content
const extractImageFromContent = (content: string): string | null => {
  const imgMatch = content.match(/<img[^>]+src="([^"]+)"/);
  return imgMatch ? imgMatch[1] : null;
};

// Hugo JSON API response types
interface HugoPost {
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
}

interface HugoPostsResponse {
  posts: HugoPost[];
  total: number;
}

// Cache for all posts to avoid refetching
let allPostsCache: HugoPost[] | null = null;
let allPostsCacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fetch all posts from Hugo API
const fetchAllPosts = async (): Promise<HugoPost[]> => {
  const now = Date.now();
  if (allPostsCache && now - allPostsCacheTimestamp < CACHE_DURATION) {
    return allPostsCache;
  }

  const apiUrl = getSwantronApiUrl();
  const url = `${apiUrl}/api/posts/index.json`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data: HugoPostsResponse = await response.json();

  if (!data.posts || !Array.isArray(data.posts)) {
    logger.error('Invalid response format from Hugo API', {
      expected: 'object with posts array',
      received: data,
    });
    throw new Error('Invalid response format from Hugo API');
  }

  allPostsCache = data.posts;
  allPostsCacheTimestamp = now;

  return data.posts;
};

// Helper to convert Hugo post to Post format
const convertHugoPostToPost = (hugoPost: HugoPost): Post => {
  // If featuredImage is relative, make it absolute
  let featuredImage = hugoPost.featuredImage;
  if (featuredImage && !featuredImage.startsWith('http')) {
    const apiUrl = getSwantronApiUrl();
    featuredImage = `${apiUrl}${featuredImage}`;
  }
  // Fallback to extracting from content if no featured image
  if (!featuredImage) {
    featuredImage = extractImageFromContent(hugoPost.content);
  }

  return {
    id: hugoPost.id,
    title: hugoPost.title,
    excerpt: hugoPost.excerpt,
    content: hugoPost.content,
    date: hugoPost.date,
    featuredImage,
    categories: hugoPost.categories || [],
    tags: hugoPost.tags || [],
    link: hugoPost.link,
  };
};

export const swantronService: SwantronService = {
  async getPosts(
    page: number = 1,
    perPage: number = 10
  ): Promise<SwantronServiceResponse> {
    try {
      const allPosts = await fetchAllPosts();

      // Sort by date (newest first)
      const sortedPosts = [...allPosts].sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

      // Calculate pagination
      const totalPosts = sortedPosts.length;
      const totalPages = Math.ceil(totalPosts / perPage);
      const startIndex = (page - 1) * perPage;
      const endIndex = startIndex + perPage;
      const paginatedPosts = sortedPosts.slice(startIndex, endIndex);

      return {
        posts: paginatedPosts.map(convertHugoPostToPost),
        totalPages,
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
      // Fetch all posts (uses cache if available)
      const allPosts = await fetchAllPosts();

      // Find the post by ID
      const hugoPost = allPosts.find(post => post.id === id);

      if (!hugoPost) {
        throw new Error(`Post with id ${id} not found`);
      }

      return convertHugoPostToPost(hugoPost);
    } catch (error) {
      logger.apiError(
        'Swantron',
        'getPostById',
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
      const allPosts = await fetchAllPosts();
      const queryLower = query.toLowerCase();

      // Filter posts by search query (title, excerpt, content)
      const filteredPosts = allPosts.filter(post => {
        const titleMatch = post.title.toLowerCase().includes(queryLower);
        const excerptMatch = post.excerpt.toLowerCase().includes(queryLower);
        const contentMatch = post.content.toLowerCase().includes(queryLower);
        return titleMatch || excerptMatch || contentMatch;
      });

      // Sort by date (newest first)
      const sortedPosts = [...filteredPosts].sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

      // Calculate pagination
      const totalPosts = sortedPosts.length;
      const totalPages = Math.ceil(totalPosts / perPage);
      const startIndex = (page - 1) * perPage;
      const endIndex = startIndex + perPage;
      const paginatedPosts = sortedPosts.slice(startIndex, endIndex);

      return {
        posts: paginatedPosts.map(convertHugoPostToPost),
        totalPages,
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
