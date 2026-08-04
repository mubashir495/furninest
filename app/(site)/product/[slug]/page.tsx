import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProductBySlug, getAllProductSlugs } from '@/lib/data/products';
import { getCategoryName, suggestionToProduct } from '@/Type/product';
import { ProductGallery } from '@/components/products/ProductGallery';
import { ProductInfoCard } from '@/components/products/ProductInfoCard';
import { AddToCartPanel } from '@/components/products/AddToCartPanel';
import { ProductTabs } from '@/components/products/ProductTabs';
import { ProductCarousel } from '@/components/products/ProductCarousel';
import Link from 'next/link';
import { formatCurrency } from '@/utils/validators';

export const revalidate = 60;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const slugs = await getAllProductSlugs({ limit: 200 });
  return slugs.map((slug: string) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug); // de-duped by React `cache()`
  if (!product) return { title: 'Product not found' };

  const description = (product.shortDescription ?? product.longDescription ?? '').slice(0, 155);
  return {
    title: `${product.name} | FurniNest`,
    description,
    alternates: { canonical: `/product/${slug}` },
    openGraph: {
      title: product.name,
      description,
      images: product.thumbnailImage ? [{ url: product.thumbnailImage }] : [],
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title: product.name, description },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const gallery = product.images.length > 0 ? product.images : [product.thumbnailImage].filter(Boolean);
  const categoryName = getCategoryName(product);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: gallery,
    description: product.shortDescription,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'GBP',
      price: product.finalPrice,
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `https://furninest.example.com/product/${slug}`,
    },
  };

  return (
    <div className="pt-4 pb-24">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="container mx-auto px-6">
        <nav aria-label="Breadcrumb" className="text-sm mb-8">
          <Link href="/">Home</Link> / <Link href="/shop">Shop</Link>
          {categoryName && (
            <>
              {' '}
              / <span className="text-primary">{categoryName}</span>
            </>
          )}
        </nav>

        <div className="flex flex-col lg:flex-row gap-16 mb-24">
          <ProductGallery images={gallery} productName={product.name} discount={product.discount} />
          <div className="w-full lg:w-1/2">
            <h1 className="text-4xl md:text-5xl font-serif text-primary mb-4">{product.name}</h1>
            {/* static price/stock markup rendered on the server — good for SEO/rich snippets */}
            <p className="text-4xl font-bold text-primary mb-8">{formatCurrency(product.finalPrice)}</p>
            <ProductInfoCard product={product} />
            <AddToCartPanel product={product} />
          </div>
        </div>

        <ProductTabs description={product.longDescription ?? product.shortDescription} categoryName={categoryName} stock={product.stock} />

        {product.suggestions?.length > 0 && (
          <ProductCarousel products={product.suggestions.map(suggestionToProduct)} title="You May Also Like" />
        )}
      </div>
    </div>
  );
}