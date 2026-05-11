"use client";
import { useEffect, useState } from 'react';
import { ref, onValue, query, orderByChild, equalTo } from 'firebase/database';
import { db } from '@/services/firebase/config';
import { submitTaskAtomic } from '@/services/firebase/dbService';
import { getVietnamDate } from '@/utils/time';
import { TaskLog } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

const LEVEL_XP = [0, 300, 700, 1300, 2000, 3000, 4500, 6500, 9000, 12000];

const STATUS_CONFIG: Record<string, {
  label: string; icon: string; bg: string; text: string; border: string;
}> = {
  todo:     { label: 'Chưa làm',  icon: '📋', bg: 'bg-slate-800',    text: 'text-slate-400', border: 'border-slate-700' },
  pending:  { label: 'Chờ duyệt', icon: '⏳', bg: 'bg-amber-900/30', text: 'text-amber-400', border: 'border-amber-700'  },
  approved: { label: 'Đã duyệt',  icon: '✅', bg: 'bg-green-900/30', text: 'text-green-400', border: 'border-green-700'  },
  rejected: { label: 'Làm lại',   icon: '🔄', bg: 'bg-red-900/30',   text: 'text-red-400',   border: 'border-red-700'   },
};

export default function PlayerHomePage({ userId }: { userId: string }) {
  const [tasks, setTasks]           = useState<{ id: string; data: TaskLog }[]>([]);
  const [templates, setTemplates]   = useState<Record<string, any>>({});
  const [monthNode, setMonthNode]   = useState('');
  const [stats, setStats]           = useState<any>(null);
  const [summary, setSummary]       = useState<any>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const { user, logout } = useAuth();

  // Config listener
  useEffect(() => {
    const unsub = onValue(ref(db, 'system_config/current_month_node'), snap => {
      if (snap.exists()) setMonthNode(snap.val());
    });
    return () => unsub();
  }, []);

  // Stats listener
  useEffect(() => {
    const unsub = onValue(ref(db, `users/${userId}/stats`), snap => {
      if (snap.exists()) setStats(snap.val());
    });
    return () => unsub();
  }, [userId]);

  // Templates listener
  useEffect(() => {
    const q = query(ref(db, 'task_templates'), orderByChild('owner_id'), equalTo(userId));
    const unsub = onValue(q, snap => {
      if (snap.exists()) {
        setTemplates(snap.val() || {});
      } else {
        setTemplates({});
      }
    });
    return () => unsub();
  }, [userId]);

  // Tasks listener
  useEffect(() => {
    if (!monthNode) return;
    const unsub = onValue(ref(db, `${monthNode}/${getVietnamDate()}/${userId}/tasks`), snap => {
      if (snap.exists()) {
        setTasks(Object.entries(snap.val()).map(([id, t]: any) => ({ id, data: t as TaskLog })));
      } else {
        setTasks([]);
      }
    });
    return () => unsub();
  }, [userId, monthNode]);

  // Summary listener — backend authority for economy state
  useEffect(() => {
    if (!monthNode) return;
    const unsub = onValue(
      ref(db, `${monthNode}/${getVietnamDate()}/${userId}/summary`),
      snap => setSummary(snap.exists() ? snap.val() : null)
    );
    return () => unsub();
  }, [userId, monthNode]);

  const handleSubmit = async (taskId: string) => {
    if (!monthNode || processing) return;
    setProcessing(taskId);
    try {
      await submitTaskAtomic(monthNode, getVietnamDate(), userId, taskId);
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(null);
    }
  };

  // Stats derived
  const level     = stats?.level ?? 1;
  const currentXp = stats?.current_xp ?? 0;
  const points    = stats?.total_points ?? 0;
  const streak    = stats?.current_streak ?? 0;
  const nextLvXp  = LEVEL_XP[Math.min(level, LEVEL_XP.length - 1)] || 300;
  const prevLvXp  = LEVEL_XP[Math.max(level - 1, 0)] || 0;
  const range     = nextLvXp - prevLvXp;
  const xpPct     = range > 0
    ? Math.min(100, Math.round(((currentXp - prevLvXp) / range) * 100))
    : 0;

  // Economy state — backend authoritative only
  const donePct        = summary?.completion_rate ?? 0;
  const isRewardUnlocked = summary?.reward_78_unlocked || summary?.reward_100_unlocked;

  return (
    <div className="min-h-screen bg-slate-950 pb-8">

      {/* Header */}
      <div className="bg-gradient-to-br from-sky-600 to-blue-800 px-5 pt-12 pb-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        <div className="flex justify-between items-start relative z-10">
          <div>
            <p className="text-sky-200 text-sm font-medium">Xin chào 👋</p>
            <h1 className="text-white text-2xl font-black mt-0.5">{user?.name ?? 'Bảo Lâm'}</h1>
          </div>
          <button onClick={logout}
            className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-xl text-sm font-medium transition">
            Thoát
          </button>
        </div>

        {/* Stats row */}
        <div className="flex gap-3 mt-6 relative z-10">
          <div className="flex-1 bg-white/10 rounded-2xl p-3 text-center">
            <p className="text-sky-200 text-xs font-medium">Cấp độ</p>
            <p className="text-white text-xl font-black">Lv.{level}</p>
          </div>
          <div className="flex-1 bg-white/10 rounded-2xl p-3 text-center">
            <p className="text-sky-200 text-xs font-medium">Điểm</p>
            <p className="text-white text-xl font-black">{points}</p>
          </div>
          <div className="flex-1 bg-white/10 rounded-2xl p-3 text-center">
            <p className="text-sky-200 text-xs font-medium">Streak</p>
            <p className="text-white text-xl font-black">🔥{streak}</p>
          </div>
        </div>

        {/* XP Bar */}
        <div className="mt-4 relative z-10">
          <div className="flex justify-between text-xs text-sky-200 mb-1.5">
            <span>XP: {currentXp}</span>
            <span>Lv.{level + 1} cần {nextLvXp} XP</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all duration-700"
              style={{ width: `${xpPct}%` }} />
          </div>
        </div>
      </div>

      {/* Daily progress — backend authoritative */}
      <div className="px-5 -mt-4">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 shadow-xl">
          <div className="flex justify-between items-center mb-2">
            <p className="text-slate-300 text-sm font-semibold">Tiến độ hôm nay</p>
            <span className={`text-sm font-bold ${donePct >= 78 ? 'text-green-400' : 'text-amber-400'}`}>
              {donePct}%
            </span>
          </div>
          <div className="h-2.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${donePct >= 78 ? 'bg-green-500' : 'bg-amber-500'}`}
              style={{ width: `${donePct}%` }} />
          </div>
          <p className="text-slate-500 text-xs mt-2">
            Mức độ hoàn thành: {donePct}%
            {isRewardUnlocked && ' 🎉 Phần thưởng đã mở!'}
          </p>
        </div>
      </div>

      {/* Task list */}
      <div className="px-5 mt-5">
        <h2 className="text-white font-bold text-lg mb-3">📋 Nhiệm vụ hôm nay</h2>

        {tasks.length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center">
            <p className="text-4xl mb-3">😴</p>
            <p className="text-slate-400 text-sm">Chưa có nhiệm vụ nào hôm nay.</p>
            <p className="text-slate-600 text-xs mt-1">Bố sẽ cài nhiệm vụ sớm thôi!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map(task => {
              const cfg    = STATUS_CONFIG[task.data.status] ?? STATUS_CONFIG.todo;
              const name   = templates[task.id]?.name ?? task.id.slice(0, 10);
              const isBusy = processing === task.id;
              const canDo  = task.data.status === 'todo';

              return (
                <div key={task.id}
                  className={`${cfg.bg} border ${cfg.border} rounded-2xl p-4 flex items-center gap-4 transition-all`}>
                  <span className="text-2xl">{cfg.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{name}</p>
                    <p className="text-yellow-500 text-xs font-medium mt-0.5">+{task.data.xp_earned} XP</p>
                    <p className={`text-xs mt-0.5 ${cfg.text}`}>{cfg.label}</p>
                  </div>
                  {canDo && (
                    <button
                      onClick={() => handleSubmit(task.id)}
                      disabled={!!processing}
                      className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all
                        ${isBusy
                          ? 'bg-slate-600'
                          : 'bg-sky-500 hover:bg-sky-600 active:scale-95 shadow-lg shadow-sky-500/30'
                        }`}>
                      {isBusy
                        ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin block" />
                        : 'Nộp'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
