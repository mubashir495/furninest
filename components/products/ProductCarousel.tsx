'use client';

import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { Product } from '@/Type/product';
import { ProductCard } from './ProductCard';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/navigation';

interface ProductCarouselProps {
  products: Product[];
  title?: string;
  viewAllLink?: string;
}

export function ProductCarousel({ products, title, viewAllLink }: ProductCarouselProps) {
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  if (products.length === 0) return null;

  return (
    <div className="w-full">
      <div className="flex items-end justify-between mb-8">
        {title && <h2 className="text-3xl font-serif text-primary">{title}</h2>}
        <div className="flex items-center gap-4">
          {viewAllLink && (
            <Link href={viewAllLink} className="text-sm font-medium text-primary hover:text-accent transition-colors underline-offset-4 hover:underline">
              View All
            </Link>
          )}
          <div className="flex gap-2">
            <button ref={prevRef} className="w-10 h-10 rounded-full glass flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
              <ChevronLeft size={20} />
            </button>
            <button ref={nextRef} className="w-10 h-10 rounded-full glass flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <Swiper
        modules={[Navigation]}
        spaceBetween={24}
        slidesPerView={1.2}
        navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
        onBeforeInit={(swiper) => {
          // @ts-expect-error swiper types don't allow reassigning nav els before init
          swiper.params.navigation.prevEl = prevRef.current;
          // @ts-expect-error swiper types don't allow reassigning nav els before init
          swiper.params.navigation.nextEl = nextRef.current;
        }}
        breakpoints={{
          640: { slidesPerView: 2.2 },
          768: { slidesPerView: 3.2 },
          1024: { slidesPerView: 4.2 },
          1280: { slidesPerView: 4.5 },
        }}
        className="!pb-12"
      >
        {products.map((product) => (
          <SwiperSlide key={product._id} className="h-auto">
            <ProductCard product={product} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
