import { Category, SubCategory } from './category';

export interface ProductVariant {
  _id: string;
  configName: string;
  colorName?: string;
  colorHex?: string;
  sku?: string;
  price: number;
  salePrice?: number;
  stock: number;
  images: string[];
  isActive: boolean;
  dimensions?: string;
  material?: string;
  weight?: number;
  attributes?: Record<string, string>;
}

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
  variants?: ProductVariant[];
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

export function getVariantFinalPrice(variant: ProductVariant): number {
  if (variant.salePrice !== undefined && variant.salePrice < variant.price) {
    return variant.salePrice;
  }
  return variant.price;
}

export function getAvailableConfigs(variants: ProductVariant[]): string[] {
  return [...new Set(variants.filter(v => v.isActive).map(v => v.configName))];
}

export function getAvailableColors(variants: ProductVariant[], configName?: string): ProductVariant[] {
  const filtered = variants.filter(v => v.isActive && v.colorName);
  if (configName) return filtered.filter(v => v.configName === configName);
  return filtered;
}

export function findVariant(variants: ProductVariant[], configName: string, colorName?: string): ProductVariant | undefined {
  return variants.find(v =>
    v.isActive &&
    v.configName === configName &&
    (colorName === undefined || !v.colorName || v.colorName === colorName)
  );
}