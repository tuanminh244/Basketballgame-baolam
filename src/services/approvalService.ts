import { ref, runTransaction } from 'firebase/database';
import { db } from '@/services/firebase/config';

export async function approveTaskAtomic(
  monthNode: string,
  date: string,
  userId: string,
  taskId: string,
  approve: boolean,
  checkerId: string
) {
  const taskRef = ref(
    db,
    `${monthNode}/${date}/${userId}/tasks/${taskId}`
  );

  return runTransaction(taskRef, (currentData) => {
    if (currentData === null) {
      return currentData;
    }

    // FIREBASE RULE STRICT CHECK
    // Only allow pending -> approved/rejected
    if (currentData.status !== 'pending') {
      return;
    }

    currentData.status = approve ? 'approved' : 'rejected';
    currentData.updated_at = Date.now();
    currentData.verified_by = checkerId;

    return currentData;
  });
}
