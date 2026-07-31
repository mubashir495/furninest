import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Hammer, Leaf, HeartHandshake, Sparkles } from 'lucide-react';
import { TrustBadges } from '@/components/comman/TrustBadges';

export const metadata: Metadata = {
  title: 'About Us | FurniNest',
  description:
    'FurniNest crafts modern furniture for every home — quality materials, honest pricing, and pieces built to last.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About FurniNest',
    description: 'Quality furniture, honest craftsmanship, made for real homes.',
    type: 'website',
    url: '/about',
  },
};

const VALUES = [
  {
    icon: Hammer,
    title: 'Honest Craftsmanship',
    description: 'Every piece is built from solid materials, not shortcuts — furniture meant to be lived on for years.',
  },
  {
    icon: Leaf,
    title: 'Thoughtful Sourcing',
    description: 'We work with makers who care about where materials come from and how they age over time.',
  },
  {
    icon: HeartHandshake,
    title: 'People First',
    description: 'From the first browse to the last delivery, we build relationships, not just transactions.',
  },
  {
    icon: Sparkles,
    title: 'Design That Lasts',
    description: 'Timeless silhouettes over passing trends — pieces that still feel right ten years from now.',
  },
];

const STATS = [
  { value: '10K+', label: 'Happy Homes' },
  { value: '500+', label: 'Curated Pieces' },
  { value: '15+', label: 'Trusted Makers' },
  { value: '4.9★', label: 'Average Rating' },
];

export default function AboutPage() {
  return (
    <div className="pb-24">
      {/* Hero */}
      <section className="relative min-h-[70vh] w-full flex items-center overflow-hidden -mt-24">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30 z-10" />
        <Image
          src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1600&q=80"
          alt="Warm, sunlit furniture showroom"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="container mx-auto px-6 relative z-20 pt-24">
          <p className="text-accent text-sm uppercase tracking-[0.3em] font-semibold mb-6">Our Story</p>
          <h1 className="text-5xl md:text-7xl font-serif text-white mb-6 max-w-2xl leading-[1.1]">
            Furniture Made for Real Life
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-xl font-light">
            We believe good furniture shouldn&apos;t be a compromise between beauty and durability. FurniNest exists to close that gap.
          </p>
        </div>
      </section>

      {/* Stats strip */}
      <section className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl md:text-4xl font-serif text-accent mb-1">{stat.value}</p>
              <p className="text-sm text-white/70 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden soft-shadow order-2 lg:order-1">
            <Image
              src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1000&q=80"
              alt="Craftsman shaping a wooden furniture piece"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="order-1 lg:order-2">
            <p className="text-accent text-sm uppercase tracking-[0.3em] font-semibold mb-6">How It Started</p>
            <h2 className="text-4xl md:text-5xl font-serif text-primary mb-8 leading-tight">
              From One Workshop to Thousands of Homes
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              FurniNest began with a simple frustration: too much furniture is either beautifully designed and
              poorly made, or well made and forgettable. We set out to find makers who refused that trade-off.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed mb-10">
              Today, every piece on FurniNest is chosen for the same reason the first one was — it has to earn
              its place in your home, not just your cart.
            </p>
            <Link
              href="/shop"
              className="inline-block bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-bold hover:bg-accent hover:text-accent-foreground transition-colors text-sm uppercase tracking-wider"
            >
              Explore the Collection
            </Link>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-accent text-sm uppercase tracking-[0.3em] font-semibold mb-4">What We Stand For</p>
            <h2 className="text-4xl md:text-5xl font-serif text-primary">Our Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {VALUES.map((value) => (
              <div key={value.title} className="bg-card rounded-3xl soft-shadow p-8 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
                  <value.icon size={28} className="text-accent" strokeWidth={1.75} />
                </div>
                <h3 className="font-serif text-xl text-primary mb-3">{value.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TrustBadges />

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="bg-primary text-primary-foreground rounded-[2.5rem] px-8 py-16 md:py-24 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(200,169,106,0.15)_0%,transparent_70%)]" />
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-serif mb-6">Ready to Furnish Your Home?</h2>
              <p className="text-white/70 text-lg mb-10">
                Browse our full collection and find pieces built to last, not just to look good on day one.
              </p>
              <Link
                href="/shop"
                className="inline-block bg-accent text-accent-foreground font-bold px-10 py-4 rounded-2xl hover:bg-white transition-colors uppercase tracking-wider text-sm"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}