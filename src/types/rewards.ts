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

/**
 * UI-only display type. Does not map to Firebase schema.
 */
export interface BadgeDisplay {
  readonly name: string;
  readonly image_url: string;
  readonly date_earned: number;
}
