'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { categoryService } from '@/services/categoryService';
import { productService } from '@/services/productService';
import { ProductGrid } from '@/components/products/ProductGrid';
import { usePageTitle } from '@/hooks/usePageTitle';
import { SubCategory, Category } from '@/Type/category';
import { Product } from '@/Type/product';

export default function SubCategoryPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const [subCategory, setSubCategory] = useState<SubCategory | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  usePageTitle(subCategory?.name ?? 'Subcategory');

  useEffect(() => {
    if (!slug) return;
    let mounted = true;
    setIsLoading(true);
    setError('');
    (async () => {
      try {
        const sub = await categoryService.getSubCategoryBySlug(slug);
        if (!mounted) return;
        setSubCategory(sub);
        const prods = await productService.getProductsBySubCategory(sub._id);
        if (!mounted) return;
        setProducts(prods);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Subcategory not found.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [slug]);

  if (isLoading) {
    return (
      <div className="pt-32 pb-20 text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  if (error || !subCategory) {
    return (
      <div className="pt-32 pb-20 text-center">
        <p className="text-lg text-destructive mb-4">{error || 'Subcategory not found.'}</p>
        <Link href="/shop" className="text-primary underline">Back to shop</Link>
      </div>
    );
  }

  const parentCategory = typeof subCategory.category === 'string' ? null : (subCategory.category as Category);

  return (
    <div className="pb-20">
      <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 py-16 md:py-24 rounded-b-[3rem] mb-12">
        <div className="container mx-auto px-6 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-6xl font-serif text-primary mb-6">
            {subCategory.name}
          </motion.h1>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground font-medium uppercase tracking-wider">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            {parentCategory && (
              <>
                <Link href={`/category/${parentCategory.slug}`} className="hover:text-primary transition-colors">
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
