'use client';

import { useState, useMemo } from 'react';
import { ProductGallery } from '@/components/products/ProductGallery';
import { ProductInfoCard } from '@/components/products/ProductInfoCard';
import { AddToCartPanel } from '@/components/products/AddToCartPanel';
import { VariantSelector } from '@/components/products/VariantSelector';
import { ProductDetail, ProductVariant, getVariantFinalPrice } from '@/Type/product';
import { formatCurrency } from '@/utils/validators';

interface Props {
  product: ProductDetail;
  /** Base gallery images from the server (used as fallback when no variant images exist). */
  baseGallery: string[];
}

export function ProductDetailClient({ product, baseGallery }: Props) {
  const hasVariants = (product.variants?.length ?? 0) > 0;

  // Auto-select first active variant on mount (if variants exist)
  const firstActiveVariant = useMemo<ProductVariant | null>(
    () => (hasVariants ? (product.variants!.find((v) => v.isActive) ?? null) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [product._id],
  );

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(firstActiveVariant);

  // ── Derived display values ─────────────────────────────────────────────────

  /** Images shown in the gallery — variant-specific when available, base otherwise. */
  const activeImages: string[] | undefined =
    selectedVariant && selectedVariant.images.length > 0 ? selectedVariant.images : undefined;

  /** The price shown prominently in the PDP. */
  const displayPrice = selectedVariant ? getVariantFinalPrice(selectedVariant) : product.finalPrice;

  /** Original price shown struck-through when a sale price applies. */
  const originalPrice =
    selectedVariant &&
    selectedVariant.salePrice !== undefined &&
    selectedVariant.salePrice < selectedVariant.price
      ? selectedVariant.price
      : null;

  /** Effective discount badge — 0 when using variants (VariantSelector handles sale display). */
  const discountBadge = hasVariants ? 0 : product.discount;

  return (
    <div className="flex flex-col lg:flex-row gap-16 mb-24">
      {/* ── Gallery ──────────────────────────────────────────────────────────── */}
      <ProductGallery
        images={baseGallery}
        activeImages={activeImages}
        productName={product.name}
        discount={discountBadge}
      />

      {/* ── Info column ──────────────────────────────────────────────────────── */}
      <div className="w-full lg:w-1/2">
        <h1 className="text-4xl md:text-5xl font-serif text-primary mb-4">{product.name}</h1>

        {/* Price display */}
        <div className="flex items-baseline gap-3 mb-6">
          <span className="text-4xl font-bold text-primary">{formatCurrency(displayPrice)}</span>
          {originalPrice && (
            <span className="text-xl text-muted-foreground line-through">
              {formatCurrency(originalPrice)}
            </span>
          )}
        </div>

        {/* Variant selector — only shown when variants exist */}
        {hasVariants && (
          <div className="mb-6">
            <VariantSelector
              variants={product.variants!}
              onVariantChange={setSelectedVariant}
              initialVariantId={firstActiveVariant?._id}
            />
          </div>
        )}

        <ProductInfoCard product={product} />

        <AddToCartPanel
          product={product}
          selectedVariantId={selectedVariant?._id}
          variantStock={selectedVariant?.stock}
        />
      </div>
    </div>
  );
}
