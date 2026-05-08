'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSystemConfig, useChildTasksListener, useStatsListener, useSummaryListener } from '@/listeners/useRealtimeData';
import { getTodayKey, buildTaskPath } from '@/utils/systemPaths';
import { submitTask } from '@/services/taskTransitionService';
import { ChildTaskCard } from '@/components/child/ChildTaskCard';
import { TaskStatus } from '@/types/schema';

export const ChildHomePage: React.FC = () => {
  const { user } = useAuth();
  const { config, loading: configLoading, error: configError } = useSystemConfig();
  const dateKey = getTodayKey();

  const { tasks, loading: tasksLoading } = useChildTasksListener(config?.current_month_node, dateKey, user?.uid);
  const { data: stats } = useStatsListener(user?.id);
  const { data: summary } = useSummaryListener(config?.current_month_node, dateKey, user?.uid);

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [optimisticStatuses, setOptimisticStatuses] = useState<Record<string, TaskStatus>>({});

  // [OPTIMISTIC CLEANUP] Sync local display state with RTDB source-of-truth
  useEffect(() => {
    setOptimisticStatuses(prev => {
      const next = { ...prev };
      let hasChanges = false;
      tasks.forEach(task => {
        if (next[task.id] && next[task.id] === task.status) {
          delete next[task.id];
          hasChanges = true;
        }
      });
      return hasChanges ? next : prev;
    });
  }, [tasks]);

  if (!user || user.role !== 'player') return <div className="p-5 text-red-500 font-bold">Chỉ dành cho tài khoản Player.</div>;
  if (configError) return <div className="p-5 text-red-500 font-bold">Lỗi khởi tạo hệ thống.</div>;
  if (configLoading || tasksLoading) return <div className="p-8 text-center text-slate-500 animate-pulse">Đang tải nhiệm vụ...</div>;
  if (!config) return null;

  const handleSubmit = async (taskId: string) => {
    if (processingId === taskId) return;
    setProcessingId(taskId);
    setOptimisticStatuses(prev => ({ ...prev, [taskId]: 'pending' })); 
    try {
      const taskPath = buildTaskPath(config.current_month_node, dateKey, user.uid, taskId);
      await submitTask(taskPath); 
    } catch (e) {
      console.error("[WRITE FAIL]", e);
      setOptimisticStatuses(prev => {
        const next = { ...prev };
        delete next[taskId];
        return next;
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FF] p-5 pb-24 font-sans">
      <header className="mb-4 mt-2 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Nhiệm vụ</h1>
          <p className="text-slate-500 font-medium mt-1">Cố lên {user.name}! 🚀</p>
        </div>
        {stats && (
          <div className="flex flex-col gap-1.5 items-end">
            <div className="flex gap-1.5">
              <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-xl text-xs font-black shadow-sm tracking-wide">
                LVL {stats.level}
              </div>
              <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-xl text-xs font-black shadow-sm tracking-wide">
                ⭐ {stats.current_xp} XP
              </div>
            </div>
            <div className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-xl text-xs font-black shadow-sm tracking-wide">
              💎 {stats.total_points}
            </div>
          </div>
        )}
      </header>

      {summary && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-slate-700">Tiến độ hôm nay</span>
            <span className="text-sm font-black text-indigo-500">{summary.completion_rate}%</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden relative">
            <div 
              className="h-full bg-indigo-500 transition-all duration-700 ease-out"
              style={{ width: `${summary.completion_rate}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className={`text-xs font-bold ${summary.reward_78_unlocked ? 'text-green-600' : 'text-slate-400'}`}>
              {summary.reward_78_unlocked ? '🎁 Mốc 1' : '🔒 Mốc 1'}
            </span>
            <span className={`text-xs font-bold ${summary.reward_100_unlocked ? 'text-yellow-600' : 'text-slate-400'}`}>
              {summary.reward_100_unlocked ? '🏆 Mốc 2' : '🔒 Mốc 2'}
            </span>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {tasks.length === 0 ? (
          summary?.status === 'completed' || summary?.status === 'partial' ? (
            <div className="text-center py-16 px-6 bg-white rounded-3xl border-2 border-dashed border-slate-200">
              <span className="text-6xl block mb-4 animate-bounce">🎮</span>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Hoàn thành hết rồi!</h3>
              <p className="text-slate-500 font-medium">Con đã quét sạch nhiệm vụ hôm nay. Quá đỉnh!</p>
            </div>
          ) : (
            <div className="text-center py-16 px-6 bg-white rounded-3xl border-2 border-dashed border-slate-200">
              <span className="text-6xl block mb-4 animate-bounce">🌱</span>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Chưa có nhiệm vụ</h3>
              <p className="text-slate-500 font-medium">Mẹ chưa giao nhiệm vụ cho hôm nay. Con nghỉ ngơi nhé!</p>
            </div>
          )
        ) : (
          tasks.map(task => {
            const displayTask = { ...task, status: optimisticStatuses[task.id] || task.status };
            return (
              <ChildTaskCard key={task.id} task={displayTask} disabled={processingId === task.id} onSubmit={handleSubmit} />
            );
          })
        )}
      </div>
    </div>
  );
};
