'use client';

import { useState } from 'react';
import { Check, CircleCheck, CircleX, Tag, LayoutGrid, Award } from 'lucide-react';
import { Product, getCategoryName } from '@/Type/product';

// Curated hex fallbacks for common furniture/material color names that aren't
// valid CSS color keywords (e.g. "Walnut", "Charcoal"). Anything not listed
// here falls back to the raw name, which covers standard CSS colors like
// "Black", "White", "Red", "Navy", "Beige", etc.
const COLOR_HEX_MAP: Record<string, string> = {
  walnut: '#5C4033',
  oak: '#C9A66B',
  teak: '#B8875A',
  charcoal: '#36454F',
  espresso: '#3D2B1F',
  cream: '#F5EFE3',
  ivory: '#FFFFF0',
  sand: '#D9C7A3',
  taupe: '#8B7B6F',
  natural: '#D8C4A5',
  mahogany: '#4E2A1E',
};

function swatchColor(name: string): string {
  const key = name.trim().toLowerCase();
  return COLOR_HEX_MAP[key] ?? key;
}

export function ProductInfoCard({ product }: { product: Product }) {
  const [selectedColor, setSelectedColor] = useState<string | undefined>(product.color?.[0]);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(product.size?.[0]);

  const categoryName = getCategoryName(product);
  const inStock = product.stock > 0;

  return (
    <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 soft-shadow flex flex-col gap-6">
      {product.shortDescription && (
        <p className="text-muted-foreground leading-relaxed">{product.shortDescription}</p>
      )}

      {(product.color?.length || product.size?.length) && <div className="h-px bg-border" />}

      {product.color && product.color.length > 0 && (
        <div>
          <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
            Color{selectedColor ? ` — ${selectedColor}` : ''}
          </span>
          <div className="flex flex-wrap gap-3">
            {product.color.map((c) => {
              const isSelected = selectedColor === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  aria-pressed={isSelected}
                  aria-label={c}
                  title={c}
                  className={`relative h-9 w-9 rounded-full border-2 transition-all flex items-center justify-center ${
                    isSelected ? 'border-primary scale-110' : 'border-border hover:border-accent'
                  }`}
                  style={{ backgroundColor: swatchColor(c) }}
                >
                  {isSelected && (
                    <Check
                      size={14}
                      className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]"
                      style={{ color: '#fff' }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {product.size && product.size.length > 0 && (
        <div>
          <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Size</span>
          <div className="flex flex-wrap gap-2">
            {product.size.map((s) => {
              const isSelected = selectedSize === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedSize(s)}
                  aria-pressed={isSelected}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-transparent text-foreground border-border hover:border-accent'
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="h-px bg-border" />

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-muted/50">
          {inStock ? (
            <CircleCheck size={18} className="text-green-600 shrink-0" />
          ) : (
            <CircleX size={18} className="text-destructive shrink-0" />
          )}
          <div className="min-w-0">
            <dt className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Availability</dt>
            <dd className="text-sm font-semibold text-foreground truncate">
              {inStock ? `In Stock (${product.stock} Available)` : 'Out of Stock'}
            </dd>
          </div>
        </div>

        {product.sku && (
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-muted/50">
            <Tag size={18} className="text-accent shrink-0" />
            <div className="min-w-0">
              <dt className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">SKU</dt>
              <dd className="text-sm font-semibold text-foreground truncate">{product.sku}</dd>
            </div>
          </div>
        )}

        {categoryName && (
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-muted/50">
            <LayoutGrid size={18} className="text-accent shrink-0" />
            <div className="min-w-0">
              <dt className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Category</dt>
              <dd className="text-sm font-semibold text-foreground truncate">{categoryName}</dd>
            </div>
          </div>
        )}

        {product.brand && (
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-muted/50">
            <Award size={18} className="text-accent shrink-0" />
            <div className="min-w-0">
              <dt className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Brand</dt>
              <dd className="text-sm font-semibold text-foreground truncate">{product.brand}</dd>
            </div>
          </div>
        )}
      </dl>
    </div>
  );
}