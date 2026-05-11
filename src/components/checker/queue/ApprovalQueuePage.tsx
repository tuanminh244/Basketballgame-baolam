"use client";
import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/services/firebase/config';
import { approveTaskAtomic } from '@/services/approvalService';
import { getVietnamDate } from '@/utils/time';
import { TaskLog } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface PendingTask {
  userId: string;
  taskId: string;
  xp_earned: number;
  point_earned: number;
  updated_at: number;
}

const PLAYER_DISPLAY: Record<string, { name: string; emoji: string }> = {
  blam_01:  { name: 'Bảo Lâm',  emoji: '🏀' },
  blinh_02: { name: 'Bảo Linh', emoji: '⭐' },
};

const TASK_DISPLAY: Record<string, string> = {
  morning_basketball: '🏀 Bóng rổ buổi sáng',
  homework_math:      '📘 Bài tập Toán',
  reading_english:    '📖 Đọc tiếng Anh',
};

export default function ApprovalQueuePage() {
  const [pending, setPending]         = useState<PendingTask[]>([]);
  const [monthNode, setMonthNode]     = useState('');
  const [processingId, setProcessing] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const unsub = onValue(ref(db, 'system_config/current_month_node'), snap => {
      if (snap.exists()) setMonthNode(snap.val());
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!monthNode) return;
    const unsub = onValue(ref(db, `${monthNode}/${getVietnamDate()}`), snap => {
      if (!snap.exists()) { setPending([]); return; }
      const queue: PendingTask[] = [];
      const data = snap.val();
      for (const userId in data) {
        const tasks = data[userId]?.tasks || {};
        for (const taskId in tasks) {
          const t = tasks[taskId] as TaskLog;
          if (t.status === 'pending') {
            queue.push({ userId, taskId, xp_earned: t.xp_earned, point_earned: t.point_earned, updated_at: t.updated_at });
          }
        }
      }
      queue.sort((a, b) => a.updated_at - b.updated_at);
      setPending(queue);
    });
    return () => unsub();
  }, [monthNode]);

  const handleAction = async (task: PendingTask, approve: boolean) => {
    if (!monthNode || !user || processingId) return;
    const key = `${task.userId}_${task.taskId}`;
    setProcessing(key);
    try {
      await approveTaskAtomic(monthNode, getVietnamDate(), task.userId, task.taskId, approve, user.id);
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-10">

      <div className="bg-slate-900 border-b border-slate-800 px-5 pt-14 pb-5">
        <div className="flex items-center gap-3 mb-1">
          <Link href="/dashboard" className="text-slate-400 hover:text-white transition text-sm">
            ← Dashboard
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-white text-xl font-black">Hàng chờ duyệt</h1>
          {pending.length > 0 && (
            <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              {pending.length} chờ
            </span>
          )}
        </div>
      </div>

      <div className="px-5 mt-5">
        {pending.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-6xl mb-4">🎉</p>
            <p className="text-white font-bold text-lg">Tuyệt vời!</p>
            <p className="text-slate-400 text-sm mt-1">Không có nhiệm vụ nào cần duyệt.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map(task => {
              const key      = `${task.userId}_${task.taskId}`;
              const isBusy   = processingId === key;
              const anyBusy  = processingId !== null;
              const player   = PLAYER_DISPLAY[task.userId] ?? { name: task.userId, emoji: '👤' };
              const taskName = TASK_DISPLAY[task.taskId] || `ID: ${task.taskId.slice(0, 12)}...`;

              return (
                <div key={key}
                  className={`bg-slate-800 border border-slate-700 rounded-2xl p-4 transition-all ${isBusy ? 'opacity-60' : ''}`}>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center text-xl">
                      {player.emoji}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-bold text-sm">{player.name}</p>
                      <p className="text-slate-500 text-xs">{taskName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-yellow-400 text-sm font-bold">+{task.xp_earned} XP</p>
                      <p className="text-slate-500 text-xs">{task.point_earned} pts</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction(task, true)}
                      disabled={anyBusy}
                      className="flex-1 py-3 bg-green-600 hover:bg-green-500 active:scale-95 text-white font-bold text-sm rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-900/30">
                      {isBusy ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Đang xử lý...
                        </span>
                      ) : '✅ Duyệt'}
                    </button>
                    <button
                      onClick={() => handleAction(task, false)}
                      disabled={anyBusy}
                      className="flex-1 py-3 bg-slate-700 hover:bg-red-900/60 active:scale-95 text-slate-300 hover:text-red-300 font-bold text-sm rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-slate-600">
                      ❌ Từ chối
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
