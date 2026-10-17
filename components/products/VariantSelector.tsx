'use client';

import { useState, useEffect } from 'react';
import {
  ProductVariant,
  getAvailableConfigs,
  getAvailableColors,
  findVariant,
  getVariantFinalPrice,
} from '@/Type/product';
import { formatCurrency } from '@/utils/validators';

interface Props {
  variants: ProductVariant[];
  onVariantChange: (variant: ProductVariant | null) => void;
  initialVariantId?: string;
}

export function VariantSelector({ variants, onVariantChange, initialVariantId }: Props) {
  const configs = getAvailableConfigs(variants);

  // Determine initial config from initialVariantId if provided
  const initialVariant = initialVariantId
    ? variants.find((v) => v._id === initialVariantId && v.isActive)
    : undefined;

  const [selectedConfig, setSelectedConfig] = useState<string>(
    initialVariant?.configName ?? configs[0] ?? ''
  );
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    initialVariant?.colorName ?? getAvailableColors(variants, initialVariant?.configName ?? configs[0])[0]?.colorName
  );

  // Derive colors for the current config
  const colorVariants = getAvailableColors(variants, selectedConfig);
  const hasColors = colorVariants.length > 0;

  // Resolve the active variant
  const activeVariant = selectedConfig
    ? findVariant(variants, selectedConfig, selectedColor)
    : null;

  // Notify parent whenever the active variant changes
  useEffect(() => {
    onVariantChange(activeVariant ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeVariant?._id]);

  const handleConfigSelect = (config: string) => {
    setSelectedConfig(config);
    // Reset color to first available for this config
    const firstColor = getAvailableColors(variants, config)[0]?.colorName;
    setSelectedColor(firstColor);
  };

  const handleColorSelect = (colorName: string) => {
    setSelectedColor(colorName);
  };

  if (!configs.length) return null;

  // Stock status label
  const stockLabel = (variant: ProductVariant | null | undefined) => {
    if (!variant) return null;
    if (variant.stock <= 0) return <span className="text-destructive font-medium">Out of Stock</span>;
    if (variant.stock <= 5)
      return <span className="text-amber-600 font-medium">Low Stock ({variant.stock} left)</span>;
    return <span className="text-green-600 font-medium">In Stock</span>;
  };

  const finalPrice = activeVariant ? getVariantFinalPrice(activeVariant) : null;
  const isOnSale =
    activeVariant &&
    activeVariant.salePrice !== undefined &&
    activeVariant.salePrice < activeVariant.price;

  return (
    <div className="flex flex-col gap-5 py-4 border-t border-border">
      {/* Config Tabs */}
      <div>
        <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
          Configuration
        </span>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Select configuration">
          {configs.map((config) => {
            const isSelected = selectedConfig === config;
            return (
              <button
                key={config}
                type="button"
                onClick={() => handleConfigSelect(config)}
                aria-pressed={isSelected}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                  isSelected
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-transparent text-foreground border-border hover:border-accent'
                }`}
              >
                {config}
              </button>
            );
          })}
        </div>
      </div>

      {/* Color Swatches */}
      {hasColors && (
        <div>
          <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
            Colour{selectedColor ? ` — ${selectedColor}` : ''}
          </span>
          <div className="flex flex-wrap gap-3" role="group" aria-label="Select colour">
            {colorVariants.map((v) => {
              const isSelected = selectedColor === v.colorName;
              const isOutOfStock = v.stock <= 0;
              return (
                <button
                  key={v._id}
                  type="button"
                  onClick={() => !isOutOfStock && handleColorSelect(v.colorName!)}
                  aria-pressed={isSelected}
                  aria-label={`${v.colorName}${isOutOfStock ? ' — out of stock' : ''}`}
                  title={v.colorName}
                  disabled={isOutOfStock}
                  className={`relative h-9 w-9 rounded-full border-2 transition-all flex items-center justify-center ${
                    isOutOfStock
                      ? 'opacity-30 cursor-not-allowed border-border'
                      : isSelected
                      ? 'border-primary scale-110 ring-2 ring-primary ring-offset-2'
                      : 'border-border hover:border-accent'
                  }`}
                  style={{ backgroundColor: v.colorHex ?? v.colorName }}
                >
                  {isOutOfStock && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <svg
                        viewBox="0 0 24 24"
                        className="w-5 h-5 text-muted-foreground/60"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <line x1="4" y1="4" x2="20" y2="20" />
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Variant Info */}
      {activeVariant && (
        <div className="flex flex-col gap-2 p-4 rounded-2xl bg-muted/50 border border-border">
          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold text-primary">
              {finalPrice !== null ? formatCurrency(finalPrice) : '—'}
            </span>
            {isOnSale && (
              <span className="text-base text-muted-foreground line-through">
                {formatCurrency(activeVariant.price)}
              </span>
            )}
          </div>

          {/* Stock status */}
          <div className="text-sm">{stockLabel(activeVariant)}</div>

          {/* SKU */}
          {activeVariant.sku && (
            <p className="text-xs text-muted-foreground">
              SKU: <span className="font-mono">{activeVariant.sku}</span>
            </p>
          )}

          {/* Extra attributes */}
          {activeVariant.dimensions && (
            <p className="text-xs text-muted-foreground">Dimensions: {activeVariant.dimensions}</p>
          )}
          {activeVariant.material && (
            <p className="text-xs text-muted-foreground">Material: {activeVariant.material}</p>
          )}
        </div>
      )}

      {/* No matching variant warning */}
      {selectedConfig && !activeVariant && (
        <p className="text-sm text-muted-foreground">
          This combination is currently unavailable.
        </p>
      )}
    </div>
  );
}
