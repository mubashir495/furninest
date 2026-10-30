'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CatalogCategory } from '@/Type/category';

interface CategoryListProps {
  catalog: CatalogCategory[];
}

export function CategoryList({ catalog }: CategoryListProps) {
  return (
    <div className="pb-20">
      <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 py-16 md:py-24 rounded-b-[3rem] mb-12">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-serif text-primary mb-6">Browse Categories</h1>
        </div>
      </div>

      <div className="container mx-auto px-6">
        {catalog.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">No categories available yet.</p>
        ) : (
          <div className="space-y-16">
            {catalog.map((category, idx) => {
              const image =
                category.image ||
                category.subCategories.flatMap((sc) => sc.products).find((p) => p.thumbnailImage)?.thumbnailImage ||
                '/window.svg';
              const href = category.slug ? `/category/${category.slug}` : '/shop';
              return (
                <motion.div
                  key={category._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link
                    href={href}
                    className="group flex flex-col md:flex-row gap-6 items-center bg-card rounded-3xl soft-shadow overflow-hidden"
                  >
                    <div className="w-full md:w-64 h-48 md:h-40 shrink-0 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image}
                        alt={category.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/window.svg';
                        }}
                      />
                    </div>
                    <div className="flex-1 p-6">
                      <h2 className="text-2xl font-serif text-primary mb-2 group-hover:text-accent transition-colors">
                        {category.name}
                      </h2>
                      {category.description && (
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      )}
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
