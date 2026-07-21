'use client';

import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, EffectFade, Autoplay } from 'swiper/modules';
import Link from 'next/link';
import { ProductCarousel } from '@/components/products/ProductCarousel';
import { TrustBadges } from '@/components/comman/TrustBadges';
import { usePageTitle } from '@/hooks/usePageTitle';
import { productService } from '@/services/productService';
import { categoryService } from '@/services/categoryService';
import { Product } from '@/Type/product';
import { CatalogCategory } from '@/Type/category';
import { motion } from 'framer-motion';

import { useTheme } from '@/context/ThemeContext';
import { ThemeMode } from '@/Type/theme';
import { Sun, Moon, MonitorCog, Palette } from 'lucide-react';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const heroSlides = [
  {
    image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1600&q=80',
    eyebrow: 'The Autumn Collection',
    title: 'Tactile Textures',
    subtitle: 'Warm tones and luxurious materials for the changing season.',
    link: '/shop',
    cta: 'Shop the Collection',
  },
  {
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1600&q=80',
    eyebrow: 'Handcrafted Heritage',
    title: 'Timeless Craft',
    subtitle: 'Where traditional craftsmanship meets contemporary design.',
    link: '/shop',
    cta: 'Discover More',
  },
  {
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1600&q=80',
    eyebrow: 'Sanctuary Spaces',
    title: 'Restful Retreats',
    subtitle: 'Create a bedroom that promotes restful sleep and deep relaxation.',
    link: '/shop',
    cta: 'Shop Bedroom',
  },
];

export default function Home() {
  usePageTitle('Premium Furniture & Homeware');

  const [catalog, setCatalog] = useState<CatalogCategory[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const { mode, setMode, customTheme, setCustomTheme } = useTheme();

  useEffect(() => {
    let mounted = true;
    (async () => {
      setIsLoading(true);
      try {
        const [tree, products] = await Promise.all([
          categoryService.getCatalogTree(),
          productService.getAllProducts(),
        ]);
        if (!mounted) return;
        setCatalog(tree);
        setAllProducts(products);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Could not load the store.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const newArrivals = [...allProducts]
    .sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime())
    .slice(0, 12);

  const onSale = allProducts.filter((p) => p.discount > 0).slice(0, 12);

  const totalProducts = allProducts.length;

  const themeOptions: { label: string; value: ThemeMode; icon: React.ReactNode }[] = [
    { label: 'Light', value: 'light', icon: <Sun size={16} /> },
    { label: 'Dark', value: 'dark', icon: <Moon size={16} /> },
    { label: 'System', value: 'system', icon: <MonitorCog size={16} /> },
    { label: 'Custom', value: 'custom', icon: <Palette size={16} /> },
  ];

  return (
    <div className="w-full flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[100dvh] w-full bg-primary -mt-24">
        <Swiper
          modules={[Navigation, Pagination, EffectFade, Autoplay]}
          effect="fade"
          speed={1500}
          autoplay={{ delay: 6000, disableOnInteraction: false }}
          pagination={{ clickable: true, bulletClass: 'swiper-bullet-custom', bulletActiveClass: 'swiper-bullet-custom-active' }}
          className="w-full h-screen"
        >
          {heroSlides.map((slide, index) => (
            <SwiperSlide key={index} className="w-full h-full relative">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 z-10" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 z-20 flex items-center justify-center md:justify-start px-6 md:px-24">
                <div className="max-w-2xl text-center md:text-left pt-20">
                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="text-accent text-sm md:text-base uppercase tracking-[0.3em] font-semibold mb-6"
                  >
                    {slide.eyebrow}
                  </motion.p>
                  <motion.h1
                    initial={{ y: 30, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-5xl md:text-7xl lg:text-8xl font-bold font-serif text-white mb-6 leading-[1.1]"
                  >
                    {slide.title}
                  </motion.h1>
                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-lg md:text-2xl text-white/80 mb-10 font-light max-w-lg mx-auto md:mx-0"
                  >
                    {slide.subtitle}
                  </motion.p>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
                  >
                    <Link
                      href={slide.link}
                      className="bg-white text-primary px-8 py-4 rounded-2xl font-bold hover:bg-accent hover:text-accent-foreground transition-colors text-center text-sm tracking-wider uppercase"
                    >
                      {slide.cta}
                    </Link>
                  </motion.div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="absolute bottom-8 right-8 z-30 hidden md:block">
          <div className="glass dark:glass-dark p-3 rounded-2xl shadow-xl border border-white/10 backdrop-blur-md bg-white/10 dark:bg-black/30">
            <div className="flex flex-col gap-2">
              {themeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setMode(opt.value)}
                  className={`p-2 rounded-xl transition-all text-sm flex items-center gap-2 ${
                    mode === opt.value ? 'bg-accent text-accent-foreground shadow-md' : 'hover:bg-white/20 dark:hover:bg-white/10 text-white/80 hover:text-white'
                  }`}
                  title={opt.label}
                >
                  {opt.icon}
                  <span className="hidden lg:inline text-xs font-medium">{opt.label}</span>
                </button>
              ))}
              {mode === 'custom' && (
                <div className="border-t border-white/20 pt-2 mt-1">
                  <label className="flex items-center gap-2 text-xs text-white/70 cursor-pointer">
                    <Palette size={14} />
                    <input
                      type="color"
                      value={customTheme.primary}
                      onChange={(e) => setCustomTheme({ ...customTheme, primary: e.target.value })}
                      className="w-6 h-6 p-0 border-0 rounded cursor-pointer bg-transparent"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="w-full bg-primary py-8 border-y border-white/10">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap justify-center md:justify-between items-center gap-8 md:gap-4 text-white/80 text-sm tracking-widest uppercase font-semibold text-center divide-x-0 md:divide-x divide-white/20">
            <div className="w-full md:w-auto px-4">{totalProducts > 0 ? `${totalProducts}+ Products` : 'Curated Collection'}</div>
            <div className="w-full md:w-auto px-4">Nationwide Delivery</div>
            <div className="w-full md:w-auto px-4">Quality Guaranteed</div>
            <div className="w-full md:w-auto px-4">Easy Returns</div>
          </div>
        </div>
      </section>

      <TrustBadges />

      {error && (
        <div className="container mx-auto px-6 py-6">
          <p className="text-center text-destructive">{error}</p>
        </div>
      )}

      {/* Shop by Category */}
      <section className="py-24 md:py-32 container mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif text-primary mb-6">Shop by Category</h2>
          <div className="w-24 h-1 bg-accent mx-auto rounded-full"></div>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-square bg-muted animate-pulse rounded-3xl"></div>
            ))}
          </div>
        ) : catalog.length === 0 ? (
          <p className="text-center text-muted-foreground">No categories yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {catalog.slice(0, 4).map((category, index) => {
              const productCount = category.subCategories.reduce((sum, sc) => sum + sc.products.length, 0);
              const image =
                category.subCategories.flatMap((sc) => sc.products).find((p) => p.thumbnailImage)?.thumbnailImage ||
                '/window.svg';
              return (
                <motion.div
                  key={category._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Link href={`/category/${category.slug}`} className="group block relative overflow-hidden aspect-square rounded-3xl">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 transition-opacity duration-300 group-hover:opacity-90" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image} alt={category.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute bottom-6 left-6 z-20">
                      <h3 className="text-white font-serif text-2xl mb-1 group-hover:text-accent transition-colors">{category.name}</h3>
                      <p className="text-white/70 text-sm font-medium">{productCount} Products</p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* New Arrivals */}
      {!isLoading && newArrivals.length > 0 && (
        <section className="py-24 bg-muted/50">
          <div className="container mx-auto px-6">
            <ProductCarousel products={newArrivals} title="New Arrivals" viewAllLink="/shop?sort=newest" />
          </div>
        </section>
      )}

      {/* On Sale */}
      {!isLoading && onSale.length > 0 && (
        <section className="py-24 bg-primary text-primary-foreground">
          <div className="container mx-auto px-6">
            <div className="mb-12">
              <h2 className="text-4xl md:text-5xl font-serif mb-4">On Sale Now</h2>
              <p className="text-white/70 text-lg">Quality pieces at reduced prices, while stock lasts.</p>
            </div>
            <ProductCarousel products={onSale} viewAllLink="/shop?onSale=true" />
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className="py-32 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(200,169,106,0.15)_0%,transparent_70%)]"></div>
        <div className="container mx-auto px-6 relative z-10 text-center max-w-3xl">
          <h2 className="text-4xl md:text-5xl font-serif mb-6">Join the Inner Circle</h2>
          <p className="text-white/70 text-lg mb-10">Subscribe to receive updates on new collections and offers.</p>
          <form
            className="flex flex-col sm:flex-row gap-4 justify-center"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="Your email address"
              className="bg-white/10 border border-white/20 text-white placeholder:text-white/50 px-6 py-4 rounded-2xl w-full sm:w-96 focus:outline-none focus:border-accent transition-colors"
              required
            />
            <button type="submit" className="bg-accent text-accent-foreground font-bold px-8 py-4 rounded-2xl hover:bg-white transition-colors uppercase tracking-wider text-sm">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
