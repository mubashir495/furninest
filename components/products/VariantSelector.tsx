'use client';

import { useState, useEffect } from 'react';
import {
  ProductVariant,
  getAvailableConfigs,
  getAvailableColors,
  findVariant,
} from '@/Type/product';

interface Props {
  variants: ProductVariant[];
  onVariantChange: (variant: ProductVariant | null) => void;
  initialVariantId?: string;
}

export function VariantSelector({ variants, onVariantChange, initialVariantId }: Props) {
  const configs = getAvailableConfigs(variants);

  const initialVariant = initialVariantId
    ? variants.find((v) => v._id === initialVariantId && v.isActive)
    : undefined;

  const [selectedConfig, setSelectedConfig] = useState<string>(
    initialVariant?.configName ?? configs[0] ?? '',
  );
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    initialVariant?.colorName ??
      getAvailableColors(variants, initialVariant?.configName ?? configs[0])[0]?.colorName,
  );

  // Sync if selectedConfig is no longer valid
  useEffect(() => {
    if (configs.length > 0 && !configs.includes(selectedConfig)) {
      const nextConfig = configs[0];
      setSelectedConfig(nextConfig);
      const colorsForConfig = getAvailableColors(variants, nextConfig);
      setSelectedColor(colorsForConfig[0]?.colorName);
    }
  }, [configs, selectedConfig, variants]);

  const colorVariants = getAvailableColors(variants, selectedConfig);
  const hasColors = colorVariants.length > 0;
  const directMatch = selectedConfig ? findVariant(variants, selectedConfig, selectedColor) : null;
  const activeVariant =
    directMatch ??
    (selectedConfig ? variants.find((v) => v.isActive && v.configName === selectedConfig) ?? null : null);

  useEffect(() => {
    if (activeVariant && activeVariant.colorName !== selectedColor) {
      setSelectedColor(activeVariant.colorName);
    }
  }, [activeVariant, selectedColor]);

  useEffect(() => {
    onVariantChange(activeVariant ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeVariant?._id]);

  const handleConfigSelect = (config: string) => {
    setSelectedConfig(config);
    const colorsForConfig = getAvailableColors(variants, config);
    const stillValid = colorsForConfig.some((v) => v.colorName === selectedColor);
    if (!stillValid) {
      setSelectedColor(colorsForConfig[0]?.colorName);
    }
  };

  if (!configs.length) return null;

  return (
    <div className="flex flex-col gap-5">
      {/* ── Configuration pills ─────────────────────────────────────────── */}
      <div>
        <p className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
          Choose Configuration
        </p>
        <div className="flex flex-wrap gap-2">
          {configs.map((config) => {
            const isSelected = selectedConfig === config;
            const configVariants = variants.filter((v) => v.isActive && v.configName === config);
            const isOutOfStock = configVariants.length > 0 && configVariants.every((v) => v.stock <= 0);

            return (
              <button
                key={config}
                type="button"
                onClick={() => handleConfigSelect(config)}
                aria-pressed={isSelected}
                className={`px-4 py-2 rounded-full text-[13px] font-medium border transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : isOutOfStock
                      ? 'bg-surface text-muted-foreground border-border hover:border-primary opacity-60'
                      : 'bg-surface text-foreground border-border hover:border-primary'
                }`}
              >
                {config}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Colour swatches ─────────────────────────────────────────────── */}
      {hasColors && (
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
            Choose Color
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {colorVariants.map((v) => {
              const isSelected = selectedColor === v.colorName;
              const oos = v.stock <= 0;
              return (
                <button
                  key={v._id}
                  type="button"
                  onClick={() => !oos && setSelectedColor(v.colorName!)}
                  disabled={oos}
                  aria-pressed={isSelected}
                  aria-label={`${v.colorName}${oos ? ' — out of stock' : ''}`}
                  className={`flex items-center gap-1.5 transition-all ${oos ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span
                    className={`relative w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-primary ring-2 ring-primary ring-offset-1 ring-offset-surface'
                        : 'border-border ring-1 ring-border'
                    }`}
                    style={{ backgroundColor: v.colorHex ?? v.colorName ?? '#ccc' }}
                  >
                    {oos && (
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white/70" stroke="currentColor" strokeWidth="2.5">
                        <line x1="5" y1="5" x2="19" y2="19" />
                      </svg>
                    )}
                  </span>
                  {v.colorName && (
                    <span className={`text-[12px] ${isSelected ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                      {v.colorName}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── No combo warning ─────────────────────────────────────────────── */}
      {selectedConfig && !activeVariant && (
        <p className="text-[12px] text-destructive">
          This combination is not available. Please choose a different option.
        </p>
      )}
    </div>
  );
}
