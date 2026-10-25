'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, Star } from 'lucide-react';
import { ProductSuggestion } from '@/Type/product';
import { formatCurrency } from '@/utils/validators';

type Tab = 'description' | 'specifications' | 'care' | 'reviews';

interface ProductTabsProps {
  description: string;
  categoryName?: string;
  stock: number;
  material?: string;
  dimensions?: string;
  careInstructions?: string;
  features?: string[];
  specifications?: { label: string; value: string }[];
  gallery?: string[];
  suggestions?: ProductSuggestion[];
  /** Config variants for "Available in Other Configurations" row */
  configVariants?: {
    name: string;
    price: number;
    comparePrice?: number;
    image: string;
    slug: string;
  }[];
  reviewsCount?: number;
}

/* ── Mini star row ────────────────────────────────────────────── */
function MiniStars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5">
      {[1,2,3,4,5].map((n) => (
        <Star key={n} size={11} fill={n <= Math.round(rating) ? '#f59e0b' : 'none'} stroke="#f59e0b" strokeWidth="1.5" />
      ))}
    </span>
  );
}

export function ProductTabs({
  description,
  categoryName,
  stock,
  material,
  dimensions,
  careInstructions,
  features,
  specifications,
  gallery = [],
  suggestions = [],
  reviewsCount = 124,
}: ProductTabsProps) {
  const [active, setActive] = useState<Tab>('description');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'description',    label: 'Description' },
    { id: 'specifications', label: 'Specifications' },
    ...(careInstructions ? [{ id: 'care' as Tab, label: 'Care Instructions' }] : []),
    { id: 'reviews',        label: `Reviews (${reviewsCount})` },
  ];

  /* ── Spec rows ──────────────────────────────────────────── */
  const specRows: { label: string; value: string }[] = [
    { label: 'Category',     value: categoryName || '—' },
    { label: 'Availability', value: stock > 0 ? `${stock} in stock` : 'Out of stock' },
  ];
  if (material)   specRows.push({ label: 'Material',   value: material });
  if (dimensions) specRows.push({ label: 'Dimensions', value: dimensions });
  if (specifications?.length) {
    specifications.forEach((s) => {
      if (s.label && s.value) specRows.push({ label: s.label, value: s.value });
    });
  }

  /* ── Mosaic images ──────────────────────────────────────── */
  const mosaicImgs = gallery.slice(0, 5);

  /* ── Suggestions sidebar ────────────────────────────────── */
  const sidebarSuggestions = suggestions.slice(0, 3);

  return (
    <div className="mb-16 pb-4 lg:pb-20">
      {/* ── Tab bar ───────────────────────────────────────────── */}
      <div className="flex border-b border-[#e8e2d9] mb-10 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            className={`px-6 py-4 text-[14px] font-medium whitespace-nowrap border-b-2 -mb-px transition-all ${
              active === id
                ? 'border-[#1a1a1a] text-[#1a1a1a] font-semibold'
                : 'border-transparent text-[#888] hover:text-[#333]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ══ DESCRIPTION tab ══════════════════════════════════════ */}
      {active === 'description' && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px_220px] gap-10">

          {/* Left — text + features */}
          <div>
            {description && (
              <>
                <h2 className="font-serif text-[20px] font-bold text-[#1a1a1a] mb-3">
                  Elegant Comfort for Modern Living
                </h2>
                <p className="text-[14px] text-[#666] leading-relaxed mb-6 whitespace-pre-line">
                  {description}
                </p>
              </>
            )}
            {features && features.length > 0 && (
              <ul className="flex flex-col gap-2.5">
                {features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-[#16a34a] shrink-0 mt-0.5" />
                    <span className="text-[13px] text-[#555]">{f}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Middle — mosaic gallery */}
          {mosaicImgs.length > 0 && (
            <div className="hidden lg:block">
              <MosaicGrid images={mosaicImgs} />
            </div>
          )}

          {/* Right — You Might Also Like */}
          {sidebarSuggestions.length > 0 && (
            <div className="hidden lg:flex flex-col">
              <h3 className="font-serif text-[16px] font-bold text-[#1a1a1a] mb-4">
                You Might Also Like
              </h3>
              <div className="flex flex-col gap-4">
                {sidebarSuggestions.map((s) => {
                  const finalP = s.discount > 0
                    ? Math.round(s.price - s.price * s.discount / 100)
                    : s.price;
                  return (
                    <Link key={s._id} href={`/product/${s.slug}`} className="flex gap-3 group">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-[#f5f0e8]">
                        <Image src={s.thumbnailImage || '/window.svg'} alt={s.name} fill sizes="64px" className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-[#1a1a1a] group-hover:text-[#c9a66b] transition-colors leading-tight line-clamp-2">
                          {s.name}
                        </p>
                        <p className="text-[13px] font-bold text-[#1a1a1a] mt-1">{formatCurrency(finalP)}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <MiniStars rating={4.7} />
                          <span className="text-[11px] text-[#888]">4.7</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══ SPECIFICATIONS tab ════════════════════════════════════ */}
      {active === 'specifications' && (
        <div className="max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-3">
          {specRows.map((row) => (
            <div key={row.label} className="flex justify-between items-start gap-3 p-4 bg-[#faf7f2] rounded-xl border border-[#e8e2d9]">
              <span className="text-[13px] font-semibold text-[#1a1a1a]">{row.label}</span>
              <span className="text-[13px] text-[#666] text-right">{row.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* ══ CARE tab ══════════════════════════════════════════════ */}
      {active === 'care' && careInstructions && (
        <div className="max-w-2xl text-[14px] text-[#666] leading-relaxed whitespace-pre-line">
          {careInstructions}
        </div>
      )}

      {/* ══ REVIEWS tab ══════════════════════════════════════════ */}
      {active === 'reviews' && (
        <div className="max-w-xl">
          <div className="flex flex-col items-center justify-center py-12 bg-[#faf7f2] rounded-2xl border border-[#e8e2d9] text-center">
            <MiniStars rating={4.8} />
            <p className="text-[16px] font-semibold text-[#1a1a1a] mt-3">4.8 out of 5</p>
            <p className="text-[13px] text-[#888] mt-1">Based on {reviewsCount} reviews</p>
            <p className="text-[13px] text-[#aaa] mt-4">Full review listing coming soon.</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Mosaic grid ────────────────────────────────────────────────── */
function MosaicGrid({ images }: { images: string[] }) {
  const [main, ...rest] = images;
  return (
    <div className="grid grid-cols-2 gap-2.5 h-full">
      {main && (
        <div className="col-span-2 relative aspect-[3/2] rounded-2xl overflow-hidden">
          <Image src={main} alt="" fill sizes="340px" className="object-cover" />
        </div>
      )}
      {rest.slice(0, 4).map((img, i) => (
        <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
          <Image src={img} alt="" fill sizes="160px" className="object-cover" />
        </div>
      ))}
    </div>
  );
}
