"use client";
import { useEffect, useState } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { db } from '@/services/firebase/config';
import { getVietnamDate } from '@/utils/time';
import { TaskLog } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function ApprovalQueuePage() {
  const [pendingTasks, setPendingTasks] = useState<any[]>([]);
  const [monthNode, setMonthNode] = useState<string>('');
  const { user } = useAuth();

  useEffect(() => {
    const configRef = ref(db, 'system_config/current_month_node');
    const unsubConfig = onValue(configRef, (snap) => {
      if (snap.exists()) setMonthNode(snap.val());
    });
    return () => unsubConfig();
  }, []);

  useEffect(() => {
    if (!monthNode) return;
    const date = getVietnamDate();
    const logsRef = ref(db, `${monthNode}/${date}`);

    const unsub = onValue(logsRef, (snap) => {
      if (snap.exists()) {
        const usersData = snap.val();
        let queue: any[] = [];
        
        for (const [userId, logData] of Object.entries<any>(usersData)) {
          if (!logData.tasks) continue;
          for (const [taskId, taskInfo] of Object.entries<TaskLog>(logData.tasks)) {
            if (taskInfo.status === "pending") {
              queue.push({ userId, taskId, ...taskInfo });
            }
          }
        }
        setPendingTasks(queue);
      } else {
        setPendingTasks([]);
      }
    });
    return () => unsub();
  }, [monthNode]);

  const handleApprove = async (userId: string, taskId: string, isApproved: boolean) => {
    if (!monthNode || !user) return;
    const date = getVietnamDate();
    const updates: Record<string, any> = {};
    const basePath = `${monthNode}/${date}/${userId}/tasks/${taskId}`;
    
    updates[`${basePath}/status`] = isApproved ? "approved" : "rejected";
    updates[`${basePath}/updated_at`] = Date.now();
    updates[`${basePath}/verified_by`] = user.id;
    
    await update(ref(db), updates);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Hàng Chờ Phê Duyệt</h1>
        <Link href="/dashboard" className="text-blue-500 font-bold underline">Quay lại</Link>
      </div>
      
      {pendingTasks.length === 0 ? (
        <div className="bg-white p-8 rounded-xl text-center shadow-sm border border-gray-200">
          <p className="text-gray-500 font-medium">Tuyệt vời! Không có nhiệm vụ nào cần duyệt.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingTasks.map((task, idx) => (
            <div key={idx} className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm flex justify-between items-center">
              <div>
                <p className="font-bold text-lg text-blue-800">ID Người Chơi: <span className="text-gray-700">{task.userId}</span></p>
                <p className="text-gray-600 mt-1">Nhiệm vụ: {task.taskId.slice(0, 8)}</p>
                <p className="text-sm font-semibold text-yellow-600 mt-1">Thưởng: {task.xp_earned} XP</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => handleApprove(task.userId, task.taskId, true)} 
                  className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg font-bold shadow"
                >
                  Duyệt
                </button>
                <button 
                  onClick={() => handleApprove(task.userId, task.taskId, false)} 
                  className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg font-bold shadow"
                >
                  Từ chối
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
