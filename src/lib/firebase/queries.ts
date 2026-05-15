import { get } from 'firebase/database';
import { refs } from './refs';

// Reusable Firebase query helpers
// STRICT RULE: ONLY one-time database queries, NO complex business logic.

/**
 * Lấy thông tin user theo ID
 */
export const getUserById = async (userId: string) => {
  const snapshot = await get(refs.user(userId));
  return snapshot.val();
};

/**
 * Lấy dữ liệu ví (stats) cho một user
 */
export const getWalletData = async (userId: string) => {
  const snapshot = await get(refs.userStats(userId));
  return snapshot.val();
};

/**
 * Lấy nhiệm vụ hằng ngày của user theo ngày cụ thể
 * Truyền `monthNode` từ hệ thống (VD: "daily_logs_2026_05")
 */
export const getDailyTasks = async (monthNode: string, date: string, userId: string) => {
  const snapshot = await get(refs.dailyTasks(monthNode, date, userId));
  return snapshot.val();
};

/**
 * Lấy danh sách nhiệm vụ đang chờ phê duyệt (Pending)
 * Lọc in-memory do Economy Limit đã khóa <= 10 tasks/ngày (chi phí fetch cực thấp).
 */
export const getPendingApprovals = async (monthNode: string, date: string, userId: string) => {
  const tasksRef = refs.dailyTasks(monthNode, date, userId);
  const snapshot = await get(tasksRef);
  
  if (!snapshot.exists()) return null;
  
  const allTasks = snapshot.val();
  const pendingTasks: Record<string, any> = {};
  
  // Thin in-memory filter
  for (const [taskId, taskData] of Object.entries<any>(allTasks)) {
    if (taskData.status === 'pending') {
      pendingTasks[taskId] = taskData;
    }
  }
  
  return Object.keys(pendingTasks).length > 0 ? pendingTasks : null;
};
