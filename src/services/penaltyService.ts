import { push } from 'firebase/database';
import { refs } from '@/lib/firebase/refs';

export async function createPenaltyLog(
  userId: string,
  reason: string,
  pointsDeducted: number,
  adminId: string
): Promise<string> {
  const penaltyLogsRef = refs.penaltyLogUser(userId);
    
  const newPenaltyRef = await push(penaltyLogsRef, {
    user_id: userId,
    reason: reason,
    points_deducted: pointsDeducted,
    created_by: adminId,
    created_at: Date.now()
  });

  return newPenaltyRef.key as string;
}
