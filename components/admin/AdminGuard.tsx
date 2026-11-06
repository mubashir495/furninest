'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const isAdmin = String(user?.role || '').toUpperCase() === 'ADMIN';

  useEffect(() => {
    if (isLoading) return; 

    if (!isAuthenticated) {
      router.replace('/auth/login');
      return;
    }

    if (!isAdmin) {
      router.replace('/'); 
    }
  }, [isLoading, isAuthenticated, isAdmin, router]);

  if (isLoading || !isAuthenticated || !isAdmin) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FBF7F2]">
        <p className="text-[#8B7B6F] text-sm">Checking access…</p>
      </div>
    );
  }

  return <>{children}</>;
}