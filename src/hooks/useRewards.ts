// src/hooks/useRewards.ts
import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase/config';
import { RewardState } from '@/types/rewards';
import { useCurrentVNDate } from '@/hooks/useCurrentVNDate';
import { buildDailyLogsNode } from '@/utils/time';

export function useRewards(userId: string | undefined) {
  const [rewards, setRewards] = useState<RewardState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { yyyy_mm, date } = useCurrentVNDate();

  useEffect(() => {
    if (!userId) {
      setRewards(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const logsNode = buildDailyLogsNode(yyyy_mm);
    const summaryRef = ref(db, `${logsNode}/${date}/${userId}/summary`);

    const unsubscribe = onValue(
      summaryRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          setRewards({
            reward_78_unlocked: !!data.reward_78_unlocked,
            reward_100_unlocked: !!data.reward_100_unlocked
          } as RewardState);
        } else {
          setRewards({
            reward_78_unlocked: false,
            reward_100_unlocked: false
          } as RewardState);
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
  }, [userId, yyyy_mm, date]);

  return { rewards, loading, error };
}
