import { get } from 'firebase/database';
import { refs } from '@/lib/firebase/refs';

export async function getRewardBatch(batchId: string): Promise<any | null> {
  const batchRef = refs.rewardBatch(batchId);
  const snapshot = await get(batchRef);
  return snapshot.exists() ? snapshot.val() : null;
}

export async function getRewards(): Promise<any | null> {
  const rewardsRef = refs.rewards();
  const snapshot = await get(rewardsRef);
  return snapshot.exists() ? snapshot.val() : null;
}
