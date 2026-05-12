import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase/config';
import type { UserStats } from '@/types/economy';

export function useUserStats(userId: string) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const statsRef = ref(db, `users/${userId}/stats`);

    const unsubscribe = onValue(
      statsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setStats(snapshot.val() as UserStats);
        } else {
          setStats(null);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [userId]);

  return {
    stats,
    loading,
    error,
    level: stats?.level || 1,
    currentXp: stats?.current_xp || 0,
    totalPoints: stats?.total_points || 0,
    currentStreak: stats?.current_streak || 0
  };
}