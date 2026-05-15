'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useSessionContext } from '@/contexts/SessionContext';

export default function CheckerDashboardPage() {
  const { user } = useAuth();
  const { queue, loading } = useSessionContext();

  const pending  = queue?.length ?? 0;
  const roleLabel = user?.role === 'admin' ? 'Quản trị viên' : 'Kiểm duyệt viên';

  return (
    <div className="min-h-screen bg-slate-950 pb-10">
      <div className="bg-gradient-to-br from-emerald-600 to-teal-800 px-5 pt-12 pb-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

        <div className="flex justify-between items-start relative z-10">
          <div>
            <p className="text-emerald-200 text-sm font-medium">Xin chào 👋</p>
            <h1 className="text-white text-2xl font-black mt-0.5">{user?.name ?? 'Mẹ'}</h1>
            <p className="text-emerald-200 text-sm mt-1">{roleLabel}</p>
          </div>
        </div>

        <div className="flex gap-3 mt-6 relative z-10">
          <div className="flex-1 bg-white/10 rounded-2xl p-3 text-center">
            <p className="text-emerald-200 text-xs font-medium">Chờ duyệt</p>
            <p className="text-white text-2xl font-black">{loading ? '–' : pending}</p>
          </div>
        </div>
      </div>

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
      </div>
    </div>
  );
}
