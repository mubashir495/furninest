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
  color?: string[];
  size?: string[];
  sku?: string;
  brand?: string;
}

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

export function suggestionToProduct(s: ProductSuggestion): Product {
  const finalPrice = s.discount > 0 ? Math.round(s.price - (s.price * s.discount) / 100) : s.price;
  return {
    _id: s._id,
    name: s.name,
    slug: s.slug,
    shortDescription: '',
    longDescription: '',
    price: s.price,
    discount: s.discount,
    finalPrice,
    stock: s.stock,
    thumbnailImage: s.thumbnailImage,
    images: s.images,
    category: '',
    subCategory: '',
    isActive: true,
    created_date: '',
    updated_date: '',
  };

}