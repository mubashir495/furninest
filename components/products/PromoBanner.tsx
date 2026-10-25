import Link from 'next/link';
import Image from 'next/image';

export function PromoBanner() {
  return (
    <div className="relative rounded-2xl overflow-hidden h-[180px] md:h-[200px] bg-[#1a1a1a] mt-12 mb-8">
      {/* Background image (decorative, loaded lazily) */}
      <Image
        src="/window.svg"
        alt=""
        fill
        className="object-cover opacity-30"
        aria-hidden
      />
      <div className="relative z-10 h-full flex items-center px-8 md:px-14 justify-between gap-6">
        <div>
          <h2 className="font-serif text-[22px] md:text-[26px] font-bold text-white leading-snug">
            Premium Furniture for a Better Home
          </h2>
          <p className="text-[13px] text-white/70 mt-1.5">
            Discover our collection and bring elegance to your living space.
          </p>
        </div>
        <Link
          href="/shop"
          className="shrink-0 flex items-center gap-2 bg-white text-[#1a1a1a] font-semibold text-[13px] px-5 py-3 rounded-full hover:bg-[#f5f0e8] transition-colors whitespace-nowrap"
        >
          Explore More →
        </Link>
      </div>
    </div>
  );
}
