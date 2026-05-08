"use client";
import PlayerHomePage from '@/components/player/PlayerHomePage';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PlayerHomeRoute() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'player')) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'player') return null;
  return <PlayerHomePage userId={user.id} />;
}
