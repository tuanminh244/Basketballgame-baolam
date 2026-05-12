import { useState, useEffect, useCallback } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase/config';
import { submitTaskAtomic } from '@/services/taskService';
import type { DailyLog } from '@/types/tasks';

export function useDailyLog(userId: string, dateKey: string) {
  const [log, setLog] = useState<DailyLog | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId || !dateKey) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const monthKey = dateKey.substring(0, 7).replace('-', '_');
    const logRef = ref(db, `daily_logs_${monthKey}/${dateKey}/${userId}`);

    const unsubscribe = onValue(
      logRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setLog(snapshot.val() as DailyLog);
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

    return () => {
      unsubscribe();
    };
  }, [userId, dateKey]);

  const submitTask = useCallback(async (taskId: string) => {
    try {
      await submitTaskAtomic(userId, dateKey, taskId);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to submit task'));
      throw err;
    }
  }, [userId, dateKey]);

  return {
    log,
    loading,
    error,
    submitTask,
    tasks: log?.tasks || {},
    summary: log?.summary || null,
    isComplete: log?.summary?.status === 'completed',
    reward100Unlocked: log?.summary?.reward_100_unlocked || false,
    reward78Unlocked: log?.summary?.reward_78_unlocked || false
  };
}
