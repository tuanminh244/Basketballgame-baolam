export type TransactionStatus = 'pending_delivery' | 'delivered' | 'cancelled';

export interface StoreTransaction {
  readonly user_id: string;
  readonly item_type: string;
  readonly item_id: string;
  readonly cost: number;
  readonly status: TransactionStatus;
  readonly created_at: number;
  readonly updated_at: number;
}

// Flat structure matching actual DB schema, aliased to prevent duplicated entities
export type Transaction = StoreTransaction & { readonly id?: string };

// Aggregate state used by hooks and SessionContext
export interface WalletState {
  readonly total_points: number;
  readonly current_xp: number;
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
