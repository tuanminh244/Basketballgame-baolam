export type TaskDifficulty = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type TaskStatus = 'todo' | 'pending' | 'approved' | 'rejected';

export type SummaryStatus = 'ongoing' | 'incomplete' | 'partial' | 'completed';

export interface DailyTask {
  readonly status: TaskStatus;
  readonly xp_earned: number;
  readonly point_earned: number;
  readonly updated_at: number;
  readonly verified_by?: string;
}

export interface DailySummary {
  readonly status: SummaryStatus;
  readonly completion_rate: number;
  readonly reward_78_unlocked: boolean;
  readonly reward_100_unlocked: boolean;
  readonly xp_granted: number;
  readonly points_granted: number;
}

export interface DailyLog {
  readonly tasks: Record<string, DailyTask>;
  readonly summary: DailySummary;
}

export interface TaskTemplate {
  readonly owner_id: string;
  readonly name: string;
  readonly difficulty_level: TaskDifficulty;
  readonly xp_reward: number;
  readonly point_reward: number;
}

export interface StreakInfo {
  readonly current_streak: number;
}

export interface TaskValidationResult {
  readonly is_valid: boolean;
  readonly error?: string;
}
