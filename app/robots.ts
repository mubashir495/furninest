import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/',
          '/dashboard',
          '/dashboard/',
          '/account',
          '/account/',
          '/cart',
          '/checkout',
          '/order-success',
          '/api/',
          '/auth/',
        ],
      },
    ],
    sitemap: 'https://luxafurniture.com/sitemap.xml',
  };
}
