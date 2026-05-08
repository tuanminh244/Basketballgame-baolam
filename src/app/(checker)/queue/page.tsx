"use client";
import ApprovalQueuePage from '@/components/checker/queue/ApprovalQueuePage';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function QueueRoute() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || (user.role !== 'checker' && user.role !== 'admin'))) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user) return null;
  return <ApprovalQueuePage />;
}
