import { TaskStats } from '../../../types/dashboard';

interface Props {
  childName: string;
  stats: TaskStats;
}

export const ChildProgressCard = ({ childName, stats }: Props) => {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg text-gray-800">{childName}</h3>
        <span className="text-sm font-semibold text-yellow-500 bg-yellow-50 px-2 py-1 rounded">
          Dự kiến: +{stats.estimatedXP} XP
        </span>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-600 my-1">
        <div className="flex flex-col">
          <span className="text-gray-400 text-xs">Tiến độ</span>
          <span className="font-medium text-gray-700">{stats.approved} / {stats.total} Task</span>
        </div>
        <div className="h-8 w-px bg-gray-200"></div>
        <div className="flex flex-col">
          <span className="text-gray-400 text-xs">Chờ mẹ duyệt</span>
          <span className="font-medium text-blue-600">{stats.submitted} Task</span>
        </div>
      </div>

      <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
        <div className="flex justify-between text-xs font-semibold mb-1 text-gray-600">
          <span>Mức hoàn thành ({stats.completionRate}%)</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 mb-3 relative">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${stats.reward_100_unlocked ? 'bg-green-500' : 'bg-blue-500'}`}
            style={{ width: `${Math.min(stats.completionRate, 100)}%` }}
          ></div>
          <div className="absolute top-0 bottom-0 w-0.5 bg-red-400" style={{ left: '78%' }}></div>
        </div>

        <div className="flex flex-col gap-1 text-xs font-medium">
          {stats.reward_100_unlocked ? (
            <p className="text-green-600">🏆 Tuyệt vời! Hoàn thành 100% nhiệm vụ hôm nay.</p>
          ) : stats.reward_78_unlocked ? (
            <p className="text-blue-600">🎉 Đã mở thưởng 78%! Cố gắng lên 100% nhé.</p>
          ) : (
             <p className="text-gray-500 italic">Đang thu thập điểm, chưa đủ mốc mở thưởng (78%).</p>
          )}
        </div>
      </div>
    </div>
  );
};
