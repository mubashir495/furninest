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

  sku?: string;
  brand?: string;
  material?: string;
  dimensions?: string;
  weight?: string;

  featured?: boolean;
  status?: "active" | "inactive";
}