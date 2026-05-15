'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function CheckerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, isChecker } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user || !isChecker) {
      router.replace('/login');
    }
  }, [user, loading, isChecker, router]);

  if (loading || !user || !isChecker) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-100 relative pb-20">
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
      
      {/* Soft UI Placeholder: Checker Bottom Nav */}
      <nav className="absolute bottom-0 w-full h-20 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.05)] border-t border-gray-200 flex justify-around items-center px-2 pb-2">
         {/* TODO: Replace scaffold with real CheckerNavigation component */}
         <div className="text-xs font-medium text-emerald-600">Checker Navigation</div>
      </nav>
    </div>
  );
}
