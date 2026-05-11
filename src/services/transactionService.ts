import { ref, push, runTransaction } from 'firebase/database';
import { db } from '@/services/firebase/config';

export async function createPurchaseTransaction(
  userId: string,
  itemType: string,
  itemId: string,
  cost: number
) {
  const transRef = push(ref(db, `transactions/${userId}`));

  return runTransaction(transRef, (currentData) => {
    if (currentData !== null) return;

    const now = Date.now();
    return {
      user_id: userId,
      item_type: itemType,
      item_id: itemId,
      cost: cost,
      status: 'pending_delivery',
      created_at: now,
      updated_at: now
    };
  });
}

export async function markTransactionDelivered(userId: string, transId: string) {
  const transRef = ref(db, `transactions/${userId}/${transId}`);

  return runTransaction(transRef, (currentData) => {
    if (currentData === null) return currentData;
    if (currentData.status !== 'pending_delivery') return;

    currentData.status = 'delivered';
    currentData.updated_at = Date.now();
    return currentData;
  });
}

export async function cancelTransaction(userId: string, transId: string) {
  const transRef = ref(db, `transactions/${userId}/${transId}`);

  return runTransaction(transRef, (currentData) => {
    if (currentData === null) return currentData;
    if (currentData.status !== 'pending_delivery') return;

    currentData.status = 'cancelled';
    currentData.updated_at = Date.now();
    return currentData;
  });
}
