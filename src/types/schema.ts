// [AUTHORITY CONTRACT] Schema production chuẩn
export type TaskStatus = 'todo' | 'pending' | 'approved' | 'rejected';
export type UserRole = 'player' | 'checker' | 'admin';

export interface User {
  uid: string;
  name: string;
  role: UserRole;
  // Session field cho checker/admin, KHÔNG phải schema RTDB
  childrenUids?: string[]; 
}

export interface SystemConfig {
  current_month_node: string;
}

export interface TaskNodeReadModel {
  id: string;
  title: string;
  status: TaskStatus;
  xp_earned: number;
  point_earned: number;
  updated_at?: number;
  verified_by?: string;
}

export interface DailySummaryNode {
  completion_rate: number;
  status: 'ongoing' | 'incomplete' | 'partial' | 'completed';
  reward_78_unlocked: boolean;
  reward_100_unlocked: boolean;
  xp_granted: number;
  points_granted: number;
}

export interface UserStatsNode {
  current_streak: number;
  level: number;
  current_xp: number;
  total_points: number;
}
