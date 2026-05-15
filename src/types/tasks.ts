export type TaskStatus = 'todo' | 'pending' | 'approved' | 'rejected';

export interface DailyTask {
  readonly status: TaskStatus;
  readonly xp_earned: number;
  readonly point_earned: number;
  readonly updated_at: number;
  readonly verified_by?: string;
}

// Canonical alias for UI layer terminology
export type TaskLog = DailyTask;

// Flat object representing the runtime spread of a task with its identity
export interface ApprovalQueueItem extends DailyTask {
  readonly id: string;
  readonly userId: string;
}
