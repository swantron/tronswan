const PROXY_URL = process.env.REACT_APP_PROXY_URL || 'http://localhost:3001';

export const wordpressService = {
  async getRecipes(page = 1, perPage = 10) {
    try {
      const categoryId = process.env.REACT_APP_RECIPE_CATEGORY_ID || '';
      const url = `${PROXY_URL}/wp-json/wp/v2/posts?_embed&page=${page}&per_page=${perPage}${categoryId ? `&categories=${categoryId}` : ''}`;
      
      const response = await fetch(url);
      const recipes = await response.json();
      const totalPages = response.headers.get('X-WP-TotalPages') || 1;

      return {
        recipes: recipes.map(recipe => ({
          id: recipe.id,
          title: recipe.title.rendered,
          excerpt: recipe.excerpt.rendered,
          content: recipe.content.rendered,
          date: recipe.date,
          featuredImage: recipe._embedded?.['wp:featuredmedia']?.[0]?.source_url,
          categories: recipe._embedded?.['wp:term']?.[0] || [],
          tags: recipe._embedded?.['wp:term']?.[1] || []
        })),
        totalPages: parseInt(totalPages, 10)
      };
    } catch (error) {
      console.error('Error fetching recipes:', error);
      throw error;
    }
  },

  async getRecipeById(id) {
    try {
      const response = await fetch(
        `${PROXY_URL}/wp-json/wp/v2/posts/${id}?_embed`
      );

      const recipe = await response.json();

      return {
        id: recipe.id,
        title: recipe.title.rendered,
        excerpt: recipe.excerpt.rendered,
        content: recipe.content.rendered,
        date: recipe.date,
        featuredImage: recipe._embedded?.['wp:featuredmedia']?.[0]?.source_url,
        categories: recipe._embedded?.['wp:term']?.[0] || [],
        tags: recipe._embedded?.['wp:term']?.[1] || []
      };
    } catch (error) {
      console.error('Error fetching recipe:', error);
      throw error;
    }
  },

  async searchRecipes(query, page = 1, perPage = 10) {
    try {
      const categoryId = process.env.REACT_APP_RECIPE_CATEGORY_ID || '';
      const url = `${PROXY_URL}/wp-json/wp/v2/posts?search=${encodeURIComponent(query)}&_embed&page=${page}&per_page=${perPage}${categoryId ? `&categories=${categoryId}` : ''}`;
      
      const response = await fetch(url);
      const recipes = await response.json();
      const totalPages = response.headers.get('X-WP-TotalPages') || 1;

      return {
        recipes: recipes.map(recipe => ({
          id: recipe.id,
          title: recipe.title.rendered,
          excerpt: recipe.excerpt.rendered,
          content: recipe.content.rendered,
          date: recipe.date,
          featuredImage: recipe._embedded?.['wp:featuredmedia']?.[0]?.source_url,
          categories: recipe._embedded?.['wp:term']?.[0] || [],
          tags: recipe._embedded?.['wp:term']?.[1] || []
        })),
        totalPages: parseInt(totalPages, 10)
      };
    } catch (error) {
      console.error('Error searching recipes:', error);
      throw error;
    }
  }
}; 