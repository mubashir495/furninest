'use client';

import React from 'react';
import { Product } from '@/Type/product';
import { ProductCard } from './ProductCard';
import { motion } from 'framer-motion';

interface ProductGridProps {
  products: Product[];
  columns?: 2 | 3 | 4;
  emptyMessage?: string;
}

// Static class lookup — Tailwind can't see interpolated `grid-cols-${n}` at build time.
const GRID_CLASSES: Record<number, string> = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
};

export function ProductGrid({ products, columns = 3, emptyMessage }: ProductGridProps) {
  const container = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };

  const item = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  if (products.length === 0) {
    return (
      <div className="w-full py-16 text-center text-muted-foreground">
        {emptyMessage ?? 'No products found matching your criteria.'}
      </div>
    );
  }

  return (
    <motion.div className={`grid gap-6 ${GRID_CLASSES[columns]}`} variants={container} initial="hidden" animate="visible">
      {products.map((product) => (
        <motion.div key={product._id} variants={item}>
          <ProductCard product={product} />
        </motion.div>
      ))}
    </motion.div>
  );
}
