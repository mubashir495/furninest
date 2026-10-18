'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export function ProductGallery({
  images,
  productName,
  discount,
  activeImages,
}: {
  images: string[];
  productName: string;
  discount: number;
  /** When provided (and non-empty), display these images instead of `images`. Used for variant gallery sync. */
  activeImages?: string[];
}) {
  const [currentImage, setCurrentImage] = useState(0);

  // Reset to first image whenever the active variant gallery changes
  useEffect(() => {
    setCurrentImage(0);
  }, [activeImages]);

  // Use activeImages (variant-specific) when provided, otherwise fall back to base product images
  const gallery = (activeImages && activeImages.length > 0 ? activeImages : images.length > 0 ? images : ['/window.svg']);


  return (
    <div className="w-full lg:w-1/2 flex flex-col gap-4">
      <div className="aspect-[4/5] bg-muted rounded-3xl overflow-hidden relative group">
        <Image
          src={gallery[currentImage]}
          alt={productName}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {discount > 0 && (
          <span className="absolute top-6 left-6 bg-accent text-accent-foreground text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full shadow-lg z-10">
            -{discount}%
          </span>
        )}
      </div>

      {gallery.length > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {gallery.map((img, idx) => (
            <button
              key={img + idx}
              onClick={() => setCurrentImage(idx)}
              aria-label={`View image ${idx + 1} of ${productName}`}
              aria-pressed={currentImage === idx}
              className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                currentImage === idx ? 'border-primary opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <Image src={img} alt="" fill sizes="120px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}