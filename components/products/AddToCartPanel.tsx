'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuth } from '@/context/AuthContext';
import { QuantitySelector } from '@/components/ui/QuantitySelector';
import { ProductDetail } from '@/Type/product';

export function AddToCartPanel({ product }: { product: ProductDetail }) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const isWishlisted = useWishlistStore((s) => s.isInWishlist(product._id));

  const handleAddToCart = async () => {
    if (!isAuthenticated) { toast.info('Please log in to add items to your cart.'); router.push('/auth/login'); return; }
    setIsAdding(true);
    try {
      await addItem(product._id, quantity);
      toast.success(`${quantity}x ${product.name} added to cart`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not add to cart.');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <QuantitySelector quantity={quantity} onIncrease={() => setQuantity((q) => Math.min(product.stock, q + 1))}
        onDecrease={() => setQuantity((q) => Math.max(1, q - 1))} max={product.stock} />
      <button onClick={handleAddToCart} disabled={product.stock === 0 || isAdding}
        className="flex-1 bg-primary text-primary-foreground h-14 rounded-2xl font-bold disabled:opacity-50">
        {product.stock === 0 ? 'Out of Stock' : isAdding ? 'Adding…' : 'Add to Cart'}
      </button>
      <button onClick={() => toggleWishlist(product._id)} aria-pressed={isWishlisted}>
        {isWishlisted ? 'Saved' : 'Wishlist'}
      </button>
    </div>
  );
}