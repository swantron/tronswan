// API Response Types
export interface Category {
  id: number;
  name: string;
  slug: string;
  link: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  link: string;
}

export interface Post {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  featuredImage: string | null;
  categories: Category[];
  tags: Tag[];
  link: string;
  // True when the post body originally opened with the same image we'd render
  // as the detail-page hero — the inline copy was stripped during content
  // enhancement, so the detail view should also drop the hero to avoid the
  // featured image showing up twice.
  heroIsDuplicate?: boolean;
}

export interface SwantronServiceResponse {
  posts: Post[];
  totalPages: number;
}

// Component Props Types
export interface SwantronCardProps {
  post: Post;
}

// Service Types
export interface SwantronService {
  getPosts(page?: number, perPage?: number): Promise<SwantronServiceResponse>;
  getPostById(id: number): Promise<Post>;
  searchPosts(
    query: string,
    page?: number,
    perPage?: number
  ): Promise<SwantronServiceResponse>;
}
