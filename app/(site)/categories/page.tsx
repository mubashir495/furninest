'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { categoryService } from '@/services/categoryService';
import { usePageTitle } from '@/hooks/usePageTitle';
import { CatalogCategory } from '@/Type/category';

export default function CategoriesPage() {
  usePageTitle('All Categories');
  const [catalog, setCatalog] = useState<CatalogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    categoryService
      .getCatalogTree()
      .then((data) => mounted && setCatalog(data))
      .catch((err) => mounted && setError(err instanceof Error ? err.message : 'Could not load categories.'))
      .finally(() => mounted && setIsLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="pb-20">
      <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 py-16 md:py-24 rounded-b-[3rem] mb-12">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-serif text-primary mb-6">Browse Categories</h1>
        </div>
      </div>

      <div className="container mx-auto px-6">
        {error && <p className="text-center text-destructive mb-8">{error}</p>}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-3xl"></div>
            ))}
          </div>
        ) : catalog.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">No categories available yet.</p>
        ) : (
          <div className="space-y-16">
            {catalog.map((category, idx) => {
             const image =
  category.image ||
  category.subCategories.flatMap((sc) => sc.products).find((p) => p.thumbnailImage)?.thumbnailImage ||
  '/window.svg';
              return (
                <motion.div key={category._id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.05 }}>
                  <Link href={`/category/${category.slug}`} className="group flex flex-col md:flex-row gap-6 items-center bg-card rounded-3xl soft-shadow overflow-hidden">
                    <div className="w-full md:w-64 h-48 md:h-40 shrink-0 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={image} alt={category.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    </div>
                    <div className="flex-1 p-6">
                      <h2 className="text-2xl font-serif text-primary mb-2 group-hover:text-accent transition-colors">{category.name}</h2>
                      <p className="text-sm text-muted-foreground mb-4">
                        {category.subCategories.reduce((sum, sc) => sum + sc.products.length, 0)} products across{' '}
                        {category.subCategories.length} subcategories
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {category.subCategories.slice(0, 6).map((sub) => (
                          <span key={sub._id} className="text-xs font-medium bg-muted px-3 py-1 rounded-full text-muted-foreground">
                            {sub.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
