import { useState, useEffect } from 'react';
import { ref, query, orderByChild, equalTo, onValue } from 'firebase/database';
import { db } from '@/services/firebase/config';
import { TaskNodeReadModel } from '@/types/schema';
import { buildTasksPath } from '@/utils/systemPaths';

export const useApprovalQueueListener = (monthNode: string | null | undefined, dateKey: string, childrenUids: string[]) => {
  const [queue, setQueue] = useState<(TaskNodeReadModel & { childUid: string })[]>([]);
  const [loading, setLoading] = useState(true);

  const uidsDep = childrenUids.join(',');

  useEffect(() => {
    if (!monthNode || !uidsDep) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setQueue([]);

    const uids = uidsDep.split(',');
    const unsubscribes: (() => void)[] = [];

    uids.forEach(childUid => {
      const pendingTasksQuery = query(
        ref(db, buildTasksPath(monthNode, dateKey, childUid)),
        orderByChild('status'),
        equalTo('pending')
      );

      const unsubscribe = onValue(
        pendingTasksQuery,
        (snapshot) => {
          const val = snapshot.val() || {};
          const parsedTasks: (TaskNodeReadModel & { childUid: string })[] = Object.entries(val).map(([id, taskData]: [string, any]) => ({
            id,
            childUid,
            title: taskData.title,
            status: taskData.status,
            xp_earned: taskData.xp_earned,
            point_earned: taskData.point_earned,
            updated_at: taskData.updated_at,
            verified_by: taskData.verified_by,
          }));

          setQueue(prev => {
            const filtered = prev.filter(t => t.childUid !== childUid);
            return [...filtered, ...parsedTasks];
          });
          setLoading(false);
        },
        (error) => {
          console.error(`[Firebase Error] useApprovalQueueListener (${childUid}):`, error);
          setLoading(false);
        }
      );

      unsubscribes.push(unsubscribe);
    });

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [monthNode, dateKey, uidsDep]);

  return { queue, loading };
};
