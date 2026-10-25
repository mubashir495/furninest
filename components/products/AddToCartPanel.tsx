'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Heart, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuth } from '@/context/AuthContext';
import { QuantitySelector } from '@/components/ui/QuantitySelector';
import { ProductDetail, hasVariants as productHasVariants } from '@/Type/product';

interface AddToCartPanelProps {
  product: ProductDetail;
  /**
   * When the product has variants, pass the selected variant's `_id` here.
   * If the product has variants but none is selected yet, the button is
   * disabled with a "Please select a configuration" message.
   */
  selectedVariantId?: string;
  /** Stock for the selected variant (overrides product-level stock when provided). */
  variantStock?: number;
}

export function AddToCartPanel({ product, selectedVariantId, variantStock }: AddToCartPanelProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const isWishlisted = useWishlistStore((s) => s.isInWishlist(product._id));

  const hasVariants = productHasVariants(product);

  // Effective stock: prefer variant stock when available, fall back to product-level stock
  const effectiveStock = variantStock !== undefined ? variantStock : product.stock;

  // Keep quantity valid when the customer switches to a variant with less stock
  useEffect(() => {
    setQuantity((q) => Math.max(1, Math.min(q, effectiveStock > 0 ? effectiveStock : 1)));
  }, [effectiveStock, selectedVariantId]);

  const needsVariantSelection = hasVariants && !selectedVariantId;
  const outOfStock = effectiveStock === 0 && !needsVariantSelection;
  const isDisabled = needsVariantSelection || outOfStock || isAdding || isBuyingNow;

  const buttonLabel = (() => {
    if (needsVariantSelection) return 'Please select a configuration';
    if (outOfStock) return 'Out of Stock';
    if (isAdding) return 'Adding…';
    return 'Add to Cart';
  })();

  const requireAuth = () => {
    toast.info('Please log in to continue.');
    router.push('/auth/login');
  };

  const handleAddToCart = async () => {
    if (hasVariants && !selectedVariantId) {
      toast.info('Please select a configuration.');
      return;
    }
    if (!isAuthenticated) { requireAuth(); return; }
    setIsAdding(true);
    try {
      await addItem(product._id, quantity, hasVariants ? selectedVariantId : undefined);
      toast.success(`${quantity}× ${product.name} added to cart`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not add to cart.';
      // Surface the real backend error; a generic "Internal server error" hints
      // at a DB index conflict — advise the user to try again or contact support.
      if (msg.toLowerCase().includes('internal server error')) {
        toast.error('Something went wrong on the server. Please try again in a moment.');
      } else {
        toast.error(msg);
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (hasVariants && !selectedVariantId) {
      toast.info('Please select a configuration.');
      return;
    }
    if (!isAuthenticated) { requireAuth(); return; }
    setIsBuyingNow(true);
    try {
      await addItem(product._id, quantity, hasVariants ? selectedVariantId : undefined);
      router.push('/checkout');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not add to cart.';
      if (msg.toLowerCase().includes('internal server error')) {
        toast.error('Something went wrong on the server. Please try again in a moment.');
      } else {
        toast.error(msg);
      }
      setIsBuyingNow(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 mt-6">
      {/* Quantity + Add to Cart row */}
      <div className="flex items-center gap-3">
        <QuantitySelector
          quantity={quantity}
          onIncrease={() => setQuantity((q) => Math.min(effectiveStock, q + 1))}
          onDecrease={() => setQuantity((q) => Math.max(1, q - 1))}
          max={effectiveStock}
          className="h-12 rounded-xl border-border"
        />
        <button
          onClick={handleAddToCart}
          disabled={isDisabled}
          className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground h-12 rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:pointer-events-none"
        >
          <ShoppingBag size={17} />
          {buttonLabel}
        </button>
        {/* Wishlist heart */}
        <button
          onClick={() => toggleWishlist(product._id)}
          aria-pressed={isWishlisted}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`h-12 w-12 shrink-0 flex items-center justify-center rounded-xl border transition-colors ${
            isWishlisted
              ? 'bg-accent/10 border-accent text-accent'
              : 'border-border text-foreground hover:border-accent hover:text-accent'
          }`}
        >
          <Heart size={18} className={isWishlisted ? 'fill-current' : ''} />
        </button>
      </div>

      {/* Buy Now */}
      {!outOfStock && !needsVariantSelection && (
        <button
          onClick={handleBuyNow}
          disabled={isDisabled}
          className="w-full h-12 rounded-xl font-bold text-sm border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50 disabled:pointer-events-none"
        >
          {isBuyingNow ? 'Processing…' : 'Buy Now'}
        </button>
      )}
    </div>
  );
}
