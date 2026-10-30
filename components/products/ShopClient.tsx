'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Filter, ChevronDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { productService } from '@/services/productService';
import { categoryService } from '@/services/categoryService';
import { ProductGrid } from '@/components/products/ProductGrid';
import { FilterSidebar } from '@/components/products/FilterSidebar';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Product, ProductFilter, SortOption, getProductPriceInfo } from '@/Type/product';
import { CatalogCategory } from '@/Type/category';
import { formatCurrency } from '@/utils/validators';

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'featured', label: 'Featured' },
  { id: 'newest', label: 'Newest' },
  { id: 'price-asc', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' },
  { id: 'name-asc', label: 'Name: A to Z' },
];

interface ShopClientProps {
  initialProducts?: Product[];
  initialCatalog?: CatalogCategory[];
}

function ShopContent({ initialProducts = [], initialCatalog = [] }: ShopClientProps) {
  usePageTitle('Shop All Furniture');
  const searchParams = useSearchParams();
  const router = useRouter();

  const [allProducts, setAllProducts] = useState<Product[]>(initialProducts);
  const [catalog, setCatalog] = useState<CatalogCategory[]>(initialCatalog);
  // Always start as false (not loading) — products are passed as SSR props.
  // Set to true only on client if props are empty, after mount.
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const selectedCategory = searchParams.get('category') ?? '';
  const selectedSubCategory = searchParams.get('subcategory') ?? '';
  const search = searchParams.get('q') ?? '';
  const maxPriceParam = searchParams.get('maxPrice');
  const inStockOnly = searchParams.get('inStock') === 'true';
  const onSaleOnly = searchParams.get('onSale') === 'true';
  const sortBy = (searchParams.get('sort') as SortOption) || 'featured';

  // Use 0 as initial price so SSR and CSR agree; real value set in useEffect after mount
  const [priceRange, setPriceRange] = useState<number>(0);

  // Fetch products if not provided by SSR (client-only)
  useEffect(() => {
    if (initialProducts.length > 0 && initialCatalog.length > 0) return;
    let mounted = true;
    setIsLoading(true);
    (async () => {
      try {
        const [products, tree] = await Promise.all([
          productService.getAllProducts(),
          categoryService.getCatalogTree(),
        ]);
        if (!mounted) return;
        setAllProducts(products);
        setCatalog(tree);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Could not load products.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') params.delete(key);
      else params.set(key, value);
    });
    const qs = params.toString();
    router.push(qs ? `/shop?${qs}` : '/shop');
  }

  function updateParam(key: string, value: string | null) {
    updateParams({ [key]: value });
  }

  const maxPossiblePrice =
    allProducts.length > 0 ? Math.max(...allProducts.map((p) => getProductPriceInfo(p).max)) : 500000;

  // Sync priceRange with URL param or maxPossiblePrice — client-only to avoid mismatch
  useEffect(() => {
    if (maxPriceParam) {
      setPriceRange(Number(maxPriceParam));
    } else if (allProducts.length > 0) {
      setPriceRange(maxPossiblePrice);
    } else {
      setPriceRange(500000);
    }
  }, [allProducts.length, maxPossiblePrice, maxPriceParam]);

  const filter: ProductFilter = {
    categoryId: selectedCategory || undefined,
    subCategoryId: selectedSubCategory || undefined,
    search: search || undefined,
    maxPrice: maxPriceParam ? Number(maxPriceParam) : undefined,
    inStock: inStockOnly || undefined,
    onSale: onSaleOnly || undefined,
    sortBy,
  };

  const filteredProducts = productService.applyFilters(allProducts, filter);

  // If subcategory is active without explicit category in URL, resolve its parent category
  const parentCategoryOfSub = selectedSubCategory
    ? catalog.find((c) => c.subCategories?.some((s) => s._id === selectedSubCategory))
    : undefined;

  const effectiveCategoryId = selectedCategory || parentCategoryOfSub?._id || '';

  const selectedCategoryName = catalog.find((c) => c._id === effectiveCategoryId)?.name;
  const selectedSubCategoryName = catalog
    .flatMap((c) => c.subCategories || [])
    .find((s) => s._id === selectedSubCategory)?.name;

  const activeFilterCount =
    (selectedCategory ? 1 : 0) +
    (selectedSubCategory ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (onSaleOnly ? 1 : 0) +
    (maxPriceParam ? 1 : 0);

  function clearAll() {
    router.push('/shop');
    setPriceRange(maxPossiblePrice);
  }

  return (
    <div className="pb-20">
      <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 py-16 md:py-24 rounded-b-[3rem] mb-12">
        <div className="container mx-auto px-6 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-6xl font-serif text-primary mb-6">
            Our Collection
          </motion.h1>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex items-center justify-center gap-2 text-sm text-muted-foreground font-medium uppercase tracking-wider">
            <span>Home</span>
            <span>/</span>
            <span className="text-primary">Shop</span>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="lg:hidden flex items-center justify-between mb-4">
            <button onClick={() => setIsFilterOpen(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-medium">
              <Filter size={18} />
              Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>
          </div>

          <AnimatePresence>
            {isFilterOpen && (
              <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsFilterOpen(false)} />
            )}
          </AnimatePresence>

          <FilterSidebar
            catalog={catalog}
            selectedCategory={effectiveCategoryId}
            selectedSubCategory={selectedSubCategory}
            priceRange={priceRange || maxPossiblePrice}
            maxPossiblePrice={maxPossiblePrice}
            inStockOnly={inStockOnly}
            onSaleOnly={onSaleOnly}
            isLoading={isLoading}
            isMobileOpen={isFilterOpen}
            onCloseMobile={() => setIsFilterOpen(false)}
            onSelectCategory={(id) => updateParams({ category: id, subcategory: null })}
            onSelectSubCategory={(subId, catId) => {
              updateParams({
                category: catId ?? null,
                subcategory: subId,
              });
            }}
            onPriceChange={setPriceRange}
            onPriceCommit={(price) => updateParam('maxPrice', String(price))}
            onToggleInStock={() => updateParam('inStock', inStockOnly ? null : 'true')}
            onToggleOnSale={() => updateParam('onSale', onSaleOnly ? null : 'true')}
            onClearAll={clearAll}
          />

          <div className="flex-1">
            <div className="flex flex-col md:flex-row justify-between items-center bg-card p-4 rounded-3xl soft-shadow mb-8 gap-4">
              <div className="text-sm font-medium text-muted-foreground">
                Showing <span className="text-primary">{filteredProducts.length}</span> results
              </div>

              <div className="relative w-full md:w-64">
                <button onClick={() => setIsSortOpen(!isSortOpen)} className="w-full flex items-center justify-between bg-muted/50 px-4 py-3 rounded-2xl text-sm font-medium text-primary">
                  <span>Sort by: {SORT_OPTIONS.find((o) => o.id === sortBy)?.label}</span>
                  <ChevronDown size={16} />
                </button>
                <AnimatePresence>
                  {isSortOpen && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full mt-2 w-full bg-card rounded-2xl shadow-xl border border-border overflow-hidden z-20">
                      {SORT_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => {
                            updateParam('sort', opt.id === 'featured' ? null : opt.id);
                            setIsSortOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 text-sm hover:bg-muted transition-colors ${sortBy === opt.id ? 'font-bold text-primary' : 'text-muted-foreground'}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {selectedCategory && (
                  <span className="bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-full flex items-center gap-1">
                    {selectedCategoryName || 'Category'}
                    <X size={12} className="cursor-pointer" onClick={() => updateParams({ category: null, subcategory: null })} />
                  </span>
                )}
                {selectedSubCategory && (
                  <span className="bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-full flex items-center gap-1">
                    {selectedSubCategoryName || 'Subcategory'}
                    <X size={12} className="cursor-pointer" onClick={() => updateParam('subcategory', null)} />
                  </span>
                )}
                {maxPriceParam && (
                  <span className="bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-full flex items-center gap-1">
                    Up to {formatCurrency(Number(maxPriceParam))}
                    <X size={12} className="cursor-pointer" onClick={() => updateParam('maxPrice', null)} />
                  </span>
                )}
                {inStockOnly && (
                  <span className="bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-full flex items-center gap-1">
                    In Stock <X size={12} className="cursor-pointer" onClick={() => updateParam('inStock', null)} />
                  </span>
                )}
                {onSaleOnly && (
                  <span className="bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-full flex items-center gap-1">
                    Sale <X size={12} className="cursor-pointer" onClick={() => updateParam('onSale', null)} />
                  </span>
                )}
                <button onClick={clearAll} className="text-sm font-medium text-accent hover:underline ml-2">
                  Clear All
                </button>
              </div>
            )}

            {error && <p className="text-center text-destructive mb-8">{error}</p>}

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="aspect-[4/5] bg-muted animate-pulse rounded-3xl"></div>
                ))}
              </div>
            ) : (
              <ProductGrid products={filteredProducts} columns={3} emptyMessage="No products match your filters." />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ShopClient(props: ShopClientProps) {
  return (
    <Suspense fallback={<div className="py-32 text-center text-muted-foreground">Loading…</div>}>
      <ShopContent {...props} />
    </Suspense>
  );
}
