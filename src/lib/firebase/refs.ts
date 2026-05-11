import { ref } from 'firebase/database';
import { db } from './config';

// Centralized Firebase database refs
// Ánh xạ cấu trúc siêu nghiêm ngặt (Strict schema mapping) theo FIREBASE_SCHEMA_LOCK.md

export const refs = {
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

  // Dynamic user nodes
  user: (userId: string) => ref(db, `users/${userId}`),
  userStats: (userId: string) => ref(db, `users/${userId}/stats`),
  // LƯU Ý: Các trường của User được lưu trực tiếp dưới users/{uid}
  // Không có node profile lồng nhau nào được phép tồn tại theo schema lock.

  // Transaction sub-refs
  userTransactions: (userId: string) => ref(db, `transactions/${userId}`),
  userTransactionItem: (userId: string, transId: string) => ref(db, `transactions/${userId}/${transId}`),

  // Partitioned daily logs
  dailyLogsPartition: (yyyyMM: string) => ref(db, `daily_logs_${yyyyMM}`),
  dailyLogRecord: (yyyyMM: string, date: string, userId: string) => ref(db, `daily_logs_${yyyyMM}/${date}/${userId}`),
  dailyTasks: (yyyyMM: string, date: string, userId: string) => ref(db, `daily_logs_${yyyyMM}/${date}/${userId}/tasks`),
  dailyTaskItem: (yyyyMM: string, date: string, userId: string, taskId: string) => ref(db, `daily_logs_${yyyyMM}/${date}/${userId}/tasks/${taskId}`),
  dailySummary: (yyyyMM: string, date: string, userId: string) => ref(db, `daily_logs_${yyyyMM}/${date}/${userId}/summary`),
};
