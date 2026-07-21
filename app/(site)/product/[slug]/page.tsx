'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, Share2, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { productService } from '@/services/productService';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuth } from '@/context/AuthContext';
import { QuantitySelector } from '@/components/ui/QuantitySelector';
import { ProductCarousel } from '@/components/products/ProductCarousel';
import { usePageTitle } from '@/hooks/usePageTitle';
import { ProductDetail, getCategoryName, Product } from '@/Type/product';

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState(0);
  const [activeTab, setActiveTab] = useState<'desc' | 'details'>('desc');
  const [isAdding, setIsAdding] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const isWishlisted = useWishlistStore((s) => s.isInWishlist(product?._id ?? ''));

  usePageTitle(product?.name ?? 'Product');

  useEffect(() => {
    if (!slug) return;
    let mounted = true;
    setIsLoading(true);
    setError('');
    productService
      .getProductBySlug(slug)
      .then((p) => {
        if (!mounted) return;
        setProduct(p);
        setCurrentImage(0);
        setQuantity(1);
      })
      .catch((err) => {
        if (mounted) setError(err instanceof Error ? err.message : 'Product not found.');
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    window.scrollTo(0, 0);
    return () => {
      mounted = false;
    };
  }, [slug]);

  const handleAddToCart = async () => {
    if (!product) return;
    if (!isAuthenticated) {
      toast.info('Please log in to add items to your cart.');
      router.push('/auth/login');
      return;
    }
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

  const handleToggleWishlist = async () => {
    if (!product) return;
    if (!isAuthenticated) {
      toast.info('Please log in to use your wishlist.');
      router.push('/auth/login');
      return;
    }
    try {
      const wishlisted = await toggleWishlist(product._id);
      toast.success(wishlisted ? 'Added to wishlist' : 'Removed from wishlist');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update wishlist.');
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share && product) {
      try {
        await navigator.share({ title: product.name, url: window.location.href });
      } catch {
        /* user cancelled */
      }
    } else if (typeof navigator !== 'undefined') {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  if (isLoading) {
    return (
      <div className="pt-32 pb-20 text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="pt-32 pb-20 text-center">
        <p className="text-lg text-destructive mb-4">{error || 'Product not found.'}</p>
        <Link href="/shop" className="text-primary underline">
          Back to shop
        </Link>
      </div>
    );
  }

  const gallery = product.images.length > 0 ? product.images : [product.thumbnailImage].filter(Boolean);
  const onSale = product.discount > 0;
  const categoryName = getCategoryName(product);

  return (
    <div className="pt-4 pb-24">
      <div className="container mx-auto px-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium uppercase tracking-wider mb-8 flex-wrap">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
          {categoryName && (
            <>
              <span>/</span>
              <span className="text-primary">{categoryName}</span>
            </>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-16 mb-24">
          {/* Gallery */}
          <div className="w-full lg:w-1/2 flex flex-col gap-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="aspect-[4/5] bg-muted rounded-3xl overflow-hidden relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={gallery[currentImage] || '/window.svg'}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute top-6 left-6 flex flex-col gap-2">
                {onSale && (
                  <span className="bg-accent text-accent-foreground text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full shadow-lg">
                    -{product.discount}%
                  </span>
                )}
              </div>
            </motion.div>

            {gallery.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImage(idx)}
                    className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                      currentImage === idx ? 'border-primary opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="w-full lg:w-1/2">
            <span className="inline-block bg-muted text-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
              {categoryName || 'FurniNest'}
            </span>
            <h1 className="text-4xl md:text-5xl font-serif text-primary mb-6 leading-tight">{product.name}</h1>

            <div className="flex items-end gap-4 mb-8">
              <span className="text-4xl font-bold text-primary">Rs {product.finalPrice.toLocaleString()}</span>
              {onSale && (
                <span className="text-xl line-through text-muted-foreground mb-1">Rs {product.price.toLocaleString()}</span>
              )}
            </div>

            <div className="flex items-center gap-2 mb-8">
              <div
                className={`w-3 h-3 rounded-full ${
                  product.stock > 10 ? 'bg-green-500' : product.stock > 0 ? 'bg-amber-500' : 'bg-red-500'
                }`}
              ></div>
              <span className="text-sm font-medium">
                {product.stock > 10
                  ? 'In Stock - Ready to dispatch'
                  : product.stock > 0
                  ? `Low Stock (${product.stock} left)`
                  : 'Out of Stock'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="w-full sm:w-40">
                <QuantitySelector
                  quantity={quantity}
                  onIncrease={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  onDecrease={() => setQuantity((q) => Math.max(1, q - 1))}
                  max={product.stock}
                  className="h-14 rounded-2xl bg-muted/50 border-none"
                />
              </div>
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || isAdding}
                className="flex-1 bg-primary text-primary-foreground h-14 rounded-2xl font-bold uppercase tracking-wider hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50"
              >
                {product.stock === 0 ? 'Out of Stock' : isAdding ? 'Adding…' : 'Add to Cart'}
              </button>
            </div>

            <div className="flex gap-4 mb-12 border-b border-border pb-12">
              <button
                onClick={handleToggleWishlist}
                className={`flex items-center justify-center gap-2 flex-1 h-12 rounded-2xl border-2 transition-colors font-medium ${
                  isWishlisted ? 'border-accent bg-accent/10 text-primary' : 'border-border hover:border-primary'
                }`}
              >
                <Heart size={18} className={isWishlisted ? 'fill-accent text-accent' : ''} />
                {isWishlisted ? 'Saved' : 'Wishlist'}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 flex-1 h-12 rounded-2xl border-2 border-border hover:border-primary transition-colors font-medium"
              >
                <Share2 size={18} />
                Share
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex flex-col gap-2">
                <ShieldCheck size={24} className="text-accent" />
                <h4 className="font-bold text-sm">Quality Guaranteed</h4>
                <p className="text-xs text-muted-foreground">Carefully inspected</p>
              </div>
              <div className="flex flex-col gap-2">
                <Truck size={24} className="text-accent" />
                <h4 className="font-bold text-sm">Nationwide Delivery</h4>
                <p className="text-xs text-muted-foreground">Straight to your door</p>
              </div>
              <div className="flex flex-col gap-2">
                <RefreshCw size={24} className="text-accent" />
                <h4 className="font-bold text-sm">Easy Returns</h4>
                <p className="text-xs text-muted-foreground">Hassle-free process</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-24">
          <div className="flex border-b border-border mb-8 overflow-x-auto hide-scrollbar">
            {[
              { id: 'desc' as const, label: 'Description' },
              { id: 'details' as const, label: 'Details' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-8 py-4 font-serif text-xl transition-all whitespace-nowrap border-b-2 ${
                  activeTab === tab.id ? 'border-primary text-primary font-bold' : 'border-transparent text-muted-foreground hover:text-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="max-w-4xl">
            {activeTab === 'desc' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="prose prose-lg text-muted-foreground whitespace-pre-line">
                <p>{product.longDescription || product.shortDescription}</p>
              </motion.div>
            )}
            {activeTab === 'details' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/30 rounded-2xl">
                  <span className="font-bold text-primary mb-1 sm:mb-0">Category</span>
                  <span className="text-muted-foreground text-sm">{categoryName || '—'}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/30 rounded-2xl">
                  <span className="font-bold text-primary mb-1 sm:mb-0">Availability</span>
                  <span className="text-muted-foreground text-sm">{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</span>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Suggestions from backend */}
        {product.suggestions?.length > 0 && (
          <ProductCarousel
            products={product.suggestions as unknown as Product[]}
            title="You May Also Like"
          />
        )}
      </div>
    </div>
  );
}
