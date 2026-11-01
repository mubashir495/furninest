import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  getSubCategoryBySlug,
  getProductsBySubCategory,
} from '@/lib/data/categories';
import { ProductGrid } from '@/components/products/ProductGrid';
import { Category } from '@/Type/category';

export const revalidate = 3600; // ISR: 1-hour caching
export const dynamicParams = true;

const siteUrl = 'https://luxafurniture.com';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const subCategory = await getSubCategoryBySlug(slug);
  if (!subCategory) return { title: 'Subcategory Not Found | Luxa Furniture' };

  const title = `${subCategory.name} | Luxa Furniture`;
  const description = `Shop luxury ${subCategory.name} furniture at Luxa Furniture. Handcrafted designs and premium home furnishings.`;
  const imageUrl = `${siteUrl}/logo.png`;

  return {
    title,
    description,
    alternates: { canonical: `/subcategory/${slug}` },
    openGraph: {
      type: 'website',
      url: `${siteUrl}/subcategory/${slug}`,
      siteName: 'Luxa Furniture',
      title,
      description,
      locale: 'en_PK',
      images: [
        {
          url: imageUrl,
          width: 512,
          height: 512,
          alt: subCategory.name,
        },
      ],
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function SubCategoryPage({ params }: Props) {
  const { slug } = await params;
  const subCategory = await getSubCategoryBySlug(slug);
  if (!subCategory) notFound();

  const products = await getProductsBySubCategory(subCategory._id);
  const parentCategory =
    typeof subCategory.category === 'string'
      ? null
      : (subCategory.category as Category | undefined);

  return (
    <div className="pb-20">
      <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 py-16 md:py-24 rounded-b-[3rem] mb-12">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-serif text-primary mb-6">
            {subCategory.name}
          </h1>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground font-medium uppercase tracking-wider">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span>/</span>
            {parentCategory && (
              <>
                <Link
                  href={`/category/${parentCategory.slug}`}
                  className="hover:text-primary transition-colors"
                >
                  {parentCategory.name}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-primary">{subCategory.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6">
        <div className="text-sm font-medium text-muted-foreground mb-6">
          <span className="text-primary">{products.length}</span> products
        </div>
        <ProductGrid products={products} columns={3} emptyMessage="No products in this subcategory yet." />
      </div>
    </div>
  );
}
