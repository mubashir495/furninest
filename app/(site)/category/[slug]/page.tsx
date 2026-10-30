import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  getCategoryBySlug,
  getSubCategoriesByCategory,
  getProductsByCategory,
} from '@/lib/data/categories';
import { ProductGrid } from '@/components/products/ProductGrid';

export const revalidate = 3600; // ISR: 1-hour caching
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: 'Category not found' };

  return {
    title: `${category.name} | LUXA FURNITURE`,
    description: category.description || `Browse ${category.name} furniture at LUXA FURNITURE.`,
    alternates: { canonical: `/category/${slug}` },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const [subCategories, products] = await Promise.all([
    getSubCategoriesByCategory(category._id),
    getProductsByCategory(category._id),
  ]);

  return (
    <div className="pb-20">
      <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 py-16 md:py-24 rounded-b-[3rem] mb-12">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-serif text-primary mb-6">
            {category.name}
          </h1>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground font-medium uppercase tracking-wider">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-primary">{category.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6">
        {subCategories.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-10">
            {subCategories.map((sub) => (
              <Link
                key={sub._id}
                href={`/subcategory/${sub.slug}`}
                className="bg-card px-5 py-2.5 rounded-full text-sm font-medium soft-shadow hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {sub.name}
              </Link>
            ))}
          </div>
        )}

        <div className="text-sm font-medium text-muted-foreground mb-6">
          <span className="text-primary">{products.length}</span> products
        </div>

        <ProductGrid products={products} columns={3} emptyMessage="No products in this category yet." />
      </div>
    </div>
  );
}
