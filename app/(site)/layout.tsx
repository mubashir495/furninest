import { AnnouncementBar } from '@/components/comman/AnnouncementBar';
import { Header } from '@/components/comman/Header';
import { Footer } from '@/components/comman/Footer';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/*
        AnnouncementBar: fixed, full-width, z-50, h-9 (36px), top-0.
        Header:          fixed, left-4/right-4, z-40, style={{top:'36px'}}
                         inner py-3 ≈ 60px → bottom edge ≈ 96px from bar top
                         = 36 + 96 = 132px total offset for <main>.

        z-50 on the bar keeps it above the rounded header card.
        z-40 on the header keeps it below z-50 modals/dropdowns (which
        the header's own theme dropdown overrides locally with z-50).
      */}
      <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
        {/* pointer-events-none on wrapper so clicks pass through the gap
            between bar and header; re-enable on each child */}
        <div className="pointer-events-auto">
          <AnnouncementBar />
        </div>
        {/* Header manages its own fixed positioning (top:36px, left-4, right-4) */}
      </div>
      <Header />
      {/* pt-[132px] = 36px bar + 96px header (original pt-24 equivalent) */}
      <main className="flex-1 pt-[132px]">{children}</main>
      <Footer />
    </>
  );
}
