import { useState, useEffect, useCallback } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase/config';
import { approveTaskAtomic, rejectTaskAtomic } from '@/services/approvalService';
import type { Task } from '@/types/tasks';

export function useApprovalQueue(dateKey: string) {
  const [queue, setQueue] = useState<Record<string, Record<string, Task>>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!dateKey) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    const monthKey = dateKey.substring(0, 7).replace('-', '_');
    const dailyLogsRef = ref(db, `daily_logs_${monthKey}/${dateKey}`);

    const unsubscribe = onValue(
      dailyLogsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const allLogs = snapshot.val();
          const pendingQueue: Record<string, Record<string, Task>> = {};
          
          Object.keys(allLogs).forEach((uid) => {
            const userTasks = allLogs[uid]?.tasks || {};
            const pendingTasks: Record<string, Task> = {};
            
            Object.keys(userTasks).forEach((taskId) => {
              if (userTasks[taskId].status === 'pending') {
                pendingTasks[taskId] = userTasks[taskId];
              }
            });
            
            if (Object.keys(pendingTasks).length > 0) {
              pendingQueue[uid] = pendingTasks;
            }
          });
          
          setQueue(pendingQueue);
        } else {
          setQueue({});
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
  }, [dateKey]);

  const approveTask = useCallback(async (userId: string, taskId: string, checkerId: string) => {
    try {
      await approveTaskAtomic(userId, dateKey, taskId, checkerId);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Approval failed'));
      throw err;
    }
  }, [dateKey]);

  const rejectTask = useCallback(async (userId: string, taskId: string, checkerId: string) => {
    try {
      await rejectTaskAtomic(userId, dateKey, taskId, checkerId);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Rejection failed'));
      throw err;
    }
  }, [dateKey]);

  return {
    queue,
    loading,
    error,
    approveTask,
    rejectTask
  };
}
