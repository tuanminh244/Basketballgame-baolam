'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function RootPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) router.replace('/login');
      else if (user.role === 'player') router.replace('/child-home');
      else router.replace('/dashboard');
    }
  }, [user, isLoading, router]);

  return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
}
