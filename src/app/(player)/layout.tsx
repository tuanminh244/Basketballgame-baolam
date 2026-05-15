'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function PlayerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, isPlayer } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user || !isPlayer) {
      router.replace('/login');
    }
  }, [user, loading, isPlayer, router]);

  if (loading || !user || !isPlayer) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen w-full relative pb-20">
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
      
      {/* Soft UI Placeholder: Player Bottom Nav */}
      <nav className="absolute bottom-0 w-full h-20 bg-white border-t border-gray-100 flex justify-around items-center px-2 pb-2">
         {/* TODO: Replace scaffold with real PlayerNavigation component */}
         <div className="text-xs font-medium text-gray-400">Player Navigation</div>
      </nav>
    </div>
  );
}
