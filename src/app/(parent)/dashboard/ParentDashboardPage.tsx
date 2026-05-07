'use client';
import React, { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSystemConfig, useSummaryListener, useStatsListener } from '@/listeners/useRealtimeData';
import { getTodayKey } from '@/utils/systemPaths';
import { DailySummaryNode } from '@/types/schema';

export const ParentDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { config, loading: configLoading, error: configError } = useSystemConfig();
  const dateKey = getTodayKey();

  // [PRODUCTION MVP SCOPE] Single child selector MVP.
  const childUid = useMemo(() => user?.childrenUids?.[0] || '', [user?.childrenUids]);

  const { data: summary, loading: summaryLoading } = useSummaryListener(config?.current_month_node, dateKey, childUid);
  const { data: stats, loading: statsLoading } = useStatsListener(childUid);

  if (!user || (user.role !== 'checker' && user.role !== 'admin')) {
    return <div className="p-5 text-red-500 font-bold">Chỉ dành cho tài khoản Checker hoặc Admin.</div>;
  }
  if (!childUid) return <div className="p-5 text-slate-500">Tài khoản này chưa được gán kết nối với Player nào.</div>;
  if (configError) return <div className="p-5 text-red-500 font-bold">Lỗi khởi tạo hệ thống.</div>;
  if (configLoading || summaryLoading || statsLoading) {
    return <div className="p-8 text-center text-slate-500 font-medium animate-pulse">Đang đồng bộ máy chủ...</div>;
  }
  if (!summary || !stats) {
    return <div className="p-8 text-center text-slate-500">Chưa có dữ liệu tiến độ hôm nay.</div>;
  }

  // [TYPE SAFETY]
  const getStatusBadge = (status: DailySummaryNode['status']) => {
    switch(status) {
      case 'completed': return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-lg text-xs font-bold whitespace-nowrap">Hoàn thành</span>;
      case 'partial': return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-lg text-xs font-bold whitespace-nowrap">Đang tiến hành</span>;
      case 'ongoing': return <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-lg text-xs font-bold whitespace-nowrap">Mới bắt đầu</span>;
      case 'incomplete': return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-lg text-xs font-bold whitespace-nowrap">Chưa hoàn thành</span>;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-5 pb-24">
      <header className="mb-8 mt-4">
        <h1 className="text-2xl font-bold text-slate-800">Tiến độ hôm nay</h1>
        <div className="flex gap-4 mt-3">
          <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-xl text-sm font-bold">Lvl {stats.level}</div>
          <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-xl text-sm font-bold">🔥 Streak: {stats.current_streak}</div>
        </div>
      </header>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6 relative overflow-hidden">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              Hoàn thành
              {getStatusBadge(summary.status)}
            </h2>
          </div>
          <div className="text-4xl font-black text-indigo-500">{summary.completion_rate}%</div>
        </div>

        <div className="h-5 w-full bg-slate-100 rounded-full overflow-hidden relative mb-5">
          <div 
            className="h-full bg-gradient-to-r from-indigo-400 to-indigo-500 transition-all duration-1000 ease-out"
            style={{ width: `${summary.completion_rate}%` }}
          />
          <div className="absolute top-0 bottom-0 left-[78%] w-1 bg-white/60 z-10" />
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-slate-50 p-3 rounded-2xl">
            <div className="text-xs text-slate-500 font-semibold uppercase">Daily XP</div>
            <div className="text-xl font-bold text-slate-800">+{summary.xp_granted}</div>
          </div>
          <div className="bg-slate-50 p-3 rounded-2xl">
            <div className="text-xs text-slate-500 font-semibold uppercase">Total XP</div>
            <div className="text-xl font-bold text-slate-800">{stats.current_xp}</div>
          </div>
        </div>
      </div>

      <h3 className="font-bold text-slate-800 mb-3 ml-1 mt-6">Phần thưởng mốc</h3>
      <div className="space-y-3">
        <div className={`p-4 rounded-2xl flex items-center justify-between border-2 transition-all ${summary.reward_78_unlocked ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-100'}`}>
          <span className={`font-bold ${summary.reward_78_unlocked ? 'text-green-700' : 'text-slate-400'}`}>Mốc 78%</span>
          <span className="text-sm font-bold">{summary.reward_78_unlocked ? '🎁 Đã mở khóa' : '🔒 Chưa đạt'}</span>
        </div>
        <div className={`p-4 rounded-2xl flex items-center justify-between border-2 transition-all ${summary.reward_100_unlocked ? 'bg-yellow-50 border-yellow-200' : 'bg-slate-50 border-slate-100'}`}>
          <span className={`font-bold ${summary.reward_100_unlocked ? 'text-yellow-700' : 'text-slate-400'}`}>Mốc 100%</span>
          <span className="text-sm font-bold">{summary.reward_100_unlocked ? '🏆 Hoàn thành' : '🔒 Chưa đạt'}</span>
        </div>
      </div>
    </div>
  );
};
