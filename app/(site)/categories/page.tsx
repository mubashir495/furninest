import type { Metadata } from 'next';
import { getCatalogTree } from '@/lib/data/catalog';
import { CategoryList } from '@/components/categories/CategoryList';

export const revalidate = 3600; // ISR: 1-hour caching

export const metadata: Metadata = {
  title: 'All Categories | LUXA FURNITURE',
  description: 'Browse all luxury furniture categories at LUXA FURNITURE.',
  alternates: { canonical: '/categories' },
};

export default async function CategoriesPage() {
  const catalog = await getCatalogTree();
  return <CategoryList catalog={catalog} />;
}
