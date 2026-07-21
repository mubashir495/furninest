'use client';

import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { CatalogCategory } from '@/Type/category';

interface FilterSidebarProps {
  catalog: CatalogCategory[];
  selectedCategory: string;
  selectedSubCategory: string;
  priceRange: number;
  maxPossiblePrice: number;
  inStockOnly: boolean;
  onSaleOnly: boolean;
  isLoading?: boolean;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onSelectCategory: (categoryId: string | null) => void;
  onSelectSubCategory: (subCategoryId: string | null) => void;
  onPriceChange: (price: number) => void;
  onPriceCommit: (price: number) => void;
  onToggleInStock: () => void;
  onToggleOnSale: () => void;
  onClearAll: () => void;
}

export function FilterSidebar({
  catalog,
  selectedCategory,
  selectedSubCategory,
  priceRange,
  maxPossiblePrice,
  inStockOnly,
  onSaleOnly,
  isLoading,
  isMobileOpen,
  onCloseMobile,
  onSelectCategory,
  onSelectSubCategory,
  onPriceChange,
  onPriceCommit,
  onToggleInStock,
  onToggleOnSale,
  onClearAll,
}: FilterSidebarProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Auto-expand the category that owns the currently selected subcategory
  useEffect(() => {
    if (selectedCategory) {
      setExpandedId(selectedCategory);
    }
  }, [selectedCategory]);

  const hasActiveFilters = !!(selectedCategory || inStockOnly || onSaleOnly || priceRange < maxPossiblePrice);

  return (
    <div
      className={`fixed lg:static inset-y-0 left-0 z-50 lg:z-0 w-80 lg:w-72 bg-card lg:bg-transparent p-6 lg:p-0 overflow-y-auto lg:overflow-visible shadow-2xl lg:shadow-none transition-transform lg:transition-none ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      <div className="flex items-center justify-between lg:hidden mb-8">
        <h3 className="text-2xl font-serif text-primary">Filters</h3>
        <button onClick={onCloseMobile} className="p-2 bg-muted rounded-full">
          <X size={20} />
        </button>
      </div>

      <div className="bg-card p-6 rounded-3xl soft-shadow lg:sticky lg:top-28 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-primary">Filters</h3>
          {hasActiveFilters && (
            <button onClick={onClearAll} className="text-sm font-medium text-accent hover:underline">
              Clear All
            </button>
          )}
        </div>

        <div className="h-px bg-border" />

        {/* Categories accordion */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Categories</h4>

          <button
            onClick={onClearAll}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors mb-1 ${
              !selectedCategory ? 'bg-muted text-primary font-bold' : 'text-muted-foreground hover:bg-muted/60'
            }`}
          >
            All Products
          </button>

          {isLoading ? (
            <div className="space-y-2 mt-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-9 bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {catalog.map((cat) => {
                const isExpanded = expandedId === cat._id;
                const isCategorySelected = selectedCategory === cat._id && !selectedSubCategory;

                return (
                  <div key={cat._id}>
                    <button
                      onClick={() => {
                        setExpandedId(isExpanded ? null : cat._id);
                        onSelectCategory(cat._id);
                        onSelectSubCategory(null);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                        isCategorySelected ? 'bg-muted text-primary font-bold' : 'text-foreground hover:bg-muted/60'
                      }`}
                    >
                      <span>{cat.name}</span>
                      {cat.subCategories.length > 0 &&
                        (isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />)}
                    </button>

                    {isExpanded && cat.subCategories.length > 0 && (
                      <div className="pl-4 mt-1 space-y-1 border-l border-border ml-3">
                        {cat.subCategories.map((sub) => (
                          <button
                            key={sub._id}
                            onClick={() => {
                              onSelectCategory(cat._id);
                              onSelectSubCategory(selectedSubCategory === sub._id ? null : sub._id);
                            }}
                            className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                              selectedSubCategory === sub._id
                                ? 'text-accent font-semibold'
                                : 'text-muted-foreground hover:text-primary'
                            }`}
                          >
                            {sub.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              {catalog.length === 0 && !isLoading && (
                <p className="text-sm text-muted-foreground px-3">No categories yet.</p>
              )}
            </div>
          )}
        </div>

        <div className="h-px bg-border" />

        {/* Price Range */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Price Range</h4>
          <input
            type="range"
            min={0}
            max={maxPossiblePrice || 500000}
            step={100}
            value={priceRange}
            onChange={(e) => onPriceChange(Number(e.target.value))}
            onMouseUp={() => onPriceCommit(priceRange)}
            onTouchEnd={() => onPriceCommit(priceRange)}
            className="w-full accent-primary h-2 bg-muted rounded-full appearance-none"
          />
          <div className="flex justify-between mt-3 text-sm font-medium text-muted-foreground">
            <span>Rs 0</span>
            <span>Rs {priceRange.toLocaleString()}</span>
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* Availability — kept as requested */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Availability</h4>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                className={`w-10 h-6 rounded-full p-1 transition-colors ${inStockOnly ? 'bg-primary' : 'bg-muted'}`}
                onClick={onToggleInStock}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${inStockOnly ? 'translate-x-4' : ''}`}></div>
              </div>
              <span className="text-sm font-medium text-muted-foreground">In Stock Only</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                className={`w-10 h-6 rounded-full p-1 transition-colors ${onSaleOnly ? 'bg-primary' : 'bg-muted'}`}
                onClick={onToggleOnSale}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${onSaleOnly ? 'translate-x-4' : ''}`}></div>
              </div>
              <span className="text-sm font-medium text-muted-foreground">Sale Items</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
