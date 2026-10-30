import Link from 'next/link';
import Image from 'next/image';

/** Dark promotional banner — intentionally always dark regardless of theme. */
export function PromoBanner() {
  return (
    <div className="relative rounded-2xl overflow-hidden h-[180px] md:h-[200px] mt-12 mb-8"
         style={{ background: '#1a120a' }}>
      <Image src="/window.svg" alt="" fill className="object-cover opacity-20" aria-hidden />
      <div className="relative z-10 h-full flex items-center px-8 md:px-14 justify-between gap-6">
        <div>
          <h2 className="font-serif text-[22px] md:text-[26px] font-bold leading-snug" style={{ color: '#f5efe6' }}>
            Premium Furniture for a Better Home
          </h2>
          <p className="text-[13px] mt-1.5" style={{ color: 'rgba(245,239,230,0.65)' }}>
            Discover our collection and bring elegance to your living space.
          </p>
        </div>
        <Link
          href="/shop"
          className="shrink-0 flex items-center gap-2 font-semibold text-[13px] px-5 py-3 rounded-full whitespace-nowrap transition-opacity hover:opacity-90"
          style={{ background: 'var(--accent)', color: 'var(--accent-foreground)' }}
        >
          Explore More →
        </Link>
      </div>
    </div>
  );
}
