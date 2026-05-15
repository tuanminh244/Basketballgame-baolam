import { useState, useEffect } from 'react';
import { onValue } from 'firebase/database';
import { refs } from '@/lib/firebase/refs';
import type { UserStats } from '@/types/auth';

export function useUserStats(userId: string | undefined) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const statsRef = refs.userStats(userId);

    const unsubscribe = onValue(
      statsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setStats(snapshot.val());
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

    return () => unsubscribe();
  }, [userId]);

  return { stats, loading, error };
}
