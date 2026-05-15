import { push, runTransaction } from 'firebase/database';
import { refs } from '@/lib/firebase/refs';

export async function processPurchaseTransaction(
  userId: string,
  itemId: string,
  cost: number,
  currentBalance: number
): Promise<string> {
  if (currentBalance < cost) {
    throw new Error('Not enough points to process transaction');
  }

  const transRef = push(refs.userTransactions(userId));
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
  const transRef = refs.userTransactionItem(userId, transId);

  await runTransaction(transRef, (currentData) => {
    if (currentData === null) return currentData;
    if (currentData.status !== 'pending_delivery') return;

    currentData.status = 'delivered';
    currentData.updated_at = Date.now();
    return currentData;
  });
}

export async function cancelTransaction(userId: string, transId: string): Promise<void> {
  const transRef = refs.userTransactionItem(userId, transId);

  await runTransaction(transRef, (currentData) => {
    if (currentData === null) return currentData;
    if (currentData.status !== 'pending_delivery') return;

    currentData.status = 'cancelled';
    currentData.updated_at = Date.now();
    return currentData;
  });
}
