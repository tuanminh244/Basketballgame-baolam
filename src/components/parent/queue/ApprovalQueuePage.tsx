import { usePendingTasks } from '../../../hooks/usePendingTasks';
import { QueueTaskCard } from './QueueTaskCard';

interface Props {
  parentUid: string;
  yyyy_mm: string;
  date: string;
  childrenUids: string[];
}

export const ApprovalQueuePage = ({ parentUid, yyyy_mm, date, childrenUids }: Props) => {
  const { tasks, loading } = usePendingTasks(yyyy_mm, date, childrenUids);

  return (
    <div className="max-w-md mx-auto p-4 bg-gray-50 min-h-screen">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Hàng đợi kiểm duyệt</h1>
        <p className="text-sm text-gray-500">Chờ Mẹ xác nhận để hệ thống xử lý điểm</p>
      </header>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-400 font-medium">Tuyệt vời! Không còn nhiệm vụ nào chờ duyệt.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {tasks.map((taskWrapper) => (
            <QueueTaskCard 
              key={`${taskWrapper.childUid}-${taskWrapper.task.id}`}
              taskWrapper={taskWrapper}
              yyyy_mm={yyyy_mm}
              date={date}
              parentUid={parentUid}
            />
          ))}
        </div>
      )}
    </div>
  );
};
