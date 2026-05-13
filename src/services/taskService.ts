import { ref, runTransaction } from 'firebase/database';
import { db } from '@/lib/firebase/config';
import { TaskStatus } from '@/types';

export async function submitTaskAtomic(
  monthNode: string,
  date: string,
  userId: string,
  taskId: string
): Promise<void> {
  const taskRef = ref(db, `${monthNode}/${date}/${userId}/tasks/${taskId}`);

  await runTransaction(taskRef, (currentData) => {
    if (currentData === null) return currentData;

    // SCHEMA LOCK: Chỉ cho phép trạng thái todo chuyển thành pending
    if (currentData.status !== ('todo' as TaskStatus)) {
      return; 
    }

    currentData.status = 'pending' as TaskStatus;
    currentData.updated_at = Date.now();

    return currentData;
  });
}
