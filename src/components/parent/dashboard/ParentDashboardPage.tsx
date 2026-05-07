import { useDailyTaskOverview } from '../../../hooks/useDailyTaskOverview';
import { DailySummaryCard } from './DailySummaryCard';
import { ChildProgressCard } from './ChildProgressCard';

interface Props {
  yyyy_mm: string;
  date: string;
}

export const ParentDashboardPage = ({ yyyy_mm, date }: Props) => {
  const childrenMap = {
    'blam_01': 'Bảo Lâm',
    'blinh_02': 'Bảo Linh'
  };
  const childUids = Object.keys(childrenMap);

  const { overview, loading } = useDailyTaskOverview(yyyy_mm, date, childUids);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 bg-gray-50 min-h-screen pb-20">
      <header className="mb-6 mt-2 text-center">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Gia Đình</h1>
        <p className="text-sm text-gray-500 mt-1">Nguồn dữ liệu: Economy Engine</p>
      </header>

      <DailySummaryCard stats={overview.overall} />

      <div className="flex flex-col gap-4">
        {childUids.map(uid => (
          <ChildProgressCard 
            key={uid}
            childName={childrenMap[uid as keyof typeof childrenMap]}
            stats={overview.children[uid] || { 
              total: 0, pending: 0, submitted: 0, approved: 0, rejected: 0, estimatedXP: 0,
              completionRate: 0, reward_78_unlocked: false, reward_100_unlocked: false
            }}
          />
        ))}
      </div>
    </div>
  );
};
