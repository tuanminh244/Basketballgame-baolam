export type TransactionStatus = 'pending_delivery' | 'delivered' | 'cancelled';

export interface PenaltyLog {
  readonly user_id: string;
  readonly points_deducted: number;
  readonly reason: string;
  readonly created_by: string;
  readonly created_at: number;
}

export interface StoreTransaction {
  readonly user_id: string;
  readonly item_type: string;
  readonly item_id: string;
  readonly cost: number;
  readonly status: TransactionStatus;
  readonly created_at: number;
  readonly updated_at: number;
}

export interface LevelInfo {
  readonly current_level: number;
  readonly xp_for_next_level: number;
  readonly total_xp_required: number;
}

export interface XPProgress {
  readonly current_xp: number;
  readonly next_level_xp: number;
  readonly percentage: number;
}
