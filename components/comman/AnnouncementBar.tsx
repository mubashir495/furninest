import React from 'react';
import Link from 'next/link';

export function AnnouncementBar() {
  return (
    <div className="w-full bg-[#1a1a1a] text-white text-xs">
      <div className="max-w-[1280px] mx-auto px-6 h-9 flex items-center justify-between gap-4">
        {/* Left */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-gray-300">Free UK Delivery</span>
          <span className="hidden sm:inline text-gray-500">|</span>
          <span className="text-gray-300">Cash on Delivery Available</span>
        </div>
        {/* Right */}
        <div className="flex items-center gap-4">
          <Link href="/contact" className="text-gray-300 hover:text-white transition-colors flex items-center gap-1">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.55 3.5 2 2 0 0 1 3.5 1.32h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.84a16 16 0 0 0 6 6l.38-.38a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z" /></svg>
            Need Help?
          </Link>
          <span className="text-gray-500">|</span>
          <Link href="/account/orders" className="text-gray-300 hover:text-white transition-colors">
            Track Order
          </Link>
        </div>
      </div>
    </div>
  );
}
