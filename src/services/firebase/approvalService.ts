import { ref, runTransaction } from 'firebase/database';
import { database } from './firebaseConfig';

export const approvalService = {
  approveTask: async (
    yyyy_mm: string,
    date: string,
    childUid: string,
    taskId: string,
    parentUid: string
  ) => {
    const taskRef = ref(database, `daily_logs_${yyyy_mm}/${date}/${childUid}/tasks/${taskId}`);

    const result = await runTransaction(taskRef, (currentData) => {
      if (currentData === null) return currentData;
      if (!currentData.status) return; // Corruption Guard

      if (currentData.status !== 'submitted') {
        return; // Abort transaction if state transition is invalid
      }

      return {
        ...currentData,
        status: 'approved',
        approved_at: Date.now(), 
        approved_by: parentUid
      };
    });

    if (!result.committed) {
      throw new Error('Task state invalid, malformed, or already processed.');
    }
    return result;
  },

  rejectTask: async (
    yyyy_mm: string,
    date: string,
    childUid: string,
    taskId: string,
    parentUid: string
  ) => {
    const taskRef = ref(database, `daily_logs_${yyyy_mm}/${date}/${childUid}/tasks/${taskId}`);

    const result = await runTransaction(taskRef, (currentData) => {
      if (currentData === null) return currentData;
      if (!currentData.status) return;

      if (currentData.status !== 'submitted') {
        return; 
      }

      return {
        ...currentData,
        status: 'rejected',
        reviewed_at: Date.now(),
        approved_by: parentUid
      };
    });

    if (!result.committed) {
      throw new Error('Task state invalid, malformed, or already processed.');
    }
    return result;
  }
};
