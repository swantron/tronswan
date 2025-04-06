const WORDPRESS_API_URL = process.env.REACT_APP_WORDPRESS_API_URL || 'https://chomptron.com/wp-json/wp/v2';

export const wordpressService = {
  async getRecipes(page = 1, perPage = 10) {
    try {
      const response = await fetch(
        `${WORDPRESS_API_URL}/posts?categories=${process.env.REACT_APP_RECIPE_CATEGORY_ID}&_embed&page=${page}&per_page=${perPage}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch recipes');
      }

      const totalPages = response.headers.get('X-WP-TotalPages');
      const recipes = await response.json();

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
        `${WORDPRESS_API_URL}/posts/${id}?_embed`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch recipe');
      }

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
      const response = await fetch(
        `${WORDPRESS_API_URL}/posts?search=${encodeURIComponent(query)}&categories=${process.env.REACT_APP_RECIPE_CATEGORY_ID}&_embed&page=${page}&per_page=${perPage}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to search recipes');
      }

      const totalPages = response.headers.get('X-WP-TotalPages');
      const recipes = await response.json();

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