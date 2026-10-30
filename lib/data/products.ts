import 'server-only';
import { cache } from 'react';
import { API_URL } from '@/lib/axios';
import { ProductDetail } from '@/Type/product';

export const getProductBySlug = cache(async (slug: string): Promise<ProductDetail | null> => {
  const res = await fetch(`${API_URL}/products/slug/${slug}`, {
    next: { revalidate: 3600, tags: ['products', `product:${slug}`] },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Could not load product.');
  const json = await res.json();
  return json.data;
});

export async function getAllProductSlugs({ limit = 100 }: { limit?: number } = {}): Promise<string[]> {
  try {
    const res = await fetch(`${API_URL}/products?limit=${limit}`, {
      next: { revalidate: 3600, tags: ['products'] },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data ?? []).map((p: { slug: string }) => p.slug).filter(Boolean);
  } catch {
    return [];
  }
}
