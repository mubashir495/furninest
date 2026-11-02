'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CatalogCategory } from '@/Type/category';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export function CategoryCarousel({ catalog }: { catalog: CatalogCategory[] }) {
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="relative w-full">
      {/* Controls */}
      <div className="flex justify-end gap-2 mb-6">
        <button
          ref={prevRef}
          type="button"
          aria-label="Previous categories"
          className="w-10 h-10 rounded-full glass flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          ref={nextRef}
          type="button"
          aria-label="Next categories"
          className="w-10 h-10 rounded-full glass flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={24}
        slidesPerView={1}
        navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
        onBeforeInit={(swiper) => {
          // @ts-expect-error swiper types don't allow reassigning nav els before init
          swiper.params.navigation.prevEl = prevRef.current;
          // @ts-expect-error swiper types don't allow reassigning nav els before init
          swiper.params.navigation.nextEl = nextRef.current;
        }}
        pagination={{
          clickable: true,
          renderBullet: (index, className) =>
            `<button type="button" class="${className}" aria-label="Go to category slide ${index + 1}"></button>`,
        }}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        breakpoints={{
          640: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
        }}
        className="!pb-12"
      >
        {catalog.map((category) => {
          const image =
            category.image ||
            category.subCategories.flatMap((sc) => sc.products).find((p) => p.thumbnailImage)?.thumbnailImage ||
            '/window.svg';
          const href = category.slug ? `/category/${category.slug}` : '/shop';

          return (
            <SwiperSlide key={category._id}>
              <Link href={href} className="group block relative overflow-hidden aspect-square rounded-3xl">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
                  loading="lazy"
                  className="object-cover transition-transform duration-500 md:group-hover:scale-105"
                />
                <div className="absolute bottom-6 left-6 z-20 right-6">
                  <h3 className="text-white text-2xl font-serif">{category.name}</h3>
                  {category.description && (
                    <p className="text-white/90 text-sm line-clamp-1 mt-1">{category.description}</p>
                  )}
                </div>
              </Link>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
