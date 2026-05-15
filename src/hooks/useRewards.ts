import { useState, useEffect } from 'react';
import { onValue } from 'firebase/database';
import { refs } from '@/lib/firebase/refs';
import { getVietnamDate } from '@/utils/time';
import type { RewardState } from '@/types/rewards';

export function useRewards(userId: string | undefined) {
  const [rewards, setRewards] = useState<RewardState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const [monthNode, setMonthNode] = useState('');
  
  useEffect(() => {
    const unsub = onValue(
      refs.systemConfigMonthNode(),
      (snap) => {
        if (snap.exists()) {
          setMonthNode(snap.val());
        }
      }
    );
    return () => unsub();
  }, []);
  
  const date = getVietnamDate();

  useEffect(() => {
    if (!userId || !monthNode) {
      if (!userId) setLoading(false);
      return;
    }

    const summaryRef = refs.dailySummary(monthNode, date, userId);

    const unsubscribe = onValue(
      summaryRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          setRewards({
            reward_78_unlocked: !!data.reward_78_unlocked,
            reward_100_unlocked: !!data.reward_100_unlocked,
          });
        } else {
          setRewards(null);
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
  }, [userId, monthNode, date]);

  return { rewards, loading, error };
}
