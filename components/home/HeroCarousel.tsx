'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, EffectFade, Autoplay } from 'swiper/modules';
import { motion } from 'framer-motion';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const heroSlides = [
  {
    image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1600&q=80',
    eyebrow: 'The Autumn Collection',
    title: 'Tactile Textures',
    subtitle: 'Warm tones and luxurious materials for the changing season.',
    link: '/shop',
    cta: 'Shop the Collection',
  },
  {
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1600&q=80',
    eyebrow: 'Handcrafted Heritage',
    title: 'Timeless Craft',
    subtitle: 'Where traditional craftsmanship meets contemporary design.',
    link: '/shop',
    cta: 'Discover More',
  },
  {
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1600&q=80',
    eyebrow: 'Sanctuary Spaces',
    title: 'Restful Retreats',
    subtitle: 'Create a bedroom that promotes restful sleep and deep relaxation.',
    link: '/shop',
    cta: 'Shop Bedroom',
  },
];

export function HeroCarousel() {
  return (
    <Swiper
      modules={[Navigation, Pagination, EffectFade, Autoplay]}
      effect="fade"
      speed={1500}
      autoplay={{ delay: 6000, disableOnInteraction: false }}
      pagination={{ clickable: true, bulletClass: 'swiper-bullet-custom', bulletActiveClass: 'swiper-bullet-custom-active' }}
      className="w-full h-screen"
    >
      {heroSlides.map((slide, index) => (
        <SwiperSlide key={index} className="w-full h-full relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 z-10" />
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            sizes="100vw"
            priority={index === 0}
            fetchPriority={index === 0 ? 'high' : 'auto'}
            className="object-cover"
          />
          <div className="absolute inset-0 z-20 flex items-center justify-center md:justify-start px-6 md:px-24">
            <div className="max-w-2xl text-center md:text-left pt-20">
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="text-accent text-sm md:text-base uppercase tracking-[0.3em] font-semibold mb-6"
              >
                {slide.eyebrow}
              </motion.p>
              <motion.h1
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-5xl md:text-7xl lg:text-8xl font-bold font-serif text-white mb-6 leading-[1.1]"
              >
                {slide.title}
              </motion.h1>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-lg md:text-2xl text-white/80 mb-10 font-light max-w-lg mx-auto md:mx-0"
              >
                {slide.subtitle}
              </motion.p>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
              >
                <Link
                  href={slide.link}
                  className="bg-white text-primary px-8 py-4 rounded-2xl font-bold hover:bg-accent hover:text-accent-foreground transition-colors text-center text-sm tracking-wider uppercase"
                >
                  {slide.cta}
                </Link>
              </motion.div>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}