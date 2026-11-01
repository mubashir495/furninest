import type { Metadata } from 'next';
import { getAllProducts, getCatalogTree } from '@/lib/data/catalog';
import { ShopClient } from '@/components/products/ShopClient';

export const revalidate = 3600; // ISR: 1-hour caching

export const metadata: Metadata = {
  title: 'Our Collection | LUXA FURNITURE',
  description:
    'Discover luxury beds, premium sofas, dining tables and chairs at LUXA FURNITURE. Quality craftsmanship with UK delivery.',
  alternates: { canonical: '/shop' },
};

export default async function Shop() {
  const [products, catalog] = await Promise.all([
    getAllProducts().catch(() => []),
    getCatalogTree().catch(() => []),
  ]);

  return <ShopClient initialProducts={products} initialCatalog={catalog} />;
}
