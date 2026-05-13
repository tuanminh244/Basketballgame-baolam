import { ref, push, runTransaction } from 'firebase/database';
import { db } from '@/lib/firebase/config';

export async function processPurchaseTransaction(
  userId: string,
  itemId: string,
  cost: number,
  currentBalance: number
): Promise<string> {
  // Client-side guard (Rule backend sẽ chặn thêm 1 lớp nữa)
  if (currentBalance < cost) {
    throw new Error('Not enough points to process transaction');
  }

  const transRef = push(ref(db, `transactions/${userId}`));
  const now = Date.now();

  await runTransaction(transRef, (currentData) => {
    if (currentData !== null) return;

    return {
      user_id: userId,
      item_id: itemId,
      item_type: 'store',
      cost: cost,
      status: 'pending_delivery',
      created_at: now,
      updated_at: now
    };
  });

  return transRef.key as string;
}

export async function markTransactionDelivered(userId: string, transId: string): Promise<void> {
  const transRef = ref(db, `transactions/${userId}/${transId}`);

  await runTransaction(transRef, (currentData) => {
    if (currentData === null) return currentData;
    if (currentData.status !== 'pending_delivery') return;

    currentData.status = 'delivered';
    currentData.updated_at = Date.now();
    return currentData;
  });
}

export async function cancelTransaction(userId: string, transId: string): Promise<void> {
  const transRef = ref(db, `transactions/${userId}/${transId}`);

  await runTransaction(transRef, (currentData) => {
    if (currentData === null) return currentData;
    if (currentData.status !== 'pending_delivery') return;

    currentData.status = 'cancelled';
    currentData.updated_at = Date.now();
    return currentData;
  });
}
