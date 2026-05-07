import React from 'react';
import { TaskNodeReadModel } from '@/types/schema';

interface ChildTaskCardProps {
  task: TaskNodeReadModel;
  disabled?: boolean;
  onSubmit: (taskId: string) => void;
}

export const ChildTaskCard: React.FC<ChildTaskCardProps> = ({ task, disabled, onSubmit }) => {
  const isTodo = task.status === 'todo';
  const isRejected = task.status === 'rejected';

  return (
    <div className={`rounded-3xl p-5 mb-4 border-b-4 transition-all duration-300 relative overflow-hidden
      ${task.status === 'approved' ? 'bg-green-100 border-green-300 opacity-70' : 'bg-white border-slate-200 shadow-sm'}`}
    >
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-slate-800 text-xl w-2/3 leading-tight">{task.title}</h3>
        <div className="bg-amber-400 text-amber-900 px-3 py-1.5 rounded-2xl font-black text-sm shadow-sm rotate-2 transform hover:rotate-0 transition-transform">
          +{task.xp_earned} XP
        </div>
      </div>
      
      <div className="mt-5 flex items-center justify-between">
        <div className="font-semibold text-sm">
          {task.status === 'todo' && <span className="text-slate-400">⚡ Chờ con làm</span>}
          {task.status === 'pending' && <span className="text-blue-500 animate-pulse">⏳ Đang đợi mẹ xem...</span>}
          {task.status === 'approved' && <span className="text-green-600">🎉 Mẹ khen rồi!</span>}
          {task.status === 'rejected' && <span className="text-red-500">❌ Cần làm lại xíu</span>}
        </div>

        {(isTodo || isRejected) && (
          <button 
            disabled={disabled}
            onClick={() => onSubmit(task.id)}
            className="bg-indigo-500 text-white font-bold py-2.5 px-6 rounded-2xl border-b-4 border-indigo-700 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50 disabled:active:border-b-4 disabled:active:translate-y-0"
          >
            {disabled ? 'Đang gửi...' : 'Xong rồi!'}
          </button>
        )}
      </div>
    </div>
  );
};
