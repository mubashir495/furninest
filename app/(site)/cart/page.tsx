'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useCartStore } from '@/store/cartStore';
import { useAuth } from '@/context/AuthContext';
import { QuantitySelector } from '@/components/ui/QuantitySelector';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function CartPage() {
  usePageTitle('Shopping Cart');
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { cart, isLoading, error, hasLoaded, fetchCart, updateItem, removeItem, clearCart } = useCartStore();

  useEffect(() => {
    if (isAuthenticated && !hasLoaded) fetchCart();
  }, [isAuthenticated, hasLoaded, fetchCart]);

  if (authLoading) return null;

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-4xl font-serif text-primary mb-4">Log in to view your cart</h1>
        <p className="text-muted-foreground text-lg mb-8 max-w-md">Sign in to see items you&apos;ve added.</p>
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

  const items = cart?.items ?? [];

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
        <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center mb-8">
          <ShoppingBag size={48} className="text-muted-foreground" />
        </div>
        <h1 className="text-4xl font-serif text-primary mb-4">Your bag is empty</h1>
        <p className="text-muted-foreground text-lg mb-8 max-w-md">Looks like you haven&apos;t added any pieces to your bag yet.</p>
        <Link href="/shop" className="bg-primary text-primary-foreground px-10 py-4 rounded-2xl font-bold uppercase tracking-wider hover:bg-accent hover:text-accent-foreground transition-colors">
          Continue Shopping
        </Link>
      </div>
    );
  }

  const savings = items.reduce((sum, i) => sum + (i.product.price - i.price) * i.quantity, 0);

  async function handleUpdate(productId: string, quantity: number) {
    if (quantity < 1) return;
    try {
      await updateItem(productId, quantity);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update quantity.');
    }
  }

  async function handleRemove(productId: string) {
    try {
      await removeItem(productId);
      toast.success('Item removed');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not remove item.');
    }
  }

  async function handleClear() {
    try {
      await clearCart();
      toast.success('Cart cleared');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not clear cart.');
    }
  }

  return (
    <div className="pt-12 pb-24 container mx-auto px-6">
      <h1 className="text-4xl md:text-5xl font-serif text-primary mb-12">Shopping Bag</h1>
      {error && <p className="text-destructive mb-6">{error}</p>}

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="w-full lg:w-2/3">
          <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-border text-sm font-bold uppercase tracking-wider text-muted-foreground mb-6">
            <div className="col-span-6">Product</div>
            <div className="col-span-3 text-center">Quantity</div>
            <div className="col-span-2 text-right">Total</div>
            <div className="col-span-1"></div>
          </div>

          <div className="space-y-6">
            {items.map((item, i) => (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                key={item._id}
                className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-6 bg-card rounded-3xl soft-shadow"
              >
                <div className="col-span-1 md:col-span-6 flex items-center gap-6">
                  <Link href={`/product/${item.product.slug}`} className="shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.product.thumbnailImage || '/window.svg'} alt={item.product.name} className="w-24 h-24 object-cover rounded-2xl" />
                  </Link>
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-primary hover:text-accent transition-colors">
                      <Link href={`/product/${item.product.slug}`}>{item.product.name}</Link>
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">Rs {item.price.toLocaleString()} each</p>
                    {!item.product.isActive && <p className="text-xs text-destructive mt-1">No longer available</p>}
                  </div>
                </div>

                <div className="col-span-1 md:col-span-3 flex justify-start md:justify-center">
                  <QuantitySelector
                    quantity={item.quantity}
                    onIncrease={() => handleUpdate(item.product._id, item.quantity + 1)}
                    onDecrease={() => handleUpdate(item.product._id, item.quantity - 1)}
                    max={item.product.stock}
                    className="h-10 rounded-xl"
                  />
                </div>

                <div className="col-span-1 md:col-span-2 text-left md:text-right font-bold text-lg text-primary">
                  Rs {item.subtotal.toLocaleString()}
                </div>

                <div className="col-span-1 flex justify-end">
                  <button
                    onClick={() => handleRemove(item.product._id)}
                    className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 flex justify-between">
            <button onClick={handleClear} className="text-muted-foreground hover:text-primary underline font-medium">
              Clear Bag
            </button>
          </div>
        </div>

        <div className="w-full lg:w-1/3">
          <div className="bg-primary text-primary-foreground p-8 rounded-3xl sticky top-32">
            <h2 className="text-2xl font-serif mb-8">Order Summary</h2>

            <div className="space-y-4 mb-8 text-white/80">
              <div className="flex justify-between">
                <span>Items ({cart?.totalItems ?? 0})</span>
                <span className="font-medium text-white">Rs {(cart?.totalPrice ?? 0).toLocaleString()}</span>
              </div>
              {savings > 0 && (
                <div className="flex justify-between text-accent">
                  <span>You&apos;re saving</span>
                  <span className="font-medium">Rs {savings.toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="border-t border-white/20 pt-6 mb-8 flex justify-between items-end">
              <span className="text-lg">Total</span>
              <span className="text-4xl font-bold font-serif text-accent">Rs {(cart?.totalPrice ?? 0).toLocaleString()}</span>
            </div>

            <Link href="/checkout" className="w-full bg-accent text-accent-foreground flex items-center justify-center gap-2 py-4 rounded-2xl font-bold uppercase tracking-wider hover:bg-white transition-colors">
              Checkout <ArrowRight size={18} />
            </Link>

            <p className="text-center text-white/50 text-xs mt-6">Shipping details are collected at checkout.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
