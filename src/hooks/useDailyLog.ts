import { useState, useEffect, useCallback } from 'react';
import { onValue } from 'firebase/database';
import { refs } from '@/lib/firebase/refs';
import { submitTaskAtomic } from '@/services/taskService';
import { getVietnamDate } from '@/utils/time';
import type { DailyTask, RewardState } from '@/types';

export function useDailyLog(userId: string | undefined) {
  const [log, setLog] = useState<{ tasks: Record<string, DailyTask>; summary: RewardState & { completion_rate: number, status: string, xp_granted: number, points_granted: number } } | null>(null);
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

    const logRef = refs.dailyLogRecord(monthNode, date, userId);

    const unsubscribe = onValue(
      logRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setLog(snapshot.val());
        } else {
          setLog(null);
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

  const submitTask = useCallback(async (taskId: string) => {
    if (!userId || !monthNode) throw new Error('User or monthNode not found');
    await submitTaskAtomic(monthNode, date, userId, taskId);
  }, [userId, monthNode, date]);

return {
  dailyLog: log,
  log,
  loading,
  error,
  submitTask,
};
}
