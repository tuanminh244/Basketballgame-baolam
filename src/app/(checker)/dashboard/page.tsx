"use client";
import CheckerDashboardPage from '@/components/checker/dashboard/CheckerDashboardPage';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CheckerDashboardRoute() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || (user.role !== 'checker' && user.role !== 'admin'))) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user) return null;
  return <CheckerDashboardPage />;
}
