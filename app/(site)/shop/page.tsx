import type { Metadata } from 'next';
import { getAllProducts, getCatalogTree } from '@/lib/data/catalog';
import { ShopClient } from '@/components/products/ShopClient';

export const revalidate = 3600; // ISR: 1-hour caching

export const metadata: Metadata = {
  title: 'Our Collection | LUXA FURNITURE',
  description: 'Shop luxury furniture sets, sofas, dining tables and chairs at LUXA FURNITURE.',
  alternates: { canonical: '/shop' },
};

export default async function Shop() {
  const [products, catalog] = await Promise.all([
    getAllProducts().catch(() => []),
    getCatalogTree().catch(() => []),
  ]);

  return <ShopClient initialProducts={products} initialCatalog={catalog} />;
}
