export interface Category {
  _id: string;
  name: string;
  slug?: string;
  image?: string;
  description?: string;
}

export interface SubCategory {
  _id: string;
  name: string;
  slug?: string;
  category: string | Category;
}

export interface Product {
  _id: string;

  name: string;
  slug: string;

  shortDescription: string;
  longDescription: string;

  category: string | Category;
  subCategory: string | SubCategory;

  price: number;
  discount: number;
  stock: number;
  finalPrice?: number;

  thumbnailImage?: string;   // ✅ add this
  images: string[];

  color?: string[];
  size?: string[];

  // IDs of other products to show as "You may also like" suggestions
  suggestionItems?: string[];

  sku?: string;
  brand?: string;
  material?: string;
  dimensions?: string;
  weight?: string;

  featured?: boolean;
  status?: "active" | "inactive";

  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedResponse<T> {
  products: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data: T;
}

export interface ProductFormData {
  name: string;
  slug?: string;

  shortDescription: string;
  longDescription: string;

  category?: string;
  subCategory: string;

  price: number;
  discount: number;
  stock: number;

  thumbnailImage?: string;   // ✅ add this (existing URL, for edit mode)
  images?: string[];

  color?: string[];
  size?: string[];

  // IDs of other products selected as suggestions (kept separate from gallery images)
  suggestionItems?: string[];

  sku?: string;
  brand?: string;
  material?: string;
  dimensions?: string;
  weight?: string;

  featured?: boolean;
  status?: "active" | "inactive";
}