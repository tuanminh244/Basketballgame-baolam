'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSystemConfig, useApprovalQueueListener } from '@/listeners/useRealtimeData';
import { getTodayKey, buildTaskPath } from '@/utils/systemPaths';
import { approveTask, rejectTask } from '@/services/taskTransitionService';

// [REFERENCE STABILIZATION] External static mapping
const CHILD_NAME_MAP: Record<string, string> = {
  'blam_01': '👦 Bảo Lâm',
};

export const ApprovalQueuePage: React.FC = () => {
  const { user } = useAuth();
  const { config, loading: configLoading, error: configError } = useSystemConfig();
  const dateKey = getTodayKey();

  const childrenUidsStr = user?.childrenUids?.join(',') || '';
  const childrenUids = useMemo(() => {
    return childrenUidsStr ? childrenUidsStr.split(',') : [];
  }, [childrenUidsStr]); 
  
  const { queue, loading: queueLoading } = useApprovalQueueListener(config?.current_month_node, dateKey, childrenUids);
  
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [optimisticRemoves, setOptimisticRemoves] = useState<Set<string>>(new Set());

  // [OPTIMISTIC CLEANUP]
  useEffect(() => {
    setOptimisticRemoves(prev => {
      if (prev.size === 0) return prev;
      const currentQueueIds = new Set(queue.map(t => t.id));
      const toRemove: string[] = [];
      prev.forEach(id => {
        if (!currentQueueIds.has(id)) toRemove.push(id);
      });
      if (toRemove.length === 0) return prev;
      const next = new Set(prev);
      toRemove.forEach(id => next.delete(id));
      return next;
    });
  }, [queue]);

  if (!user || (user.role !== 'checker' && user.role !== 'admin')) {
    return <div className="p-5 text-red-500 font-bold">Chỉ dành cho tài khoản Checker hoặc Admin.</div>;
  }
  if (childrenUids.length === 0) {
    return <div className="p-5 text-amber-600 font-medium">Tài khoản chưa được liên kết với Player nào.</div>;
  }
  if (configError) return <div className="p-5 text-red-500 font-bold">Lỗi khởi tạo hệ thống.</div>;
  if (configLoading || queueLoading) return <div className="p-8 text-center text-slate-500 animate-pulse">Đang tải hàng đợi...</div>;
  if (!config) return null;

  const displayQueue = queue.filter(task => !optimisticRemoves.has(task.id));

  const handleAction = async (taskId: string, childUid: string, action: 'approve' | 'reject') => {
    if (processingId === taskId) return;
    setProcessingId(taskId);
    setOptimisticRemoves(prev => new Set(prev).add(taskId)); 
    try {
      const taskPath = buildTaskPath(config.current_month_node, dateKey, childUid, taskId);
      if (action === 'approve') {
        await approveTask(taskPath, user.uid); 
      } else {
        await rejectTask(taskPath, user.uid);
      }
    } catch (e) {
      console.error("[WRITE FAIL]", e);
      setOptimisticRemoves(prev => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-5 pb-24">
      <header className="mb-6 mt-4">
        <h1 className="text-2xl font-bold text-slate-800">Cần phê duyệt</h1>
      </header>

      {displayQueue.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-3xl border border-slate-200">
          <p className="text-slate-500 font-medium">Tuyệt vời, không có nhiệm vụ nào tồn đọng!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayQueue.map(task => (
            <div key={task.id} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
              <div className="text-sm font-bold text-indigo-500 mb-1">
                {CHILD_NAME_MAP[task.childUid] || '👦 Thành viên'}
              </div>
              <h3 className="font-bold text-slate-800 text-lg mb-4">{task.title}</h3>
              <div className="flex gap-3">
                <button 
                  onClick={() => handleAction(task.id, task.childUid, 'reject')}
                  disabled={processingId === task.id}
                  className="flex-1 py-3 rounded-xl font-bold text-red-600 bg-red-50 disabled:opacity-50"
                >
                  {processingId === task.id ? 'Đang gửi...' : 'Làm lại'}
                </button>
                <button 
                  onClick={() => handleAction(task.id, task.childUid, 'approve')}
                  disabled={processingId === task.id}
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-green-500 disabled:opacity-50"
                >
                  {processingId === task.id ? 'Đang duyệt...' : `Duyệt (${task.xp_earned} XP)`}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
