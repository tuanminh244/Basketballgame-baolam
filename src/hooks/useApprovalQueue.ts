import { useState, useEffect, useCallback } from 'react';
import { onValue } from 'firebase/database';
import { refs } from '@/lib/firebase/refs';
import { getVietnamDate } from '@/utils/time';
import type { ApprovalQueueItem } from '@/types/tasks';

export function useApprovalQueue(_checkerId?: string) {
  const [queue, setQueue] = useState<ApprovalQueueItem[]>([]);
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
    if (!monthNode) return;

    const dateRef = refs.dailyLogsDate(monthNode, date);

    const unsubscribe = onValue(
      dateRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const allUsersData = snapshot.val();
          const pendingTasks: ApprovalQueueItem[] = [];

          Object.entries(allUsersData).forEach(([uid, userData]: [string, any]) => {
            if (userData.tasks) {
              Object.entries(userData.tasks).forEach(([taskId, taskData]: [string, any]) => {
                if (taskData.status === 'pending') {
                  pendingTasks.push({
                    id: taskId,
                    userId: uid,
                    ...taskData
                  } as ApprovalQueueItem);
                }
              });
            }
          });

          setQueue(pendingTasks);
        } else {
          setQueue([]);
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
  }, [monthNode, date]);

  const refreshQueue = useCallback(async () => Promise.resolve(), []);

  return { queue, loading, error, refreshQueue };
}
