import type { MetadataRoute } from 'next';

const BASE = 'https://luxafurniture.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Apni API/DB se products fetch karein
  const res = await fetch(`${BASE}/api/products`, { next: { revalidate: 3600 } });
  const products: { slug: string; updatedAt: string }[] = await res.json();

  const staticPages = ['', '/shop', '/categories', '/about', '/contact', '/faq', '/privacy-policy', '/terms']
    .map((path) => ({ url: `${BASE}${path}` }));

  const productPages = products.map((p) => ({
    url: `${BASE}/products/${p.slug}`,
    lastModified: new Date(p.updatedAt),
  }));

  return [...staticPages, ...productPages];
}