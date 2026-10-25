'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  productName: string;
  discount?: number;
  /** When defined, show these images (variant gallery sync). Falls back to `images` when empty. */
  activeImages?: string[];
}

export function ProductGallery({ images, productName, discount = 0, activeImages }: ProductGalleryProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    setCurrent(0);
  }, [activeImages]);

  // Resolution order: activeImages (when non-empty) → images → placeholder
  const gallery =
    activeImages !== undefined
      ? activeImages.length > 0 ? activeImages : images.length > 0 ? images : ['/window.svg']
      : images.length > 0 ? images : ['/window.svg'];

  const prev = () => setCurrent((c) => (c - 1 + gallery.length) % gallery.length);
  const next = () => setCurrent((c) => (c + 1) % gallery.length);

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* ── Main image ─────────────────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden bg-[#f5f0e8] aspect-[4/3]">
        <Image
          key={gallery[current]}
          src={gallery[current]}
          alt={productName}
          fill
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 55vw, 600px"
          className="object-cover"
        />

        {/* Sale badge */}
        {discount > 0 && (
          <span className="absolute top-4 left-4 bg-[#e8453c] text-white text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded">
            Sale
          </span>
        )}

        {/* Prev / Next arrows */}
        {gallery.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-[#f0ece4] transition-colors"
            >
              <ChevronLeft size={18} className="text-[#333]" />
            </button>
            <button
              onClick={next}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-[#f0ece4] transition-colors"
            >
              <ChevronRight size={18} className="text-[#333]" />
            </button>
          </>
        )}
      </div>

      {/* ── Thumbnail strip ─────────────────────────────────────────── */}
      {gallery.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
          {gallery.map((img, idx) => (
            <button
              key={img + idx}
              onClick={() => setCurrent(idx)}
              aria-label={`View image ${idx + 1}`}
              aria-pressed={current === idx}
              className={`relative shrink-0 w-[70px] h-[70px] rounded-xl overflow-hidden border-2 transition-all ${
                current === idx
                  ? 'border-[#1a1a1a] opacity-100'
                  : 'border-[#e8e2d9] opacity-70 hover:opacity-100 hover:border-[#999]'
              }`}
            >
              {/* Play icon on first thumbnail to hint at a video/walkthrough */}
              {idx === 0 && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/20">
                  <div className="w-6 h-6 rounded-full bg-white/80 flex items-center justify-center">
                    <Play size={10} fill="#333" className="text-[#333] ml-0.5" />
                  </div>
                </div>
              )}
              <Image src={img} alt="" fill sizes="70px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
