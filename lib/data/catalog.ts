import 'server-only';
import { API_URL } from '@/lib/axios';
import { Product } from '@/Type/product';
import { CatalogCategory } from '@/Type/category';

export async function getAllProducts(): Promise<Product[]> {
  const res = await fetch(`${API_URL}/products`, {
    next: { revalidate: 3600, tags: ['products'] },
  });
  if (!res.ok) throw new Error('Could not load products.');
  const json = await res.json();
  return json.data ?? [];
}

export async function getCatalogTree(): Promise<CatalogCategory[]> {
  const res = await fetch(`${API_URL}/products/catalog-tree`, {
    next: { revalidate: 3600, tags: ['categories', 'products'] },
  });
  if (!res.ok) throw new Error('Could not load categories.');
  const json = await res.json();
  return json.data ?? [];
}
