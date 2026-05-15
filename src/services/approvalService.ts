import { runTransaction } from 'firebase/database';
import { refs } from '@/lib/firebase/refs';
import type { TaskStatus } from '@/types';

export async function approveTaskAtomic(
  monthNode: string,
  date: string,
  userId: string,
  taskId: string,
  approve: boolean,
  checkerId: string
): Promise<void> {
  const taskRef = refs.dailyTaskItem(monthNode, date, userId, taskId);

  await runTransaction(taskRef, (currentData) => {
    if (currentData === null) return currentData;

    // SCHEMA LOCK: Chỉ duyệt task đang ở trạng thái 'pending'
    if (currentData.status !== ('pending' as TaskStatus)) {
      return;
    }

    currentData.status = (approve ? 'approved' : 'rejected') as TaskStatus;
    currentData.updated_at = Date.now();
    currentData.verified_by = checkerId;

    return currentData;
  });
}
