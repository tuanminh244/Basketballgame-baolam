import { ref, get } from 'firebase/database';
import { db } from '@/services/firebase/config';

export async function getRewardBatch(batchId: string) {
  const batchRef = ref(db, `reward_batches/${batchId}`);
  const snapshot = await get(batchRef);
  return snapshot.exists() ? snapshot.val() : null;
}

export async function getRewards() {
  const rewardsRef = ref(db, 'rewards');
  const snapshot = await get(rewardsRef);
  return snapshot.exists() ? snapshot.val() : null;
}
