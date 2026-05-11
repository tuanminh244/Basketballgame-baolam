import { ref, runTransaction } from 'firebase/database';
import { db } from '@/services/firebase/config';

export async function submitTaskAtomic(
  monthNode: string,
  date: string,
  userId: string,
  taskId: string
) {
  const taskRef = ref(db, `${monthNode}/${date}/${userId}/tasks/${taskId}`);

  return runTransaction(taskRef, (currentData) => {
    if (currentData === null) {
      return currentData; 
    }

    if (currentData.status !== 'todo') {
      return; 
    }

    currentData.status = 'pending';
    currentData.updated_at = Date.now();

    return currentData;
  });
}
