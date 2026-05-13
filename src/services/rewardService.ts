import { ref, get } from 'firebase/database';
import { db } from '@/lib/firebase/config';

export async function getRewardBatch(batchId: string): Promise<any | null> {
  const batchRef = ref(db, `reward_batches/${batchId}`);
  const snapshot = await get(batchRef);
  return snapshot.exists() ? snapshot.val() : null;
}

export async function getRewards(): Promise<any | null> {
  const rewardsRef = ref(db, 'rewards');
  const snapshot = await get(rewardsRef);
  return snapshot.exists() ? snapshot.val() : null;
}
