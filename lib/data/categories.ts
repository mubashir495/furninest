import 'server-only';
import { cache } from 'react';
import { API_URL } from '@/lib/axios';
import { Category, SubCategory } from '@/Type/category';
import { Product } from '@/Type/product';

export const getCategories = cache(async (): Promise<Category[]> => {
  try {
    const res = await fetch(`${API_URL}/categories`, {
      next: { revalidate: 3600, tags: ['categories'] },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
});

export const getCategoryBySlug = cache(async (slug: string): Promise<Category | null> => {
  try {
    const res = await fetch(`${API_URL}/categories/slug/${slug}`, {
      next: { revalidate: 3600, tags: ['categories', `category:${slug}`] },
    });
    if (res.status === 404 || !res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
});

export const getSubCategoriesByCategory = cache(async (categoryId: string): Promise<SubCategory[]> => {
  try {
    const res = await fetch(`${API_URL}/subcategories/category/${categoryId}`, {
      next: { revalidate: 3600, tags: ['categories', 'subcategories'] },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
});

export const getSubCategoryBySlug = cache(async (slug: string): Promise<SubCategory | null> => {
  try {
    const res = await fetch(`${API_URL}/subcategories/slug/${slug}`, {
      next: { revalidate: 3600, tags: ['categories', 'subcategories', `subcategory:${slug}`] },
    });
    if (res.status === 404 || !res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
});

export const getProductsByCategory = cache(async (categoryId: string): Promise<Product[]> => {
  try {
    const res = await fetch(`${API_URL}/products/category/${categoryId}`, {
      next: { revalidate: 3600, tags: ['products', `category:${categoryId}`] },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
});

export const getProductsBySubCategory = cache(async (subCategoryId: string): Promise<Product[]> => {
  try {
    const res = await fetch(`${API_URL}/products/subcategory/${subCategoryId}`, {
      next: { revalidate: 3600, tags: ['products', `subcategory:${subCategoryId}`] },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
});
