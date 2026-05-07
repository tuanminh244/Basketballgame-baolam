import { useState, useEffect } from 'react';
import { SystemConfig, DailySummaryNode, UserStatsNode, TaskNodeReadModel } from '@/types/schema';

export const useSystemConfig = () => {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const timer = setTimeout(() => {
      setConfig({ current_month_node: 'daily_logs_2026_05' });
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  return { config, loading, error };
};

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
    const timer = setTimeout(() => {
      setData({ completion_rate: 80, status: 'partial', reward_78_unlocked: true, reward_100_unlocked: false, xp_granted: 30, points_granted: 15 });
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [monthNode, dateKey, uid]);

  return { data, loading };
};

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
    const timer = setTimeout(() => {
      setData({ current_streak: 5, level: 2, current_xp: 450, total_points: 150 });
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [uid]);

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
    const timer = setTimeout(() => {
      setTasks([
        { id: 't1', title: 'Tự đánh răng buổi sáng', status: 'todo', xp_earned: 10, point_earned: 5 },
        { id: 't2', title: 'Đọc sách 15 phút', status: 'pending', xp_earned: 20, point_earned: 10 },
      ]);
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [monthNode, dateKey, uid]);

  return { tasks, loading };
};

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
    const timer = setTimeout(() => {
      setQueue([
        { id: 't2', childUid: 'blam_01', title: 'Đọc sách 15 phút', status: 'pending', xp_earned: 20, point_earned: 10 }
      ]);
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [monthNode, dateKey, uidsDep]);

  return { queue, loading };
};
