import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getProductBySlug, getAllProductSlugs } from '@/lib/data/products';
import {
  getCategoryName,
  getTotalStock,
  getVariantFinalPrice,
} from '@/Type/product';
import { ProductDetailClient } from '@/components/products/ProductDetailClient';
import { ProductTabs } from '@/components/products/ProductTabs';
import { PromoBanner } from '@/components/products/PromoBanner';

export const revalidate = 3600; // ISR: 1-hour caching
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs({ limit: 50 });
  return slugs.map((slug) => ({ slug }));
}

const siteUrl = 'https://luxafurniture.com';

function toAbsoluteUrl(url?: string | null): string {
  if (!url) return `${siteUrl}/logo.png`;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${siteUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Product Not Found | Luxa Furniture' };

  const title = product.seoTitle || `${product.name} | Luxa Furniture`;
  const description = (
    product.seoDescription ||
    product.shortDescription ||
    product.longDescription ||
    `Explore ${product.name} at Luxa Furniture. Luxury craftsmanship, elegant design, and premium comfort for your home.`
  ).slice(0, 170);

  const rawImage = product.thumbnailImage || product.images?.[0];
  const imageUrl = toAbsoluteUrl(rawImage);
  const isFallback = !rawImage;

  return {
    title,
    description,
    alternates: { canonical: `/product/${slug}` },
    openGraph: {
      type: 'website',
      url: `${siteUrl}/product/${slug}`,
      siteName: 'Luxa Furniture',
      title,
      description,
      locale: 'en_PK',
      images: [
        {
          url: imageUrl,
          width: isFallback ? 512 : 1200,
          height: isFallback ? 512 : 630,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: isFallback ? 'summary' : 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  // Build baseGallery: thumbnail first (if it's not already in images), then product images
  // This ensures the gallery is always populated and thumbnail acts as a fallback.
  const rawImages = product.images ?? [];
  const thumb = product.thumbnailImage || '';
  const baseGallery: string[] = (() => {
    if (rawImages.length > 0) {
      // Prepend thumbnail only if it's not already the first image
      if (thumb && !rawImages.includes(thumb)) {
        return [thumb, ...rawImages];
      }
      return rawImages;
    }
    return thumb ? [thumb] : [];
  })();

  const categoryName = getCategoryName(product);

  /* ── JSON-LD ────────────────────────────────────────────────── */
  const firstActive = product.variants?.find((v) => v.isActive);
  const seoPrice = firstActive ? getVariantFinalPrice(firstActive) : product.finalPrice;
  const seoInStock = getTotalStock(product) > 0;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    brand: {
      '@type': 'Brand',
      name: 'LUXA FURNITURE',
    },
    image: baseGallery,
    description: product.shortDescription,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'GBP',
      price: seoPrice,
      availability: seoInStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `${process.env.NEXT_PUBLIC_SITE_URL ?? siteUrl}/product/${slug}`,
    },
  };

  return (
    /* Extra bottom padding on mobile for the sticky Add-to-Cart bar */
    <div className="pb-24 lg:pb-12">
      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 pt-6">
        {/* ── Breadcrumb ─────────────────────────────────────────── */}
        <nav
          aria-label="Breadcrumb"
          className="text-[13px] text-muted-foreground mb-6 flex items-center gap-1.5 flex-wrap"
        >
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span className="text-border">›</span>
          <Link
            href={categoryName ? `/shop?category=${encodeURIComponent(categoryName)}` : '/shop'}
            className="hover:text-foreground transition-colors"
          >
            {categoryName || 'Sofas'}
          </Link>
          <span className="text-border">›</span>
          <span className="text-foreground font-medium">{product.name}</span>
        </nav>

        {/* ── Main 3-col product block ───────────────────────────── */}
        <ProductDetailClient product={product} baseGallery={baseGallery} />

        {/* ── Tabs (Description / Specs / Care / Reviews) ────────── */}
        <ProductTabs
          description={product.longDescription ?? product.shortDescription}
          categoryName={categoryName}
          stock={getTotalStock(product)}
          material={product.material}
          dimensions={product.dimensions}
          careInstructions={product.careInstructions}
          features={product.features}
          specifications={product.specifications}
          gallery={baseGallery}
          suggestions={product.suggestions ?? []}
          reviewsCount={124}
        />

        {/* ── Promo banner ───────────────────────────────────────── */}
        <PromoBanner />
      </div>
    </div>
  );
}
