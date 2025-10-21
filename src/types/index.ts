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
}

export interface SwantronServiceResponse {
  posts: Post[];
  totalPages: number;
}

// Component Props Types
export interface SwantronCardProps {
  post: Post;
}

export interface SwantronListProps {
  // This component doesn't take props, but we'll define it for consistency
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
