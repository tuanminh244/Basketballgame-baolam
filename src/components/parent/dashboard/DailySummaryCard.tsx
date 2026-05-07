import { TaskStats } from '../../../types/dashboard';

export const DailySummaryCard = ({ stats }: { stats: TaskStats }) => {
  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Tổng quan hôm nay</h2>
        <span className="text-2xl font-black">{stats.completionRate}%</span>
      </div>

      <div className="w-full bg-white/20 rounded-full h-2.5 mb-6">
        <div 
          className="bg-white h-2.5 rounded-full transition-all duration-500" 
          style={{ width: `${Math.min(stats.completionRate, 100)}%` }}
        ></div>
      </div>

      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="bg-white/10 rounded-lg p-2">
          <p className="text-xs text-indigo-100 mb-1">Chờ duyệt</p>
          <p className="text-xl font-bold">{stats.submitted}</p>
        </div>
        <div className="bg-white/10 rounded-lg p-2">
          <p className="text-xs text-indigo-100 mb-1">Đã duyệt</p>
          <p className="text-xl font-bold">{stats.approved}</p>
        </div>
        <div className="bg-white/10 rounded-lg p-2">
          <p className="text-xs text-indigo-100 mb-1">Làm lại</p>
          <p className="text-xl font-bold">{stats.rejected}</p>
        </div>
        <div className="bg-white/10 rounded-lg p-2">
          <p className="text-xs text-indigo-100 mb-1">Chưa làm</p>
          <p className="text-xl font-bold">{stats.pending}</p>
        </div>
      </div>
    </div>
  );
};
