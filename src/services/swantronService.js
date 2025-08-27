// Swantron WordPress API service
const SWANTRON_API_URL = 'https://swantron.com/wp-json/wp/v2';

// Helper function to extract first image from post content
const extractImageFromContent = (content) => {
  const imgMatch = content.match(/<img[^>]+src="([^"]+)"/);
  return imgMatch ? imgMatch[1] : null;
};

export const swantronService = {
  async getPosts(page = 1, perPage = 10) {
    try {
      const url = `${SWANTRON_API_URL}/posts?_embed&page=${page}&per_page=${perPage}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const posts = await response.json();
      
      if (!Array.isArray(posts)) {
        console.error('Expected array but got:', posts);
        throw new Error('Invalid response format from swantron.com API');
      }
      
      const totalPages = response.headers.get('X-WP-TotalPages') || 1;

      return {
        posts: posts.map(post => {
          // Try to get featured image, fallback to content image
          let featuredImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
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
            link: post.link
          };
        }),
        totalPages: parseInt(totalPages, 10)
      };
    } catch (error) {
      console.error('Error fetching swantron posts:', error);
      throw error;
    }
  },

  async getPostById(id) {
    try {
      const response = await fetch(
        `${SWANTRON_API_URL}/posts/${id}?_embed`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const post = await response.json();

      // Try to get featured image, fallback to content image
      let featuredImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
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
        link: post.link
      };
    } catch (error) {
      console.error('Error fetching swantron post:', error);
      throw error;
    }
  },

  async searchPosts(query, page = 1, perPage = 10) {
    try {
      const url = `${SWANTRON_API_URL}/posts?search=${encodeURIComponent(query)}&_embed&page=${page}&per_page=${perPage}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const posts = await response.json();
      
      if (!Array.isArray(posts)) {
        console.error('Expected array but got:', posts);
        throw new Error('Invalid response format from swantron.com API');
      }
      
      const totalPages = response.headers.get('X-WP-TotalPages') || 1;

      return {
        posts: posts.map(post => {
          // Try to get featured image, fallback to content image
          let featuredImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
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
            link: post.link
          };
        }),
        totalPages: parseInt(totalPages, 10)
      };
    } catch (error) {
      console.error('Error searching swantron posts:', error);
      throw error;
    }
  }
};
