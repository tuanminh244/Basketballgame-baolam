// [TIMEZONE CORRECTNESS] Strict VN Timezone
export const getTodayKey = (): string => {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' });
};

export const buildUserStatsPath = (uid: string) => `users/${uid}/stats`;

export const buildTasksPath = (monthNode: string, dateKey: string, childUid: string) => 
  `${monthNode}/${dateKey}/${childUid}/tasks`;

export const buildTaskPath = (monthNode: string, dateKey: string, childUid: string, taskId: string) => 
  `${monthNode}/${dateKey}/${childUid}/tasks/${taskId}`;

export const buildSummaryPath = (monthNode: string, dateKey: string, childUid: string) => 
  `${monthNode}/${dateKey}/${childUid}/summary`;

export const SYSTEM_CONFIG_PATH = `system_config`;
