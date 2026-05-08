import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/services/firebase/config';
import { UserStatsNode } from '@/types/schema';
import { buildUserStatsPath } from '@/utils/systemPaths';

export const useStatsListener = (uid: string | null | undefined) => {
  const [data, setData] = useState<UserStatsNode | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setData(null);

    const statsRef = ref(db, buildUserStatsPath(uid));
    const unsubscribe = onValue(
      statsRef,
      (snapshot) => {
        setData(snapshot.val() || null);
        setLoading(false);
      },
      (error) => {
        console.error('[Firebase Error] useStatsListener:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [uid]);

  return { data, loading };
};
