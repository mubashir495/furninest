'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search as SearchIcon } from 'lucide-react';
import { productService } from '@/services/productService';
import { ProductGrid } from '@/components/products/ProductGrid';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Product } from '@/Type/product';

function SearchContent() {
  usePageTitle('Search');
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') ?? '';

  const [inputValue, setInputValue] = useState(query);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    productService
      .getAllProducts()
      .then((data) => mounted && setAllProducts(data))
      .catch((err) => mounted && setError(err instanceof Error ? err.message : 'Could not load products.'))
      .finally(() => mounted && setIsLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => setInputValue(query), [query]);

  const results = query ? productService.searchProducts(allProducts, query) : [];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(inputValue)}`);
  }

  return (
    <div className="pb-20 pt-8">
      <div className="container mx-auto px-6">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-12 relative">
          <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search for sofas, tables, decor…"
            className="w-full bg-card border border-border pl-14 pr-6 py-4 rounded-2xl text-lg soft-shadow focus:outline-none focus:border-primary transition-colors"
            autoFocus
          />
        </form>

        {error && <p className="text-center text-destructive mb-8">{error}</p>}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-[4/5] bg-muted animate-pulse rounded-3xl"></div>
            ))}
          </div>
        ) : query ? (
          <>
            <p className="text-center text-muted-foreground mb-8">
              <span className="text-primary font-semibold">{results.length}</span> results for &ldquo;{query}&rdquo;
            </p>
            <ProductGrid products={results} columns={3} emptyMessage="No products matched your search." />
          </>
        ) : (
          <p className="text-center text-muted-foreground">Start typing to search our collection.</p>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="py-32 text-center text-muted-foreground">Loading…</div>}>
      <SearchContent />
    </Suspense>
  );
}
