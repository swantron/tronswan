import { SwantronServiceResponse, Post, SwantronService } from '../types';
import { logger } from '../utils/logger';
import { runtimeConfig } from '../utils/runtimeConfig';

// Get Hugo API base URL from config, fallback to production URL
// Note: runtimeConfig.getWithDefault works even if not initialized (uses fallback)
const getSwantronApiUrl = (): string => {
  const apiUrl = runtimeConfig.getWithDefault(
    'VITE_SWANTRON_API_URL',
    'https://swantron.com'
  );
  return apiUrl;
};

// Helper function to extract first image from post content
const extractImageFromContent = (content: string): string | null => {
  const imgMatch = content.match(/<img[^>]+src="([^"]+)"/);
  return imgMatch ? imgMatch[1] : null;
};

// Rewrite site-relative src/href ("/uploads/...") to absolute swantron.com URLs
// so embedded media and inline links work when this content is rendered on
// tronswan.com instead of swantron.com.
const rewriteRelativeUrls = (html: string, apiUrl: string): string => {
  if (!html) return html;
  return html.replace(
    /(\s(?:src|href|poster))="\/(?!\/)([^"]*)"/g,
    (_, attr, path) => `${attr}="${apiUrl}/${path}"`
  );
};

// Content enhancements for embedded media:
//   1. If the post content opens with a single <p><img></p> that's the same
//      image as the article's featured image (hero), strip it — we already
//      show that image at the top of the detail page, so rendering it again
//      inline is a duplicate.
//   2. For every <video> tag, ensure preload="auto" + playsinline are set so
//      browsers fetch metadata eagerly and iOS plays inline. Inject the
//      featured image as poster= when missing — otherwise the player shows
//      a black rectangle until the user hits play (the recording's first
//      frame is often black).
const enhanceMediaInContent = (
  html: string,
  posterUrl: string | null
): { content: string; leadImageStripped: boolean } => {
  if (!html) return { content: html, leadImageStripped: false };
  let out = html;
  let leadImageStripped = false;

  if (posterUrl) {
    const leadImgRegex = /<p>\s*<img([^>]*)>\s*<\/p>\s*/i;
    const match = out.match(leadImgRegex);
    if (match) {
      const srcMatch = /\ssrc="([^"]+)"/i.exec(match[1]);
      if (srcMatch && srcMatch[1] === posterUrl) {
        out = out.replace(match[0], '');
        leadImageStripped = true;
      }
    }
  }

  out = out.replace(/<video(\s[^>]*?)?>/gi, (_full, rawAttrs) => {
    let attrs = rawAttrs || '';
    if (!/\bpreload\s*=/i.test(attrs)) attrs += ' preload="auto"';
    if (!/\bplaysinline\b/i.test(attrs)) attrs += ' playsinline';
    if (posterUrl && !/\bposter\s*=/i.test(attrs)) {
      attrs += ` poster="${posterUrl}"`;
    }
    return `<video${attrs}>`;
  });

  return { content: out, leadImageStripped };
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
  const apiUrl = getSwantronApiUrl();

  // Rewrite relative URLs in HTML so videos/images/links resolve to
  // swantron.com rather than tronswan.com.
  let content = rewriteRelativeUrls(hugoPost.content, apiUrl);
  const excerpt = rewriteRelativeUrls(hugoPost.excerpt, apiUrl);

  // If featuredImage is relative, make it absolute
  let featuredImage = hugoPost.featuredImage;
  if (featuredImage && !featuredImage.startsWith('http')) {
    featuredImage = `${apiUrl}${featuredImage}`;
  }
  // Fallback to extracting from content if no featured image
  if (!featuredImage) {
    featuredImage = extractImageFromContent(content);
  }

  // Dedupe lead <p><img></p> against featuredImage, and inject poster +
  // preload + playsinline onto any <video> tags so the player previews the
  // poster image instead of a black rectangle. We track whether we stripped
  // a lead image so the detail view can also drop its hero (otherwise the
  // same image would render as a 300px hero AND immediately again — once via
  // the body, once via the swantron-detail-image block).
  const enhanced = enhanceMediaInContent(content, featuredImage);
  content = enhanced.content;

  return {
    id: hugoPost.id,
    title: hugoPost.title,
    excerpt,
    content,
    date: hugoPost.date,
    featuredImage,
    categories: hugoPost.categories || [],
    tags: hugoPost.tags || [],
    link: hugoPost.link,
    heroIsDuplicate: enhanced.leadImageStripped,
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
