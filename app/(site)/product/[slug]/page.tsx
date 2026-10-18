import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProductBySlug } from '@/lib/data/products';
import { getCategoryName, suggestionToProduct } from '@/Type/product';
import { ProductDetailClient } from '@/components/products/ProductDetailClient';
import { ProductTabs } from '@/components/products/ProductTabs';
import { ProductCarousel } from '@/components/products/ProductCarousel';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Product not found' };

  const description = (product.shortDescription ?? product.longDescription ?? '').slice(0, 155);
  return {
    title: `${product.name} | LUXA FURNITURE`,
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

  const baseGallery =
    product.images.length > 0 ? product.images : [product.thumbnailImage].filter(Boolean) as string[];
  const categoryName = getCategoryName(product);

  // JSON-LD: use the first available variant price if variants exist, otherwise finalPrice
  const seoPrice =
    product.variants && product.variants.length > 0
      ? (product.variants.find((v) => v.isActive)?.salePrice ??
         product.variants.find((v) => v.isActive)?.price ??
         product.finalPrice)
      : product.finalPrice;

  const seoInStock =
    product.variants && product.variants.length > 0
      ? product.variants.some((v) => v.isActive && v.stock > 0)
      : product.stock > 0;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: baseGallery,
    description: product.shortDescription,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'GBP',
      price: seoPrice,
      availability: seoInStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://luxafurniture.co.uk'}/product/${slug}`,
    },
  };

  return (
    <div className="pt-4 pb-24">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="container mx-auto px-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-sm mb-8">
          <Link href="/">Home</Link> / <Link href="/shop">Shop</Link>
          {categoryName && (
            <>
              {' '}
              / <span className="text-primary">{categoryName}</span>
            </>
          )}
        </nav>

        {/*
          ProductDetailClient is the client island.
          It owns: variant selection state, gallery/price sync, and the Add-to-Cart button.
          Server-rendered portions (JSON-LD, breadcrumb, tabs, carousel) remain above/below.
        */}
        <ProductDetailClient product={product} baseGallery={baseGallery} />

        <ProductTabs
          description={product.longDescription ?? product.shortDescription}
          categoryName={categoryName}
          stock={product.stock}
        />

        {product.suggestions?.length > 0 && (
          <ProductCarousel
            products={product.suggestions.map(suggestionToProduct)}
            title="You May Also Like"
          />
        )}
      </div>
    </div>
  );
}