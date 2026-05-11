"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/services/firebase/config';
import { getVietnamDate } from '@/utils/time';
import { useAuth } from '@/contexts/AuthContext';

export default function CheckerDashboardPage() {
  const [monthNode, setMonthNode] = useState('');
  const [pending, setPending]     = useState(0);
  const [approved, setApproved]   = useState(0);
  const [total, setTotal]         = useState(0);
  const { user, logout } = useAuth();

  useEffect(() => {
    const unsub = onValue(ref(db, 'system_config/current_month_node'), snap => {
      if (snap.exists()) setMonthNode(snap.val());
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!monthNode) return;
    const unsub = onValue(ref(db, `${monthNode}/${getVietnamDate()}`), snap => {
      if (!snap.exists()) {
        setPending(0); setApproved(0); setTotal(0);
        return;
      }
      let p = 0, a = 0, t = 0;
      const data = snap.val();
      for (const uid in data) {
        const tasks = data[uid]?.tasks || {};
        for (const tid in tasks) {
          t++;
          if (tasks[tid].status === 'pending')  p++;
          if (tasks[tid].status === 'approved') a++;
        }
      }
      setPending(p); setApproved(a); setTotal(t);
    });
    return () => unsub();
  }, [monthNode]);

  const ROLE_LABEL = user?.role === 'admin' ? 'Quản trị viên' : 'Kiểm duyệt viên';

  return (
    <div className="min-h-screen bg-slate-950 pb-10">

      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-800 px-5 pt-12 pb-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

        <div className="flex justify-between items-start relative z-10">
          <div>
            <p className="text-emerald-200 text-sm font-medium">Xin chào 👋</p>
            <h1 className="text-white text-2xl font-black mt-0.5">{user?.name ?? 'Mẹ'}</h1>
            <p className="text-emerald-200 text-sm mt-1">{ROLE_LABEL}</p>
          </div>
          <button onClick={logout}
            className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-xl text-sm font-medium transition">
            Thoát
          </button>
        </div>

        {/* Stats */}
        <div className="flex gap-3 mt-6 relative z-10">
          <div className="flex-1 bg-white/10 rounded-2xl p-3 text-center">
            <p className="text-emerald-200 text-xs font-medium">Tổng</p>
            <p className="text-white text-2xl font-black">{total}</p>
          </div>
          <div className="flex-1 bg-amber-500/20 border border-amber-500/30 rounded-2xl p-3 text-center">
            <p className="text-amber-200 text-xs font-medium">Chờ duyệt</p>
            <p className="text-amber-300 text-2xl font-black">{pending}</p>
          </div>
          <div className="flex-1 bg-green-500/20 border border-green-500/30 rounded-2xl p-3 text-center">
            <p className="text-green-200 text-xs font-medium">Đã duyệt</p>
            <p className="text-green-300 text-2xl font-black">{approved}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 -mt-4 space-y-3">
        <Link href="/queue"
          className="block bg-slate-800 border border-slate-700 rounded-2xl p-5 shadow-xl hover:bg-slate-700 transition active:scale-95 relative overflow-hidden">
          {pending > 0 && (
            <span className="absolute top-4 right-4 bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {pending} chờ
            </span>
          )}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center text-2xl">✅</div>
            <div>
              <p className="text-white font-bold text-base">Duyệt nhiệm vụ</p>
              <p className="text-slate-400 text-sm mt-0.5">Xem và phê duyệt các nhiệm vụ đang chờ</p>
            </div>
          </div>
        </Link>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 opacity-60">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center text-2xl">🏪</div>
            <div>
              <p className="text-white font-bold text-base">Cửa hàng</p>
              <p className="text-slate-500 text-sm mt-0.5">Sắp ra mắt...</p>
            </div>
          </div>
        </div>

        {/* Today summary bar */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 mt-2">
          <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold mb-3">Hôm nay</p>
          <div className="h-2.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
              style={{ width: total > 0 ? `${Math.round((approved / total) * 100)}%` : '0%' }} />
          </div>
          <p className="text-slate-500 text-xs mt-2">
            {total > 0
              ? `${approved}/${total} nhiệm vụ hoàn thành (${Math.round((approved / total) * 100)}%)`
              : 'Chưa có nhiệm vụ nào hôm nay'}
          </p>
        </div>
      </div>
    </div>
  );
}
