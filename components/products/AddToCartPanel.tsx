'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Heart, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuth } from '@/context/AuthContext';
import { QuantitySelector } from '@/components/ui/QuantitySelector';
import { ProductDetail } from '@/Type/product';

interface AddToCartPanelProps {
  product: ProductDetail;
  /**
   * When the product has variants, pass the selected variant's `_id` here.
   * If the product has variants but none is selected yet, the button will be
   * disabled with a "Please select a configuration" message.
   */
  selectedVariantId?: string;
  /** Stock for the selected variant (overrides product-level stock when provided). */
  variantStock?: number;
}

export function AddToCartPanel({ product, selectedVariantId, variantStock }: AddToCartPanelProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const isWishlisted = useWishlistStore((s) => s.isInWishlist(product._id));

  const hasVariants = (product.variants?.length ?? 0) > 0;

  // Effective stock: prefer variant stock when available, fall back to product-level stock
  const effectiveStock = variantStock !== undefined ? variantStock : product.stock;

  // Button disabled states
  const needsVariantSelection = hasVariants && !selectedVariantId;
  const outOfStock = effectiveStock === 0 && !needsVariantSelection;
  const isDisabled = needsVariantSelection || outOfStock || isAdding;

  const buttonLabel = (() => {
    if (needsVariantSelection) return 'Please select a configuration';
    if (outOfStock) return 'Out of Stock';
    if (isAdding) return 'Adding…';
    return 'Add to Cart';
  })();

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.info('Please log in to add items to your cart.');
      router.push('/auth/login');
      return;
    }
    setIsAdding(true);
    try {
      await addItem(product._id, quantity, selectedVariantId);
      toast.success(`${quantity}× ${product.name} added to cart`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not add to cart.');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mt-6">
      <QuantitySelector
        quantity={quantity}
        onIncrease={() => setQuantity((q) => Math.min(effectiveStock, q + 1))}
        onDecrease={() => setQuantity((q) => Math.max(1, q - 1))}
        max={effectiveStock}
        className="h-14 rounded-2xl border-border px-1 sm:w-36 justify-between"
      />
      <button
        onClick={handleAddToCart}
        disabled={isDisabled}
        className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground h-14 rounded-2xl font-bold uppercase tracking-wider text-sm hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-primary/10"
      >
        <ShoppingBag size={18} />
        {buttonLabel}
      </button>
      <button
        onClick={() => toggleWishlist(product._id)}
        aria-pressed={isWishlisted}
        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        className={`h-14 w-14 shrink-0 flex items-center justify-center rounded-2xl border transition-colors ${
          isWishlisted
            ? 'bg-accent/10 border-accent text-accent'
            : 'border-border text-foreground hover:border-accent hover:text-accent'
        }`}
      >
        <Heart size={20} className={isWishlisted ? 'fill-current' : ''} />
      </button>
    </div>
  );
}