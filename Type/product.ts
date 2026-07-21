// Client-side product types — mirror backend Product schema exactly.
// The backend does NOT support server-side search/pagination/filtering on
// GET /products, so all listing/filtering/sorting/pagination happens client-side.

import { Category, SubCategory } from './category';

export interface Product {
  _id: string;
  name: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  price: number;
  discount: number;
  finalPrice: number; // virtual: price - price*discount/100
  stock: number;
  thumbnailImage: string;
  images: string[];
  category: Category | string;
  subCategory: SubCategory | string;
  suggestionItems?: string[];
  isActive: boolean;
  created_date: string;
  updated_date: string;
}

// GET /products/:id and /products/slug/:slug attach `suggestions`
export interface ProductDetail extends Product {
  suggestions: ProductSuggestion[];
}

export interface ProductSuggestion {
  _id: string;
  name: string;
  slug: string;
  price: number;
  discount: number;
  thumbnailImage: string;
  images: string[];
  stock: number;
}

export type SortOption =
  | 'featured'
  | 'price-asc'
  | 'price-desc'
  | 'newest'
  | 'name-asc';

export interface ProductFilter {
  categoryId?: string;
  subCategoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  onSale?: boolean;
  search?: string;
  sortBy?: SortOption;
}

export function getCategoryName(product: Product): string {
  return typeof product.category === 'string' ? '' : product.category?.name ?? '';
}

export function getSubCategoryName(product: Product): string {
  return typeof product.subCategory === 'string' ? '' : product.subCategory?.name ?? '';
}
