'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  Product,
  getCategoryName,
  getProductGallery,
  getProductInStock,
  getProductPriceInfo,
  getColorSwatches,
  hasVariants,
} from '@/Type/product';
import { useCartStore } from '@/store/cartStore';
import { useAuth } from '@/context/AuthContext';
import { QuantitySelector } from '@/components/ui/QuantitySelector';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/utils/validators';

interface QuickViewModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const addItem = useCartStore((s) => s.addItem);

  const gallery = getProductGallery(product);
  const info = getProductPriceInfo(product);
  const variantMode = hasVariants(product);
  const inStock = getProductInStock(product);
  const onSale = info.original !== null;

  const handleAddToCart = async () => {
    if (variantMode) {
      onClose();
      router.push(`/product/${product.slug}`);
      return;
    }
    if (!isAuthenticated) {
      toast.info('Please log in to add items to your cart.');
      onClose();
      router.push('/auth/login');
      return;
    }
    setIsAdding(true);
    try {
      await addItem(product._id, quantity);
      toast.success(`${quantity}x ${product.name} added to cart`);
      onClose();
      setTimeout(() => {
        setQuantity(1);
        setCurrentImage(0);
      }, 300);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not add to cart.');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-background rounded-3xl border-none">
        <DialogTitle className="sr-only">{product.name}</DialogTitle>
        <DialogDescription className="sr-only">{product.shortDescription}</DialogDescription>

        <div className="flex flex-col md:flex-row h-full max-h-[80vh]">
          {/* Image Gallery */}
          <div className="w-full md:w-1/2 bg-muted relative">
            <div className="absolute top-4 left-4 z-10 flex gap-2">
              {onSale && (
                <span className="bg-accent text-accent-foreground text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full">
                  -{info.discountPct}%
                </span>
              )}
            </div>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={gallery[currentImage] || '/window.svg'}
              alt={product.name}
              className="w-full h-full object-cover aspect-square md:aspect-auto"
            />

            {gallery.length > 1 && (
              <div className="absolute bottom-4 left-0 w-full flex justify-center gap-2 px-4">
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImage(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${
                      currentImage === idx ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="w-full md:w-1/2 p-8 flex flex-col overflow-y-auto relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X size={24} />
            </button>

            <div className="mb-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              {getCategoryName(product)}
            </div>
            <h2 className="text-3xl font-serif text-primary mb-2 leading-tight pr-8">{product.name}</h2>

            <div className="text-2xl font-bold text-primary mb-6 flex items-center gap-3">
              {(info.from || variantMode) && <span className="text-sm font-medium text-muted-foreground">From</span>}
              {formatCurrency(info.price)}
              {onSale && <span className="text-lg line-through text-muted-foreground">{formatCurrency(info.original as number)}</span>}
            </div>

            <p className="text-muted-foreground text-sm mb-6 leading-relaxed line-clamp-3">{product.shortDescription}</p>

            {variantMode && getColorSwatches(product).length > 0 && (
              <div className="flex items-center gap-1.5 mb-8" aria-label="Available colours">
                {getColorSwatches(product).slice(0, 8).map((s) => (
                  <span
                    key={s.name}
                    title={s.name}
                    className="h-5 w-5 rounded-full border border-border"
                    style={{ backgroundColor: s.hex }}
                  />
                ))}
              </div>
            )}

            <div className="mt-auto pt-6 border-t border-border">
              <div className="flex gap-4">
                <div className={variantMode ? 'hidden' : 'w-32'}>
                  <QuantitySelector
                    quantity={quantity}
                    onIncrease={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    onDecrease={() => setQuantity((q) => Math.max(1, q - 1))}
                    max={product.stock}
                    className="h-12 rounded-xl"
                  />
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={!inStock || isAdding}
                  className="flex-1 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50"
                >
                  {!inStock ? 'Out of Stock' : variantMode ? 'Choose options' : isAdding ? 'Adding…' : 'Add to Cart'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}