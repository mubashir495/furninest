import type { MetadataRoute } from 'next';
import { API_URL } from '@/lib/axios';

const BASE = 'https://luxafurniture.com';

interface ProductItem {
  slug: string;
  updatedAt?: string;
}

interface CategoryItem {
  slug: string;
  updatedAt?: string;
  subcategories?: { slug: string; updatedAt?: string }[];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // 1. Static high-priority pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE}/shop`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE}/categories`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE}/faq`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE}/privacy-policy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${BASE}/terms`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
  ];

  // 2. Fetch products safely
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_URL}/products?limit=1000`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const json = await res.json();
      const products: ProductItem[] = Array.isArray(json.data) ? json.data : [];
      productRoutes = products
        .filter((p) => Boolean(p && p.slug))
        .map((p) => ({
          url: `${BASE}/product/${encodeURIComponent(p.slug)}`,
          lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        }));
    }
  } catch (err) {
    console.error('Failed to load products for sitemap:', err);
  }

  // 3. Fetch categories safely
  let categoryRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_URL}/categories`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const json = await res.json();
      const categories: CategoryItem[] = Array.isArray(json.data) ? json.data : [];
      for (const cat of categories) {
        if (cat.slug) {
          categoryRoutes.push({
            url: `${BASE}/category/${encodeURIComponent(cat.slug)}`,
            lastModified: cat.updatedAt ? new Date(cat.updatedAt) : now,
            changeFrequency: 'weekly' as const,
            priority: 0.8,
          });
        }
        if (Array.isArray(cat.subcategories)) {
          for (const sub of cat.subcategories) {
            if (sub.slug) {
              categoryRoutes.push({
                url: `${BASE}/subcategory/${encodeURIComponent(sub.slug)}`,
                lastModified: sub.updatedAt ? new Date(sub.updatedAt) : now,
                changeFrequency: 'weekly' as const,
                priority: 0.7,
              });
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('Failed to load categories for sitemap:', err);
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
