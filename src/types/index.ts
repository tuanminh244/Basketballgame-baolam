export type Role = 'player' | 'checker' | 'admin';
export type TaskStatus = 'todo' | 'pending' | 'approved' | 'rejected';

export interface UserStats {
  level: number;
  current_xp: number;
  total_points: number;
  current_streak: number;
  daily_penalty_accumulated: number;
}

export interface User {
  id: string;
  name: string;
  role: Role;
  stats?: UserStats;
}

export interface TaskLog {
  status: TaskStatus;
  xp_earned: number;
  point_earned: number;
  updated_at: number;
  verified_by?: string;
}

export interface DailySummary {
  completion_rate: number;
  status: string;
  reward_78_unlocked: boolean;
  reward_100_unlocked: boolean;
  xp_granted: number;
  points_granted: number;
}

export interface DailyLog {
  tasks?: Record<string, TaskLog>;
  summary?: DailySummary;
}

export interface SystemConfig {
  timezone: string;
  launch_date: string;
  current_month_node: string;
  level_thresholds: Record<string, number>;
}
