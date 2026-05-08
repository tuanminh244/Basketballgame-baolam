"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function RootPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      router.push('/login');
    } else if (user.role === 'checker' || user.role === 'admin') {
      router.push('/dashboard');
    } else if (user.role === 'player') {
      router.push('/player-home');
    }
  }, [user, loading, router]);

  return <div className="p-8 text-center font-bold text-gray-500">Đang tải hệ thống...</div>;
}
