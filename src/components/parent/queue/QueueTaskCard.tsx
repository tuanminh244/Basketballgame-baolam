import { useState, useRef, useEffect } from 'react';
import { approvalService } from '../../../services/firebase/approvalService';
import { TaskWrapper } from '../../../types/dashboard';

interface Props {
  taskWrapper: TaskWrapper;
  yyyy_mm: string;
  date: string;
  parentUid: string;
}

export const QueueTaskCard = ({ taskWrapper, yyyy_mm, date, parentUid }: Props) => {
  const { childUid, task } = taskWrapper;
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const handleAction = async (action: 'approve' | 'reject') => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      if (action === 'approve') {
        await approvalService.approveTask(yyyy_mm, date, childUid, task.id, parentUid);
      } else {
        await approvalService.rejectTask(yyyy_mm, date, childUid, task.id, parentUid);
      }
    } catch (err: any) {
      if (!isMounted.current) return;
      
      setIsProcessing(false);
      setError("Task đã thay đổi hoặc có lỗi xảy ra.");
      
      setTimeout(() => {
        if (isMounted.current) setError(null);
      }, 3000);
    }
  };

  return (
    <div className={`bg-white p-4 rounded-xl shadow-sm border ${error ? 'border-red-400' : 'border-gray-100'} flex flex-col gap-3 relative transition-opacity ${isProcessing ? 'opacity-60' : 'opacity-100'}`}>
      {isProcessing && <div className="absolute inset-0 z-10"></div>}

      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full uppercase">
            {childUid === 'blam_01' ? 'Bảo Lâm' : 'Bảo Linh'}
          </span>
          <h3 className="font-bold text-lg mt-2 text-gray-800">{task.title}</h3>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-yellow-500">+{task.xp_earned} XP</p>
          <p className="text-sm font-semibold text-green-500">+{task.point_earned} Pts</p>
        </div>
      </div>

      {task.proof && (
        <div className="bg-gray-50 p-2 rounded-md text-sm text-gray-600 italic border-l-4 border-gray-300">
          " {task.proof} "
        </div>
      )}

      {error && (
        <div className="text-xs text-red-500 font-medium bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      <div className="flex gap-2 mt-2 relative z-20">
        <button 
          onClick={() => handleAction('reject')}
          disabled={isProcessing}
          className="flex-1 py-2 rounded-lg font-semibold text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isProcessing ? 'Xử lý...' : 'Yêu cầu làm lại'}
        </button>
        <button 
          onClick={() => handleAction('approve')}
          disabled={isProcessing}
          className="flex-1 py-2 rounded-lg font-semibold text-white bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
        >
          {isProcessing ? 'Xử lý...' : 'Duyệt (Approve)'}
        </button>
      </div>
    </div>
  );
};
