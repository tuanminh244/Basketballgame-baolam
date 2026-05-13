import { ref, runTransaction } from 'firebase/database';
import { db } from '@/lib/firebase/config';
import { TaskStatus } from '@/types';

export async function approveTaskAtomic(
  monthNode: string,
  date: string,
  userId: string,
  taskId: string,
  approve: boolean,
  checkerId: string
): Promise<void> {
  const taskRef = ref(db, `${monthNode}/${date}/${userId}/tasks/${taskId}`);

  await runTransaction(taskRef, (currentData) => {
    if (currentData === null) return currentData;

    // SCHEMA LOCK: Chỉ cho duyệt task đang ở trạng thái pending
    if (currentData.status !== ('pending' as TaskStatus)) {
      return;
    }

    currentData.status = (approve ? 'approved' : 'rejected') as TaskStatus;
    currentData.updated_at = Date.now();
    currentData.verified_by = checkerId;

    return currentData;
  });
}
