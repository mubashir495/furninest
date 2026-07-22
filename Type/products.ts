export interface Category {
  _id: string;
  name: string;
  slug?: string;
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

  images: string[];

  color?: string[];
  size?: string[];

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

export interface ProductFormData {
  name: string;
  slug: string;

  shortDescription: string;
  longDescription: string;

  category: string;
  subCategory: string;

  price: number;
  discount: number;
  stock: number;

  images?: string[];

  color?: string[];
  size?: string[];

  sku?: string;
  brand?: string;
  material?: string;
  dimensions?: string;
  weight?: string;

  featured?: boolean;
  status?: "active" | "inactive";
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: Pagination;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  subCategory?: string;
  page?: number;
  limit?: number;
}