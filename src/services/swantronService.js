// Swantron WordPress API service
const SWANTRON_API_URL = process.env.REACT_APP_SWANTRON_API_URL || 'https://swantron.com/wp-json/wp/v2';

export const swantronService = {
  async getPosts(page = 1, perPage = 10) {
    try {
      const url = `${SWANTRON_API_URL}/posts&_embed&page=${page}&per_page=${perPage}`;
      
      const response = await fetch(url);
      const posts = await response.json();
      const totalPages = response.headers.get('X-WP-TotalPages') || 1;

      return {
        posts: posts.map(post => ({
          id: post.id,
          title: post.title.rendered,
          excerpt: post.excerpt.rendered,
          content: post.content.rendered,
          date: post.date,
          featuredImage: post._embedded?.['wp:featuredmedia']?.[0]?.source_url,
          categories: post._embedded?.['wp:term']?.[0] || [],
          tags: post._embedded?.['wp:term']?.[1] || [],
          link: post.link
        })),
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
        `${SWANTRON_API_URL}/posts/${id}&_embed`
      );

      const post = await response.json();

      return {
        id: post.id,
        title: post.title.rendered,
        excerpt: post.excerpt.rendered,
        content: post.content.rendered,
        date: post.date,
        featuredImage: post._embedded?.['wp:featuredmedia']?.[0]?.source_url,
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
      const url = `${SWANTRON_API_URL}/posts&search=${encodeURIComponent(query)}&_embed&page=${page}&per_page=${perPage}`;
      
      const response = await fetch(url);
      const posts = await response.json();
      const totalPages = response.headers.get('X-WP-TotalPages') || 1;

      return {
        posts: posts.map(post => ({
          id: post.id,
          title: post.title.rendered,
          excerpt: post.excerpt.rendered,
          content: post.content.rendered,
          date: post.date,
          featuredImage: post._embedded?.['wp:featuredmedia']?.[0]?.source_url,
          categories: post._embedded?.['wp:term']?.[0] || [],
          tags: post._embedded?.['wp:term']?.[1] || [],
          link: post.link
        })),
        totalPages: parseInt(totalPages, 10)
      };
    } catch (error) {
      console.error('Error searching swantron posts:', error);
      throw error;
    }
  }
};
