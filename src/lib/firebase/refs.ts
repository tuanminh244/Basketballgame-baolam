import { ref } from 'firebase/database';
import { db } from './config';

// Centralized Firebase database refs
// Strict schema mapping according to FIREBASE_SCHEMA_LOCK.md

export const refs = {
  // System State
  connected: () => ref(db, '.info/connected'),

  // Global nodes
  users: () => ref(db, 'users'),
  systemConfig: () => ref(db, 'system_config'),
  systemConfigMonthNode: () => ref(db, 'system_config/current_month_node'),
  taskTemplates: () => ref(db, 'task_templates'),
  taskBatches: () => ref(db, 'task_batches'),
  storeItems: () => ref(db, 'store_items'),
  transactions: () => ref(db, 'transactions'),
  penaltyLogs: () => ref(db, 'penalty_logs'),
  adminLogs: () => ref(db, 'admin_logs'),
  sessions: () => ref(db, 'user_index'),
  rewards: () => ref(db, 'rewards'),

  // Dynamic user nodes
  user: (userId: string) => ref(db, `users/${userId}`),
  userStats: (userId: string) => ref(db, `users/${userId}/stats`),
  // LƯU Ý: Các trường của User được lưu trực tiếp dưới users/{uid}
  // Không có node profile lồng nhau nào được phép tồn tại theo schema lock.

  // Reward sub-refs
  rewardBatch: (batchId: string) => ref(db, `reward_batches/${batchId}`),

  // Penalty sub-refs
  penaltyLogUser: (userId: string) => ref(db, `penalty_logs/${userId}`),

  // Transaction sub-refs
  userTransactions: (userId: string) => ref(db, `transactions/${userId}`),
  userTransactionItem: (userId: string, transId: string) => ref(db, `transactions/${userId}/${transId}`),

  // Partitioned daily logs
  // Đã PATCH Runtime Contract: Đổi tham số từ `yyyyMM` -> `monthNode` (VD: "daily_logs_2026_05").
  // Loại bỏ tiền tố cứng "daily_logs_" để tránh lỗi Double Prefix.
  dailyLogsPartition: (monthNode: string) => ref(db, `${monthNode}`),
  dailyLogsDate: (monthNode: string, date: string) => ref(db, `${monthNode}/${date}`),
  dailyLogRecord: (monthNode: string, date: string, userId: string) => ref(db, `${monthNode}/${date}/${userId}`),
  dailyTasks: (monthNode: string, date: string, userId: string) => ref(db, `${monthNode}/${date}/${userId}/tasks`),
  dailyTaskItem: (monthNode: string, date: string, userId: string, taskId: string) => ref(db, `${monthNode}/${date}/${userId}/tasks/${taskId}`),
  dailySummary: (monthNode: string, date: string, userId: string) => ref(db, `${monthNode}/${date}/${userId}/summary`),
};
