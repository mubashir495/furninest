'use client';

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <AdminGuard>
      <div className="min-h-screen bg-[#FBF7F2] flex">

        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-72 shrink-0">
          <AdminSidebar />
        </aside>

        {/* Mobile Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-white shadow-lg transition-transform duration-300 lg:hidden ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <AdminSidebar />
        </div>

        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main */}
        <main className="flex-1 min-w-0">

          {/* Mobile Header */}
          <header className="sticky top-0 z-30 flex items-center justify-between bg-white border-b px-4 py-3 lg:hidden">

            <button className="bg-[#8B5E34]" onClick={() => setSidebarOpen(true)}>
              <Menu  size={24} />
            </button>

            <h2 className="font-semibold">
              FurniNest Admin
            </h2>

          </header>

          <div className="p-4 md:p-6 lg:p-8">
            {children}
          </div>

        </main>

      </div>
    </AdminGuard>
  );
}