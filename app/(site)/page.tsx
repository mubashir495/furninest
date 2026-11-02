import { Suspense } from 'react';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { getAllProducts, getCatalogTree } from '@/lib/data/catalog';
import { HeroCarousel } from '@/components/home/HeroCarousel';
import { ThemeQuickSwitch } from '@/components/home/ThemeQuickSwitch';
import { TrustBadges } from '@/components/comman/TrustBadges';

// Lazy-load below-the-fold heavy carousel sections using next/dynamic
const CategoryCarousel = dynamic(
  () => import('@/components/home/CategoryCarousel').then((m) => m.CategoryCarousel),
  {
    loading: () => <div className="h-72 rounded-3xl bg-muted/40 animate-pulse" />,
  },
);

const ProductCarousel = dynamic(
  () => import('@/components/products/ProductCarousel').then((m) => m.ProductCarousel),
  {
    loading: () => <div className="h-96 rounded-3xl bg-muted/40 animate-pulse" />,
  },
);

const NewsletterForm = dynamic(
  () => import('@/components/home/NewsletterForm').then((m) => m.NewsletterForm),
  {
    loading: () => <div className="h-64 bg-primary" />,
  },
);

export const revalidate = 300; // ISR: 300 seconds (5 min) cache

export const metadata: Metadata = {
  title: {
    absolute: 'Luxa Furniture | Luxury Beds, Sofas & Dining Furniture',
  },
  description:
    'Discover premium handcrafted furniture at Luxa Furniture. Explore luxury dining tables, elegant sofas, bespoke beds, and contemporary home furniture collections.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: 'https://luxafurniture.com',
    siteName: 'Luxa Furniture',
    title: 'Luxa Furniture | Luxury Beds, Sofas & Dining Furniture',
    description:
      'Discover premium handcrafted furniture at Luxa Furniture. Explore luxury dining tables, elegant sofas, bespoke beds, and contemporary home furniture collections.',
    locale: 'en_PK',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'Luxa Furniture Logo',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Luxa Furniture | Luxury Beds, Sofas & Dining Furniture',
    description:
      'Discover premium handcrafted furniture at Luxa Furniture. Explore luxury dining tables, elegant sofas, bespoke beds, and contemporary home furniture collections.',
    images: ['/logo.png'],
  },
};

export default async function Home() {
  // Runs on the server, in parallel, cached by the Next.js Data Cache (revalidate: 300).
  const [catalog, allProducts] = await Promise.all([getCatalogTree(), getAllProducts()]);

  const newArrivals = [...allProducts]
    .sort((a, b) => +new Date(b.created_date) - +new Date(a.created_date))
    .slice(0, 12);
  const onSale = allProducts.filter((p) => p.discount > 0).slice(0, 12);

  return (
    <div className="w-full flex flex-col">
      <section className="relative min-h-[100dvh] w-full bg-primary -mt-24">
        {/* Swiper needs the DOM → isolated client island; hero image gets priority+LCP treatment inside it */}
        <HeroCarousel />
        <ThemeQuickSwitch />
      </section>

      <section className="w-full bg-primary py-8 border-y border-white/10">
        <div className="container mx-auto px-6 text-center text-white/90 text-sm uppercase tracking-widest font-medium">
          {allProducts.length > 0 ? `${allProducts.length}+ Products` : 'Curated Collection'}
        </div>
      </section>

      <TrustBadges />

      <section className="py-24 md:py-32 container mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-serif text-primary text-center mb-16">Shop by Category</h2>
        {catalog.length === 0 ? (
          <p className="text-center text-muted-foreground">No categories yet.</p>
        ) : (
          <CategoryCarousel catalog={catalog} />
        )}
      </section>

      {/* Suspense boundary lets the shell above stream immediately while carousels hydrate */}
      <Suspense fallback={<div className="h-96" />}>
        {newArrivals.length > 0 && (
          <section className="py-24 bg-muted/50">
            <div className="container mx-auto px-6">
              <ProductCarousel products={newArrivals} title="New Arrivals" viewAllLink="/shop?sort=newest" />
            </div>
          </section>
        )}
        {onSale.length > 0 && (
          <section className="py-24 bg-primary text-primary-foreground">
            <div className="container mx-auto px-6">
              <h2 className="text-4xl md:text-5xl font-serif mb-4">On Sale Now</h2>
              <ProductCarousel products={onSale} viewAllLink="/shop?onSale=true" />
            </div>
          </section>
        )}
      </Suspense>

      <NewsletterForm />
    </div>
  );
}
