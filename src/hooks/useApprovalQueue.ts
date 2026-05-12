// src/hooks/useApprovalQueue.ts
import { useState, useEffect, useCallback } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase/config';
import { useAuthContext } from '@/contexts/AuthContext';
import { ApprovalQueueItem } from '@/types/tasks';
import { useCurrentVNDate } from '@/hooks/useCurrentVNDate';
import { buildDailyLogsNode } from '@/utils/time';

export function useApprovalQueue() {
  const { user } = useAuthContext();
  const [queue, setQueue] = useState<ApprovalQueueItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { yyyy_mm, date } = useCurrentVNDate();

  useEffect(() => {
    if (!user || user.role === 'player') {
      setQueue([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const logsNode = buildDailyLogsNode(yyyy_mm);
    const dailyLogsRef = ref(db, `${logsNode}/${date}`);

    const unsubscribe = onValue(
      dailyLogsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const pendingTasks: ApprovalQueueItem[] = [];

          for (const [uid, userLog] of Object.entries<any>(data)) {
            if (userLog && userLog.tasks) {
              for (const [taskId, taskData] of Object.entries<any>(userLog.tasks)) {
                // STRICT FIREBASE_SCHEMA_LOCK COMPLIANCE
                if (taskData.status === 'pending') {
                  pendingTasks.push({
                    id: taskId,
                    userId: uid,
                    ...taskData
                  } as ApprovalQueueItem);
                }
              }
            }
          }
          setQueue(pendingTasks);
        } else {
          setQueue([]);
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
  }, [user, yyyy_mm, date]);

  const refreshQueue = useCallback(async () => {
    // Managed via realtime subscription
  }, []);

  return { queue, loading, error, refreshQueue };
}
