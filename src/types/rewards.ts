export interface StoreItem {
  readonly name: string;
  readonly cost: number;
  readonly stock: number;
  readonly owner_id: string;
  readonly created_by: string;
  readonly created_at: number;
}

export interface RewardLifecycle {
  readonly unlock_condition: number;
  readonly claim_type: string;
  readonly expiry: 'daily' | 'permanent';
  readonly usage_limit: number;
}

export interface Reward {
  readonly owner_id: string;
  readonly name: string;
  readonly type: string;
  readonly lifecycle: RewardLifecycle;
}

// Aggregate state used by hooks and SessionContext
export interface RewardState {
  readonly reward_78_unlocked: boolean;
  readonly reward_100_unlocked: boolean;
}
