import { useState, useEffect, useRef } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../services/firebase/firebaseConfig';
import { TaskStats, DailyOverview } from '../types/dashboard';

const initialStats: TaskStats = {
  total: 0, pending: 0, submitted: 0, approved: 0, rejected: 0, estimatedXP: 0,
  completionRate: 0, reward_78_unlocked: false, reward_100_unlocked: false
};

export const useDailyTaskOverview = (yyyy_mm: string, date: string, childUids: string[]) => {
  const [overview, setOverview] = useState<DailyOverview>({ overall: initialStats, children: {} });
  const [loading, setLoading] = useState(true);
  
  const isMounted = useRef(true);
  const tasksBuffer = useRef<Record<string, any>>({});
  const summaryBuffer = useRef<Record<string, any>>({});

  useEffect(() => {
    isMounted.current = true;
    const unsubscribes: (() => void)[] = [];

    const computeAndUpdate = () => {
      if (!isMounted.current) return;

      const childrenStats: Record<string, TaskStats> = {};
      const overall = { ...initialStats };

      childUids.forEach(uid => {
        const stats = { ...initialStats };
        const tasksData = tasksBuffer.current[uid];
        const summaryData = summaryBuffer.current[uid];

        // 1. PROCESS OPERATIONAL STATE
        if (tasksData) {
          const tasksList = Object.values(tasksData) as any[];
          stats.total = tasksList.length;
          tasksList.forEach(task => {
            if (task.status === 'pending') stats.pending++;
            else if (task.status === 'submitted') stats.submitted++;
            else if (task.status === 'approved') {
              stats.approved++;
              stats.estimatedXP += (task.xp_earned || 0);
            }
            else if (task.status === 'rejected') stats.rejected++;
          });
        }

        // 2. PROCESS ECONOMY AUTHORITY STATE
        // summary node được generate async bởi cronjob (task_approval.js).
        // Có thể chưa tồn tại trong vài phút đầu ngày hoặc trước lần cron đầu tiên chạy.
        if (summaryData) {
          stats.completionRate = summaryData.completion_rate || 0;
          stats.reward_78_unlocked = !!summaryData.reward_78_unlocked;
          stats.reward_100_unlocked = !!summaryData.reward_100_unlocked;
        } else {
          // FALLBACK UI ONLY
          // Không dùng để quyết định reward unlock.
          // Reward authority chỉ đọc từ summary node.
          stats.completionRate = stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0;
        }

        childrenStats[uid] = stats;

        overall.total += stats.total;
        overall.pending += stats.pending;
        overall.submitted += stats.submitted;
        overall.approved += stats.approved;
        overall.rejected += stats.rejected;
        overall.estimatedXP += stats.estimatedXP;
      });

      // IMPORTANT: overall.completionRate chỉ là aggregate UI metric.
      // KHÔNG phải Economy Authority metric.
      // Reward flags và unlock states chỉ authoritative ở per-child summary node.
      overall.completionRate = overall.total > 0 
        ? Math.round((overall.approved / overall.total) * 100) 
        : 0;

      setOverview({ overall, children: childrenStats });
      setLoading(false);
    };

    childUids.forEach((childUid) => {
      const tasksRef = ref(database, `daily_logs_${yyyy_mm}/${date}/${childUid}/tasks`);
      const unsubTasks = onValue(tasksRef, (snapshot) => {
        tasksBuffer.current[childUid] = snapshot.val();
        computeAndUpdate();
      });

      const summaryRef = ref(database, `daily_logs_${yyyy_mm}/${date}/${childUid}/summary`);
      const unsubSummary = onValue(summaryRef, (snapshot) => {
        summaryBuffer.current[childUid] = snapshot.val();
        computeAndUpdate();
      });

      unsubscribes.push(unsubTasks, unsubSummary);
    });

    return () => {
      isMounted.current = false;
      unsubscribes.forEach(unsub => unsub());
    };
  }, [yyyy_mm, date, childUids.join(',')]);

  return { overview, loading };
};
