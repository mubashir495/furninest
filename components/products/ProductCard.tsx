'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart } from 'lucide-react';
import { Product, getCategoryName } from '@/Type/product';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuth } from '@/context/AuthContext';
import { QuickViewModal } from './QuickViewModal';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

function isNewProduct(createdDate: string) {
  const days = (Date.now() - new Date(createdDate).getTime()) / (1000 * 60 * 60 * 24);
  return days <= 14;
}

export function ProductCard({ product }: { product: Product }) {
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const isWishlisted = useWishlistStore((s) => s.isInWishlist(product._id));

  const image = product.thumbnailImage || product.images[0] || '/window.svg';
  const onSale = product.discount > 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.info('Please log in to add items to your cart.');
      router.push('/auth/login');
      return;
    }
    setIsAdding(true);
    try {
      await addItem(product._id, 1);
      toast.success(`${product.name} added to cart`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not add to cart.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.info('Please log in to use your wishlist.');
      router.push('/auth/login');
      return;
    }
    try {
      const wishlisted = await toggleWishlist(product._id);
      toast.success(wishlisted ? `${product.name} added to wishlist` : `${product.name} removed from wishlist`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update wishlist.');
    }
  };

  return (
    <>
      <div className="group bg-card border border-border rounded-3xl card-shadow card-hover overflow-hidden flex flex-col h-full relative">
        {/* Framed image with padding, like a matted photo */}
        <Link href={`/product/${product.slug}`} className="block relative p-3 pb-0">
          <div className="relative overflow-hidden rounded-2xl aspect-[4/3] bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />

            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
              <div className="flex justify-end">
                <button
                  onClick={handleToggleWishlist}
                  className="w-9 h-9 bg-white/20 backdrop-blur-md flex items-center justify-center rounded-full hover:bg-white transition-colors"
                  aria-label="Toggle wishlist"
                >
                  <Heart size={16} className={isWishlisted ? 'fill-accent text-accent' : 'text-white group-hover:text-primary'} />
                </button>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setIsQuickViewOpen(true);
                }}
                className="w-full bg-white/20 backdrop-blur-md text-white font-medium py-2.5 rounded-xl hover:bg-white hover:text-primary transition-colors text-xs uppercase tracking-wider"
              >
                Quick View
              </button>
            </div>

            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {isNewProduct(product.created_date) && (
                <span className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1">
                  New
                </span>
              )}
              {onSale && (
                <span className="bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1">
                  -{product.discount}%
                </span>
              )}
            </div>
          </div>
        </Link>

        <div className="p-5 flex flex-col flex-1">
          <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-1.5">
            {getCategoryName(product)}
          </div>

          <Link href={`/product/${product.slug}`}>
            <h3 className="font-serif text-lg font-semibold text-foreground leading-tight hover:text-accent transition-colors mb-1.5">
              {product.name}
            </h3>
          </Link>

          {product.shortDescription && (
            <p className="text-sm text-muted-foreground line-clamp-1 mb-4">{product.shortDescription}</p>
          )}

          <div className="mt-auto flex items-center justify-between gap-3">
            <div className="flex flex-col leading-tight">
              {onSale && (
                <span className="text-xs line-through text-muted-foreground">Rs {product.price.toLocaleString()}</span>
              )}
              <span className="text-xl font-bold text-primary">Rs {product.finalPrice.toLocaleString()}</span>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || isAdding}
              className="flex items-center gap-1.5 bg-primary text-primary-foreground pl-4 pr-5 py-2.5 rounded-full font-medium text-sm hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 shrink-0"
            >
              <ShoppingCart size={16} />
              {product.stock === 0 ? 'Sold Out' : isAdding ? '…' : 'Add'}
            </button>
          </div>
        </div>
      </div>

      <QuickViewModal product={product} isOpen={isQuickViewOpen} onClose={() => setIsQuickViewOpen(false)} />
    </>
  );
}

