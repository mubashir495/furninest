'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCartStore } from '@/store/cartStore';
import { useAuth } from '@/context/AuthContext';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function WishlistPage() {
  usePageTitle('Wishlist');
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { items, isLoading, hasLoaded, fetchWishlist, remove } = useWishlistStore();
  const addToCart = useCartStore((s) => s.addItem);

  useEffect(() => {
    if (isAuthenticated && !hasLoaded) fetchWishlist();
  }, [isAuthenticated, hasLoaded, fetchWishlist]);

  if (authLoading) return null;

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-4xl font-serif text-primary mb-4">Log in to view your wishlist</h1>
        <Link href="/auth/login" className="bg-primary text-primary-foreground px-10 py-4 rounded-2xl font-bold uppercase tracking-wider hover:bg-accent hover:text-accent-foreground transition-colors">
          Log In
        </Link>
      </div>
    );
  }

  if (isLoading && !hasLoaded) {
    return (
      <div className="pt-32 pb-20 text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
        <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center mb-8">
          <Heart size={48} className="text-muted-foreground" />
        </div>
        <h1 className="text-4xl font-serif text-primary mb-4">Your wishlist is empty</h1>
        <p className="text-muted-foreground text-lg mb-8 max-w-md">Save pieces you love to find them here later.</p>
        <Link href="/shop" className="bg-primary text-primary-foreground px-10 py-4 rounded-2xl font-bold uppercase tracking-wider hover:bg-accent hover:text-accent-foreground transition-colors">
          Continue Shopping
        </Link>
      </div>
    );
  }

  async function handleAddToCart(productId: string, name: string) {
    if (!isAuthenticated) return;
    try {
      await addToCart(productId, 1);
      toast.success(`${name} added to cart`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not add to cart.');
    }
  }

  async function handleRemove(productId: string) {
    try {
      await remove(productId);
      toast.success('Removed from wishlist');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not remove item.');
    }
  }

  return (
    <div className="pt-12 pb-24 container mx-auto px-6">
      <h1 className="text-4xl md:text-5xl font-serif text-primary mb-12">Your Wishlist</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, i) => (
          <motion.div
            key={item._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card rounded-3xl soft-shadow overflow-hidden flex flex-col"
          >
            <Link href={`/product/${item.product.slug}`} className="relative aspect-[4/5] block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.product.thumbnailImage || '/window.svg'} alt={item.product.name} className="w-full h-full object-cover" />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleRemove(item.product._id);
                }}
                className="absolute top-4 right-4 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
              >
                <X size={16} />
              </button>
            </Link>
            <div className="p-5 flex flex-col flex-1">
              <Link href={`/product/${item.product.slug}`}>
                <h3 className="font-serif text-lg font-semibold text-primary hover:text-accent transition-colors mb-2">
                  {item.product.name}
                </h3>
              </Link>
              <div className="text-lg font-bold text-primary mb-4">Rs {item.product.price.toLocaleString()}</div>
              <button
                onClick={() => handleAddToCart(item.product._id, item.product.name)}
                disabled={item.product.stock === 0}
                className="mt-auto w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-2xl font-medium text-sm hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50"
              >
                <ShoppingCart size={16} />
                {item.product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
