export type BlogStatus = 'draft' | 'published';

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  author: string;
  status: BlogStatus;
  readTime: number;
  seoTitle: string;
  seoDescription: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type BlogPostSummary = Omit<BlogPost, 'content'>;

export interface BlogListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  published?: number;
  draft?: number;
}

export interface BlogListResponse {
  success: boolean;
  data: BlogPostSummary[];
  meta: BlogListMeta;
}

export interface BlogFormValues {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string;         // comma-separated string in form, split on submit
  author: string;
  status: BlogStatus;
  seoTitle: string;
  seoDescription: string;
}
