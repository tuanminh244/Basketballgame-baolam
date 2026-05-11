import { get, child, query, orderByChild, equalTo } from 'firebase/database';
import { refs } from './refs';

// Reusable Firebase query helpers
// STRICT RULE: ONLY database queries, NO business logic.

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
 */
export const getDailyTasks = async (yyyyMM: string, date: string, userId: string) => {
  const snapshot = await get(refs.dailyTasks(yyyyMM, date, userId));
  return snapshot.val();
};

/**
 * Lấy danh sách nhiệm vụ đang chờ phê duyệt (Pending)
 * Tạm chấp nhận truy vấn không có index để tránh phá vỡ architecture lock lúc này.
 */
export const getPendingApprovals = async (yyyyMM: string, date: string, userId: string) => {
  const tasksRef = refs.dailyTasks(yyyyMM, date, userId);
  const pendingQuery = query(tasksRef, orderByChild('status'), equalTo('pending'));
  const snapshot = await get(pendingQuery);
  return snapshot.val();
};
