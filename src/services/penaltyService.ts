import { ref, push } from 'firebase/database';
import { db } from '@/services/firebase/config';

export async function createPenaltyLog(
  userId: string,
  reason: string,
  pointsDeducted: number,
  adminId: string
) {
  const penaltyLogsRef = ref(db, `penalty_logs/${userId}`);
  
  const newPenaltyRef = await push(penaltyLogsRef, {
    user_id: userId,
    reason: reason,
    points_deducted: pointsDeducted,
    created_by: adminId,
    created_at: Date.now()
  });

  return newPenaltyRef.key;
}
