// src/hooks/useUserStats.ts
import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase/config';
import { UserStats } from '@/types/auth';

export function useUserStats(userId: string | undefined) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setStats(null);
      setLoading(false);
      return;
    }

    setLoading(true);
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

  return { stats, loading, error };
}
