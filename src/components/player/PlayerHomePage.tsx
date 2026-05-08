"use client";
import { useEffect, useState } from 'react';
import { ref, onValue, update, query, orderByChild, equalTo } from 'firebase/database';
import { db } from '@/services/firebase/config';
import { getVietnamDate } from '@/utils/time';
import { TaskLog } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export default function PlayerHomePage({ userId }: { userId: string }) {
  const [tasks, setTasks] = useState<{id: string, data: TaskLog}[]>([]);
  const [taskTemplates, setTaskTemplates] = useState<Record<string, any>>({});
  const [monthNode, setMonthNode] = useState<string>('');
  const { logout } = useAuth();

  useEffect(() => {
    const configRef = ref(db, 'system_config/current_month_node');
    const unsubConfig = onValue(configRef, (snap) => {
      if (snap.exists()) setMonthNode(snap.val());
    });

    const templatesQuery = query(ref(db, 'task_templates'), orderByChild('owner_id'), equalTo(userId));
    const unsubTemplates = onValue(templatesQuery, (snap) => {
      if (snap.exists()) setTaskTemplates(snap.val());
    });

    return () => {
      unsubConfig();
      unsubTemplates();
    };
  }, [userId]);

  useEffect(() => {
    if (!monthNode) return;
    const date = getVietnamDate();
    const tasksRef = ref(db, `${monthNode}/${date}/${userId}/tasks`);
    
    const unsubTasks = onValue(tasksRef, (snap) => {
      if (snap.exists()) {
        const data = snap.val();
        const taskArray = Object.entries(data).map(([id, t]: [string, any]) => ({ id, data: t as TaskLog }));
        setTasks(taskArray);
      } else {
        setTasks([]);
      }
    });
    return () => unsubTasks();
  }, [userId, monthNode]);

  const submitTask = async (taskId: string) => {
    if (!monthNode) return;
    const date = getVietnamDate();
    const updates: Record<string, any> = {};
    const basePath = `${monthNode}/${date}/${userId}/tasks/${taskId}`;
    
    updates[`${basePath}/status`] = "pending";
    updates[`${basePath}/updated_at`] = Date.now();
    
    await update(ref(db), updates);
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Nhiệm vụ hôm nay</h1>
        <button onClick={logout} className="text-red-500 font-bold underline">Thoát</button>
      </div>
      
      {tasks.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">Chưa có nhiệm vụ nào.</p>
      ) : (
        <div className="space-y-3">
          {tasks.map(task => (
            <div key={task.id} className="p-4 border rounded-xl shadow-sm bg-white flex justify-between items-center">
              <div>
                <p className="font-bold text-gray-800 text-lg">
                  Nhiệm vụ: {taskTemplates[task.id]?.name || task.id.slice(0, 8)}
                </p>
                <p className="text-sm font-semibold text-yellow-600">+{task.data.xp_earned} XP</p>
              </div>
              {task.data.status === "todo" && (
                <button onClick={() => submitTask(task.id)} className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg font-bold shadow">
                  Hoàn thành
                </button>
              )}
              {task.data.status === "pending" && <span className="text-orange-500 font-bold px-3 py-1 bg-orange-100 rounded-full text-sm">Chờ duyệt</span>}
              {task.data.status === "approved" && <span className="text-green-600 font-bold px-3 py-1 bg-green-100 rounded-full text-sm">Đã duyệt</span>}
              {task.data.status === "rejected" && <span className="text-red-600 font-bold px-3 py-1 bg-red-100 rounded-full text-sm">Làm lại</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
