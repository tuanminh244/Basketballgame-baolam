import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/services/firebase/config';
import { DailySummaryNode, TaskNodeReadModel } from '@/types/schema';
import { buildTasksPath, buildSummaryPath } from '@/utils/systemPaths';

export const useSummaryListener = (monthNode: string | null | undefined, dateKey: string, uid: string | null | undefined) => {
  const [data, setData] = useState<DailySummaryNode | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!monthNode || !uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setData(null);

    const summaryRef = ref(db, buildSummaryPath(monthNode, dateKey, uid));
    const unsubscribe = onValue(
      summaryRef,
      (snapshot) => {
        setData(snapshot.val() || null);
        setLoading(false);
      },
      (error) => {
        console.error('[Firebase Error] useSummaryListener:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [monthNode, dateKey, uid]);

  return { data, loading };
};

export const useChildTasksListener = (monthNode: string | null | undefined, dateKey: string, uid: string | null | undefined) => {
  const [tasks, setTasks] = useState<TaskNodeReadModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!monthNode || !uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setTasks([]);

    const tasksRef = ref(db, buildTasksPath(monthNode, dateKey, uid));
    const unsubscribe = onValue(
      tasksRef,
      (snapshot) => {
        const val = snapshot.val() || {};
        const parsedTasks: TaskNodeReadModel[] = Object.entries(val).map(([id, taskData]: [string, any]) => ({
          id,
          title: taskData.title,
          status: taskData.status,
          xp_earned: taskData.xp_earned,
          point_earned: taskData.point_earned,
          updated_at: taskData.updated_at,
          verified_by: taskData.verified_by,
        }));
        
        setTasks(parsedTasks);
        setLoading(false);
      },
      (error) => {
        console.error('[Firebase Error] useChildTasksListener:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [monthNode, dateKey, uid]);

  return { tasks, loading };
};
