'use client';

import { useState, useMemo } from 'react';
import { Minus, Plus, ShoppingBag, Heart, ShieldCheck, Truck, Banknote, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { ProductGallery } from '@/components/products/ProductGallery';
import { VariantSelector } from '@/components/products/VariantSelector';
import {
  ProductDetail,
  ProductVariant,
  getVariantFinalPrice,
  hasVariants as productHasVariants,
  isVariantOnSale,
} from '@/Type/product';
import { formatCurrency } from '@/utils/validators';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuth } from '@/context/AuthContext';

interface Props {
  product: ProductDetail;
  baseGallery: string[];
}

/* ── Static mock rating (replace with real data when available) ── */
const MOCK_RATING = 4.8;
const MOCK_REVIEWS = 124;

/* ── Trust badges ─────────────────────────────────────────────── */
const TRUST = [
  { Icon: ShieldCheck, title: 'Premium Quality', sub: 'Long lasting comfort' },
  { Icon: Truck,        title: 'Free UK Delivery', sub: 'On all orders' },
  { Icon: Banknote,     title: 'Cash on Delivery', sub: 'Pay when you receive' },
  { Icon: RotateCcw,   title: 'Easy Returns',     sub: 'Within 14 days' },
] as const;

/* ── Star component ───────────────────────────────────────────── */
function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} width="14" height="14" viewBox="0 0 24 24" fill={n <= Math.round(rating) ? '#f59e0b' : 'none'} stroke="#f59e0b" strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  );
}

export function ProductDetailClient({ product, baseGallery }: Props) {
  const hasVariants = productHasVariants(product);

  const firstActive = useMemo<ProductVariant | null>(
    () => (hasVariants ? (product.variants!.find((v) => v.isActive) ?? null) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [product._id],
  );

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(firstActive);
  const [qty, setQty] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isBuying, setIsBuying] = useState(false);

  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const isWishlisted = useWishlistStore((s) => s.isInWishlist(product._id));

  /* ── Gallery ──────────────────────────────────────────────────── */
  const activeImages: string[] | undefined = hasVariants
    ? (selectedVariant?.images?.length ? selectedVariant.images : baseGallery)
    : undefined;

  /* ── Pricing ──────────────────────────────────────────────────── */
  const displayPrice = selectedVariant ? getVariantFinalPrice(selectedVariant) : product.finalPrice;
  const comparePrice = selectedVariant
    ? (isVariantOnSale(selectedVariant) ? selectedVariant.price : null)
    : product.discount > 0 ? product.price : null;
  const savePct = comparePrice && comparePrice > displayPrice
    ? Math.round((1 - displayPrice / comparePrice) * 100)
    : 0;

  /* ── Stock / disabled ─────────────────────────────────────────── */
  const effectiveStock = hasVariants
    ? (selectedVariant?.stock ?? 0)
    : product.stock;
  const needsSelection = hasVariants && !selectedVariant;
  const oos = effectiveStock === 0 && !needsSelection;
  const disabled = needsSelection || oos || isAdding || isBuying;

  /* ── Cart helpers ─────────────────────────────────────────────── */
  const requireAuth = () => {
    toast.info('Please sign in to continue.');
    router.push('/auth/login');
  };

  const doAdd = async () => {
    if (needsSelection) { toast.info('Please select a configuration.'); return; }
    if (!isAuthenticated) { requireAuth(); return; }
    setIsAdding(true);
    try {
      await addItem(product._id, qty, hasVariants ? selectedVariant!._id : undefined);
      toast.success(`${qty}× ${product.name} added to cart`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      toast.error(msg.toLowerCase().includes('internal server error')
        ? 'Server error — please try again in a moment.'
        : msg || 'Could not add to cart.');
    } finally { setIsAdding(false); }
  };

  const doBuyNow = async () => {
    if (needsSelection) { toast.info('Please select a configuration.'); return; }
    if (!isAuthenticated) { requireAuth(); return; }
    setIsBuying(true);
    try {
      await addItem(product._id, qty, hasVariants ? selectedVariant!._id : undefined);
      router.push('/checkout');
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      toast.error(msg.toLowerCase().includes('internal server error')
        ? 'Server error — please try again in a moment.'
        : msg || 'Could not add to cart.');
      setIsBuying(false);
    }
  };

  /* ── Product Details sidebar rows ─────────────────────────────── */
  const v = selectedVariant;
  const detailRows = [
    v?.sku || product.sku
      ? { label: 'SKU', value: v?.sku || product.sku || '' }
      : null,
    v?.dimensions || product.dimensions
      ? { label: v ? `Dimensions (${v.configName})` : 'Dimensions', value: v?.dimensions || product.dimensions || '' }
      : null,
    v?.material || product.material
      ? { label: 'Material', value: v?.material || product.material || '' }
      : null,
    v?.weight != null
      ? { label: 'Weight', value: `${v.weight} kg` }
      : null,
    { label: 'Delivery Time', value: '3–5 Working Days' },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_260px] gap-8 xl:gap-10 mb-16 items-start">

      {/* ══ Column 1 — Gallery ════════════════════════════════════════ */}
      <ProductGallery
        images={baseGallery}
        activeImages={activeImages}
        productName={product.name}
        discount={savePct > 0 ? savePct : 0}
      />

      {/* ══ Column 2 — Product info ═══════════════════════════════════ */}
      <div className="flex flex-col">

        {/* In-stock badge */}
        <div className="mb-3">
          <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#16a34a] bg-[#f0fdf4] border border-[#bbf7d0] px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
            {oos ? 'Out of Stock' : `In Stock${effectiveStock > 0 ? ` (${effectiveStock})` : ''}`}
          </span>
        </div>

        {/* Title */}
        <h1 className="font-serif text-[26px] md:text-[30px] font-bold text-[#1a1a1a] leading-snug mb-3">
          {product.name}
        </h1>

        {/* Rating row */}
        <div className="flex items-center gap-2 mb-4">
          <Stars rating={MOCK_RATING} />
          <span className="text-[13px] font-semibold text-[#1a1a1a]">{MOCK_RATING}</span>
          <span className="text-[13px] text-[#888]">({MOCK_REVIEWS} reviews)</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-3 mb-5">
          <span className="text-[28px] font-bold text-[#1a1a1a]">{formatCurrency(displayPrice)}</span>
          {comparePrice && (
            <span className="text-[18px] text-[#999] line-through">{formatCurrency(comparePrice)}</span>
          )}
          {savePct > 0 && (
            <span className="text-[12px] font-bold text-white bg-[#e8453c] px-2.5 py-1 rounded-full">
              Save {savePct}%
            </span>
          )}
        </div>

        {/* Short description */}
        {product.shortDescription && (
          <p className="text-[14px] text-[#666] leading-relaxed mb-5">
            {product.shortDescription}
          </p>
        )}

        {/* Variant selector (config pills + color swatches) */}
        {hasVariants && (
          <div className="mb-5">
            <VariantSelector
              variants={product.variants!}
              onVariantChange={setSelectedVariant}
              initialVariantId={firstActive?._id}
            />
          </div>
        )}

        {/* Quantity + Add to Cart + Wishlist */}
        <div className="mb-3">
          <p className="text-[12px] font-semibold uppercase tracking-wider text-[#888] mb-2.5">
            Quantity
          </p>
          <div className="flex items-center gap-3">
            {/* Qty stepper */}
            <div className="flex items-center border border-[#d0c9be] rounded-full overflow-hidden h-11">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
                className="w-10 h-11 flex items-center justify-center text-[#555] hover:bg-[#f5f0e8] disabled:opacity-30 transition-colors"
                aria-label="Decrease"
              >
                <Minus size={15} />
              </button>
              <span className="w-10 text-center text-[15px] font-semibold text-[#1a1a1a]">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(effectiveStock || 99, q + 1))}
                disabled={qty >= (effectiveStock || 99)}
                className="w-10 h-11 flex items-center justify-center text-[#555] hover:bg-[#f5f0e8] disabled:opacity-30 transition-colors"
                aria-label="Increase"
              >
                <Plus size={15} />
              </button>
            </div>

            {/* Wishlist */}
            <button
              onClick={() => toggleWishlist(product._id)}
              aria-pressed={isWishlisted}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              className={`w-11 h-11 shrink-0 rounded-full border flex items-center justify-center transition-colors ${
                isWishlisted ? 'bg-[#fff0f0] border-[#e8453c] text-[#e8453c]' : 'border-[#d0c9be] text-[#777] hover:border-[#e8453c] hover:text-[#e8453c]'
              }`}
            >
              <Heart size={18} className={isWishlisted ? 'fill-current' : ''} />
            </button>
          </div>
        </div>

        {/* Add to Cart */}
        <button
          onClick={doAdd}
          disabled={disabled}
          className="w-full h-12 rounded-full bg-[#1a1a1a] text-white font-semibold text-[14px] flex items-center justify-center gap-2 whitespace-nowrap hover:bg-[#333] transition-colors disabled:opacity-40 disabled:pointer-events-none mb-3"
        >
          <ShoppingBag size={17} />
          {needsSelection ? 'Select a configuration' : oos ? 'Out of Stock' : isAdding ? 'Adding…' : 'Add to Cart'}
        </button>

        {/* Buy Now */}
        {!oos && !needsSelection && (
          <button
            onClick={doBuyNow}
            disabled={disabled}
            className="w-full h-12 rounded-full border-2 border-[#1a1a1a] text-[#1a1a1a] font-semibold text-[14px] flex items-center justify-center whitespace-nowrap hover:bg-[#1a1a1a] hover:text-white transition-colors disabled:opacity-40 disabled:pointer-events-none"
          >
            {isBuying ? 'Processing…' : 'Buy Now'}
          </button>
        )}
      </div>

      {/* ══ Column 3 — Trust sidebar ═══════════════════════════════════ */}
      {/* Sticky sidebar — top clears announcement-bar(36) + header-float(96) + gap(12) = 144px */}
      <div className="hidden lg:flex flex-col gap-4 lg:sticky lg:top-[144px]">

        {/* Trust badges card */}
        <div className="bg-white border border-[#e8e2d9] rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col gap-4">
            {TRUST.map(({ Icon, title, sub }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#f5f0e8] flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-[#1a1a1a]" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#1a1a1a] leading-tight">{title}</p>
                  <p className="text-[12px] text-[#888]">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Product details card */}
        {detailRows.length > 0 && (
          <div className="bg-white border border-[#e8e2d9] rounded-2xl p-5 shadow-sm">
            <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#888] mb-4">
              Product Details
            </h3>
            <div className="flex flex-col divide-y divide-[#f0ece4]">
              {detailRows.map(({ label, value }) => (
                <div key={label} className="flex justify-between items-start py-2.5 gap-3">
                  <span className="text-[12px] font-medium text-[#888] shrink-0">{label}</span>
                  <span className="text-[12px] text-[#1a1a1a] text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Mobile trust badges (stacked below info) ─────────────────── */}
      <div className="lg:hidden col-span-full grid grid-cols-2 gap-3">
        {TRUST.map(({ Icon, title, sub }) => (
          <div key={title} className="bg-white border border-[#e8e2d9] rounded-2xl p-4 flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-[#f5f0e8] flex items-center justify-center shrink-0">
              <Icon size={16} className="text-[#1a1a1a]" />
            </div>
            <div>
              <p className="text-[12px] font-semibold text-[#1a1a1a]">{title}</p>
              <p className="text-[11px] text-[#888]">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Mobile sticky Add-to-Cart bar ─────────────────────────────── */}
      <div className="lg:hidden col-span-full fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[#e8e2d9] px-4 py-3">
        <button
          onClick={doAdd}
          disabled={disabled}
          className="w-full h-12 rounded-full bg-[#1a1a1a] text-white font-semibold text-[14px] flex items-center justify-center gap-2 whitespace-nowrap hover:bg-[#333] transition-colors disabled:opacity-40 disabled:pointer-events-none"
        >
          <ShoppingBag size={17} />
          {needsSelection ? 'Select options' : oos ? 'Out of Stock' : isAdding ? 'Adding…' : `Add to Cart · ${formatCurrency(displayPrice)}`}
        </button>
      </div>
    </div>
  );
}
