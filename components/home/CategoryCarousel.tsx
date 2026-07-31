'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { motion } from 'framer-motion';
import { CatalogCategory } from '@/Type/category';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export function CategoryCarousel({ catalog }: { catalog: CatalogCategory[] }) {
  return (
    <Swiper
      modules={[Navigation, Pagination, Autoplay]}
      spaceBetween={24}
      slidesPerView={1}
      navigation
      pagination={{ clickable: true }}
      autoplay={{ delay: 3000, disableOnInteraction: false }}
      breakpoints={{ 640: { slidesPerView: 2 }, 768: { slidesPerView: 3 }, 1024: { slidesPerView: 4 } }}
    >
      {catalog.map((category, index) => {
        const image =
          category.image ||
          category.subCategories.flatMap((sc) => sc.products).find((p) => p.thumbnailImage)?.thumbnailImage ||
          '/window.svg';
        const href = category.slug ? `/category/${category.slug}` : '/shop';

        return (
          <SwiperSlide key={category._id}>
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }}>
              <Link href={href} className="group block relative overflow-hidden aspect-square rounded-3xl">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                <Image
                  src={image}
                  alt={category.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute bottom-6 left-6 z-20">
                  <h3 className="text-white text-2xl font-serif">{category.name}</h3>
                  {category.description && <p className="text-white/70 text-sm line-clamp-1">{category.description}</p>}
                </div>
              </Link>
            </motion.div>
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
}