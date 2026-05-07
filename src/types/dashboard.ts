// 1. Dữ liệu vận hành (Frontend được phép aggregate từ tasks node)
export interface OperationalStats {
  total: number;
  pending: number;
  submitted: number;
  approved: number;
  rejected: number;
  estimatedXP: number; 
}

// 2. Dữ liệu chân lý (Frontend CHỈ ĐỌC từ summary node do Cronjob tạo ra)
export interface EconomyAuthorityFlags {
  completionRate: number;
  reward_78_unlocked: boolean;
  reward_100_unlocked: boolean;
}

// 3. Output gộp cho UI render
export interface TaskStats extends OperationalStats, EconomyAuthorityFlags {}

export interface DailyOverview {
  overall: TaskStats;
  children: Record<string, TaskStats>;
}

export interface Task {
  id: string;
  title: string;
  status: string;
  xp_earned: number;
  point_earned: number;
  submitted_at?: number;
  proof?: string;
}

export interface TaskWrapper {
  childUid: string;
  task: Task;
}
