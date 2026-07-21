import { Header } from '@/components/comman/Header';
import { Footer } from '@/components/comman/Footer';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1 pt-24">{children}</main>
      <Footer />
    </>
  );
}
